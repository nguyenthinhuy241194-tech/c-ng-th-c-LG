import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

// Initialize GoogleGenAI if key is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface PlayerState {
  id: string;
  name: string;
  role: string;
  hp: number;
  maxHp: number;
  status: string;
}

export interface TurnAction {
  playerId: string;
  playerName: string;
  role: string;
  actionText: string;
}

export interface GameContext {
  world: string;
  goal: string;
  currentTurn: number;
  timeOrProgress: string;
  inventory: string[];
  threatLevel: number; // 1 to 5
  players: PlayerState[];
  turnHistory: Array<{
    turn: number;
    situation: string;
    actions: TurnAction[];
    outcome: string;
  }>;
}

// Procedural fallback GM in case AI key is missing or calls fail
function generateFallbackGMResponse(context: GameContext, actions: TurnAction[]) {
  const d20Rolls = actions.map(act => {
    const roll = Math.floor(Math.random() * 20) + 1;
    let description = '';
    let hpChange = 0;

    if (roll === 1) {
      description = `Đại thất bại (1/20): Hành động gặp tai họa bất ngờ!`;
      hpChange = -Math.floor(Math.random() * 15 + 10);
    } else if (roll < 10) {
      description = `Thất bại (D20: ${roll}): Gặp trở ngại lớn, bị thương nhẹ.`;
      hpChange = -Math.floor(Math.random() * 8 + 4);
    } else if (roll < 15) {
      description = `Thành công có điều kiện (D20: ${roll}): Đạt được một phần mục tiêu nhưng tốn sức.`;
      hpChange = -Math.floor(Math.random() * 4);
    } else if (roll < 20) {
      description = `Thành công mỹ mãn (D20: ${roll}): Khéo léo hoàn thành nhiệm vụ xuất sắc!`;
      hpChange = 0;
    } else {
      description = `Đại thành công chí mạng (20/20): Kỳ tích xuất hiện! Nhận thêm lợi thế lớn!`;
      hpChange = +5;
    }

    return {
      playerId: act.playerId,
      playerName: act.playerName,
      roll,
      hpChange,
      evaluation: `${act.playerName} (${act.role}): ${description}`,
    };
  });

  const updatedPlayers = context.players.map(p => {
    const actionResult = d20Rolls.find(r => r.playerId === p.id);
    const hpChange = actionResult ? actionResult.hpChange : 0;
    const newHp = Math.max(0, Math.min(p.maxHp, p.hp + hpChange));
    const status = newHp <= 0 ? 'Hôn mê / Nguy kịch' : newHp < 30 ? 'Bị thương nặng' : newHp < 70 ? 'Mệt mỏi' : 'Khỏe mạnh';
    return {
      ...p,
      hp: newHp,
      status,
    };
  });

  const sampleItems = ['Băng gạc tiệt trùng', 'Chìa khóa rỉ sét', 'Pin năng lượng', 'Bản đồ khu vực', 'Đuốc cứu sinh', 'Bộ đàm tín hiệu'];
  const newInventory = [...context.inventory];
  if (Math.random() > 0.5 && newInventory.length < 8) {
    const randomItem = sampleItems[Math.floor(Math.random() * sampleItems.length)];
    if (!newInventory.includes(randomItem)) {
      newInventory.push(randomItem);
    }
  }

  const nextTurn = context.currentTurn + 1;
  const threatDelta = d20Rolls.some(r => r.roll < 10) ? 1 : 0;
  const newThreat = Math.min(5, Math.max(1, context.threatLevel + threatDelta));

  return {
    gmNarrative: `Sau khi cả 4 thành viên cùng phối hợp hành động, tình thế lập tức biến chuyển dồn dập! Những tiếng động lạ bắt đầu dội lại từ phía hành lang tối. Một ngã rẽ mới xuất hiện kèm theo mùi khét nguy hiểm từ hệ thống trung tâm. Cả nhóm vừa thu thập được thêm manh mối, nhưng thời gian không còn nhiều!`,
    d20Rolls,
    playerUpdates: updatedPlayers,
    newInventory,
    timeOrProgress: `Giai đoạn ${nextTurn} | Tiến độ hoàn thành ${Math.min(100, nextTurn * 20)}%`,
    threatLevel: newThreat,
    challengePrompt: `Thử thách mới xuất hiện ngay trước mắt! Nhóm sẽ đối phó với mối hiểm họa này ra sao? Mỗi người hãy chuẩn bị hành động cho Lượt ${nextTurn}!`,
    isGameEnded: false,
    endSummary: null,
  };
}

// API endpoint for Game Master turns
app.post('/api/gm/action', async (req: Request, res: Response) => {
  try {
    const { context, actions, isEndingRequested } = req.body as {
      context: GameContext;
      actions: TurnAction[];
      isEndingRequested?: boolean;
    };

    if (!context || !actions) {
      return res.status(400).json({ error: 'Missing context or actions' });
    }

    if (!process.env.GEMINI_API_KEY || !ai) {
      // Fallback
      const fallback = generateFallbackGMResponse(context, actions);
      return res.json(fallback);
    }

    // Call Gemini API with model 'gemini-3.8-flash' with timeout safety
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 18000)
    );

    const systemPrompt = `Bạn là Game Master (GM) chuyên nghiệp, kịch tính, công bằng và giàu cảm xúc, đang dẫn dắt một trò chơi nhập vai phiêu lưu tương tác nhóm dành cho 4 người chơi (P1, P2, P3, P4).
Thế giới trò chơi: ${context.world}
Mục tiêu nhóm: ${context.goal}
Lượt hiện tại: ${context.currentTurn}
Thời gian/Tiến độ hiện tại: ${context.timeOrProgress}
Tài nguyên hiện có: ${context.inventory.join(', ') || 'Chưa có vật phẩm đặc biệt'}
Mức độ nguy hiểm (1-5): ${context.threatLevel}/5

Thông tin 4 người chơi:
${context.players.map(p => `- [${p.id}] ${p.name} (${p.role}): HP hiện tại ${p.hp}/${p.maxHp}, Trạng thái: ${p.status}`).join('\n')}

Hành động của 4 người chơi trong lượt này:
${actions.map(a => `- [${a.playerId}] ${a.playerName} (${a.role}): "${a.actionText}"`).join('\n')}

${isEndingRequested ? 'LƯU Ý ĐẶC BIỆT: Người chơi yêu cầu "KẾT THÚC TRÒ CHƠI / TỔNG KẾT ĐIỂM". Hãy tổng kết kết cục của chuyến phiêu lưu (thành công/thất bại tùy diễn biến), đánh giá đóng góp, danh hiệu vinh danh từng người và điểm số chung cuộc!' : ''}

QUY TẮC CỦA GAME MASTER:
1. Đánh giá sự phối hợp nhóm (synergy), sự phù hợp với nghề nghiệp của từng nhân vật và tính ngẫu nhiên.
2. Tung xí ngầu D20 giả định (từ 1 đến 20) cho từng người chơi:
   - 1: Đại thất bại (Critical Fail - sự cố nghiêm trọng, mất HP nhiều)
   - 2-9: Thất bại (gặp trở ngại, mất 5-15 HP nếu nguy hiểm)
   - 10-14: Thành công vừa phải / có trả giá (mất 0-5 HP)
   - 15-19: Thành công tốt (đạt mục tiêu, an toàn)
   - 20: Đại thành công chí mạng (Critical Success - kỳ tích phi thường, có thể hồi máu hoặc nhận item hiếm)
3. Mô tả diễn biến (gmNarrative): 3 đến 5 câu văn phong sống động, gay cấn, lôi cuốn, phản ánh kết quả các hành động.
4. Cập nhật HP cho từng nhân vật (tối đa 100 HP, tối thiểu 0). Nếu hồi phục y tế (do Bác sĩ cứu chữa hoặc vật phẩm), có thể tăng HP.
5. Cập nhật tài nguyên/vật phẩm (thêm vật phẩm mới nhặt được hoặc bỏ vật phẩm đã dùng).
6. Cập nhật Thời gian / Tiến độ (ví dụ: "02:15 AM / Đã giải được 2/3 câu đố" hoặc "Lõi năng lượng 60%").
7. Mức độ nguy hiểm (threatLevel từ 1 đến 5).
8. Đưa ra thử thách hoặc ngã rẽ mới (challengePrompt) cho lượt tiếp theo (khoảng 1-2 câu kịch tính).

Trả về JSON ĐÚNG cấu trúc yêu cầu.`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gmNarrative: {
              type: Type.STRING,
              description: 'Mô tả ngắn gọn diễn biến/tình huống kết quả từ 3-5 câu kịch tính bằng tiếng Việt',
            },
            d20Rolls: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  playerId: { type: Type.STRING },
                  playerName: { type: Type.STRING },
                  roll: { type: Type.INTEGER, description: 'Số xí ngầu 1-20' },
                  hpChange: { type: Type.INTEGER, description: 'Thay đổi HP (âm nếu mất máu, dương nếu hồi máu, 0 nếu không đổi)' },
                  evaluation: { type: Type.STRING, description: 'Nhận xét ngắn về hành động và xí ngầu của người này' },
                },
                required: ['playerId', 'playerName', 'roll', 'hpChange', 'evaluation'],
              },
            },
            playerUpdates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  hp: { type: Type.INTEGER, description: 'HP mới (0-100)' },
                  maxHp: { type: Type.INTEGER },
                  status: { type: Type.STRING, description: 'Trạng thái ngắn gọn (Khỏe mạnh, Trầy xước, Trúng độc, Bất tỉnh...)' },
                },
                required: ['id', 'name', 'role', 'hp', 'maxHp', 'status'],
              },
            },
            newInventory: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Danh sách các vật phẩm nhóm đang sở hữu sau lượt này',
            },
            timeOrProgress: {
              type: Type.STRING,
              description: 'Thời gian hoặc tiến độ nhiệm vụ cập nhật',
            },
            threatLevel: {
              type: Type.INTEGER,
              description: 'Mức độ nguy hiểm từ 1 đến 5',
            },
            challengePrompt: {
              type: Type.STRING,
              description: 'Thách thức hoặc ngã rẽ mới đặt ra cho cả 4 người chơi ở lượt tiếp theo',
            },
            isGameEnded: {
              type: Type.BOOLEAN,
              description: 'True nếu trò chơi kết thúc (chiến thắng hoặc cả nhóm gục ngã hoặc người chơi yêu cầu kết thúc)',
            },
            endSummary: {
              type: Type.OBJECT,
              properties: {
                finalOutcome: { type: Type.STRING, description: 'Chiến thắng vinh quang / Thất bại bi tráng' },
                teamScore: { type: Type.INTEGER, description: 'Điểm số sinh tồn từ 0 đến 1000' },
                mvpPlayer: { type: Type.STRING, description: 'Tên người chơi xuất sắc nhất' },
                achievements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Danh hiệu/thành tựu cho từng người chơi',
                },
                epilogue: { type: Type.STRING, description: 'Đoạn kết sử thi cho cả nhóm' },
              },
            },
          },
          required: [
            'gmNarrative',
            'd20Rolls',
            'playerUpdates',
            'newInventory',
            'timeOrProgress',
            'threatLevel',
            'challengePrompt',
            'isGameEnded',
          ],
        },
      },
    });

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error) {
    console.error('Gemini GM error:', error);
    // Graceful fallback to procedural generator
    const fallback = generateFallbackGMResponse(req.body.context, req.body.actions);
    return res.json(fallback);
  }
});

// API endpoint to generate dramatic intro scene
app.post('/api/gm/intro', async (req: Request, res: Response) => {
  try {
    const { world, goal, players } = req.body;
    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.json({
        introNarrative: `Không khí ngột ngạt bao trùm khi các bạn đặt chân vào thế giới của ${world}. Nhiệm vụ sinh tử của nhóm: "${goal}". Tiếng còi báo động xa xăm rền rĩ, ánh đèn nhấp nháy mờ ảo báo hiệu nguy hiểm cận kề. Trước mắt các bạn là cánh cửa then chốt đang bị kẹt cứng, xung quanh vương vãi những dấu vết hỗn loạn và thiết bị hỏng hóc. Cả 4 người nhìn nhau, nhận thức được rằng một sai lầm nhỏ lúc này cũng có thể trả giá đắt.`,
        firstChallenge: `Các bạn đang đứng giữa tâm điểm nguy cơ. P1, P2, P3, P4 — Mỗi người hãy chọn hành động đầu tiên để phối hợp mở đường sinh tồn!`,
        initialInventory: ['Đèn pin dự phòng', 'Bộ đàm nội bộ', 'Hộp sơ cứu mini', 'Dụng cụ đa năng'],
        initialTime: '00:00 | Khởi đầu hành trình',
      });
    }

    const prompt = `Bạn là Game Master (GM) dẫn dắt mở đầu trò chơi nhập vai phiêu lưu tương tác 4 người chơi.
Thế giới: ${world}
Mục tiêu nhóm: ${goal}
Danh sách 4 người chơi:
${players.map((p: PlayerState) => `- ${p.name} (${p.role})`).join('\n')}

Hãy tạo:
1. Đoạn dẫn dắt mở đầu (introNarrative) cực kỳ kịch tính, hấp dẫn (3-5 câu tiếng Việt). Đặt nhóm vào ngay tình thế hiểm nghèo, căng thẳng.
2. Thách thức đầu tiên (firstChallenge): Nêu câu hỏi trực tiếp để hỏi 4 người chơi sẽ làm gì đầu tiên.
3. 3-4 vật phẩm khởi đầu phù hợp thế giới (initialInventory).
4. Mốc thời gian ban đầu (initialTime).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            introNarrative: { type: Type.STRING },
            firstChallenge: { type: Type.STRING },
            initialInventory: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            initialTime: { type: Type.STRING },
          },
          required: ['introNarrative', 'firstChallenge', 'initialInventory', 'initialTime'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    return res.json(data);
  } catch (error) {
    console.error('Error generating intro:', error);
    return res.json({
      introNarrative: `Một bầu không khí căng thẳng nghẹt thở bao trùm không gian ${req.body.world}. Mục tiêu của cả nhóm là "${req.body.goal}". Ánh sáng chập chờn, những âm thanh rợn người bắt đầu xuất hiện xung quanh. Bốn người nhận ra thời gian không còn nhiều, bất kỳ quyết định nào cũng mang tính sống còn!`,
      firstChallenge: `Trước mặt là ngã rẽ đầu tiên đầy cạm bẫy. P1, P2, P3, P4 — mỗi người sẽ làm gì đầu tiên để mở đường cho cả đội?`,
      initialInventory: ['Đèn pin chiếu sáng', 'Hộp cứu thương nhỏ', 'Bộ đàm tầm ngắn', 'Bản đồ cơ bản'],
      initialTime: '00:00 | Bắt đầu chiến dịch',
    });
  }
});

// Setup Vite or static serving
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`RPG Game Master server running at http://localhost:${port}`);
  });
}

setupServer();
