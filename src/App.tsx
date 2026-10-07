import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TRIG_QUESTIONS, TrigQuestion } from './data/trigQuestions';
import { soundManager } from './utils/sound';
import {
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  Clock,
  Download,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  FastForward,
  X,
  Sparkles,
  Palette,
} from 'lucide-react';

interface PlayerInfo {
  id: number;
  name: string;
  colorName: string;
  themeColor: string;
  glowColor: string;
  keyLabel: string;
  score: number;
}

interface ReviewedQuestionItem {
  id: number;
  q: string;
  category: string;
  difficulty: string;
  formula: string;
  correctText: string;
  explanation: string;
  status: 'Đúng' | 'Sai' | 'Bỏ qua';
  playerResult: string;
  themeColor: string;
}

// Hàm chia bộ bài câu hỏi phân bố đều 100% cho 4 đáp án (A: 25%, B: 25%, C: 25%, D: 25%)
function createBalancedQuestionDeck(): TrigQuestion[] {
  const poolA = TRIG_QUESTIONS.filter(q => q.correctIndex === 0);
  const poolB = TRIG_QUESTIONS.filter(q => q.correctIndex === 1);
  const poolC = TRIG_QUESTIONS.filter(q => q.correctIndex === 2);
  const poolD = TRIG_QUESTIONS.filter(q => q.correctIndex === 3);

  const shuffle = <T,>(arr: T[]): T[] => {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  };

  const sA = shuffle(poolA);
  const sB = shuffle(poolB);
  const sC = shuffle(poolC);
  const sD = shuffle(poolD);

  const deck: TrigQuestion[] = [];
  const minLen = Math.min(sA.length, sB.length, sC.length, sD.length);

  for (let i = 0; i < minLen; i++) {
    // Mỗi gói 4 câu chứa chính xác 1 câu A, 1 câu B, 1 câu C, 1 câu D
    const pack = [sA[i], sB[i], sC[i], sD[i]];
    // Trộn ngẫu nhiên thứ tự trong gói 4 câu để người chơi không đoán trước được thứ tự xuất hiện
    deck.push(...shuffle(pack));
  }

  return deck;
}

export default function App() {
  // Game states
  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'ended'>('intro');
  const [countdownNumber, setCountdownNumber] = useState<number | string>(3);
  const [matchDuration, setMatchDuration] = useState<number>(300); // 5 phút = 300s mặc định
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [bgTheme, setBgTheme] = useState<'notebook' | 'sunny' | 'pastel'>('notebook');
  const [optionLayout, setOptionLayout] = useState<'grid2x2' | 'list'>('grid2x2');

  // Players với linh vật học sinh cấp 3 ngộ nghĩnh
  const [players, setPlayers] = useState<PlayerInfo[]>([
    { id: 1, name: 'P1: Mèo Đỏ Quậy 🐱', colorName: 'Đỏ', themeColor: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.4)', keyLabel: 'W', score: 0 },
    { id: 2, name: 'P2: Cánh Cụt Học Bá 🐧', colorName: 'Xanh Dương', themeColor: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.4)', keyLabel: 'I', score: 0 },
    { id: 3, name: 'P3: Ếch Thông Thái 🐸', colorName: 'Xanh Lá', themeColor: '#10b981', glowColor: 'rgba(16, 185, 129, 0.4)', keyLabel: 'C', score: 0 },
    { id: 4, name: 'P4: Vịt Siêu Quậy 🐥', colorName: 'Vàng', themeColor: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.4)', keyLabel: 'N / ↑', score: 0 },
  ]);

  // Bộ bài câu hỏi phân bố cân bằng
  const questionDeckRef = useRef<TrigQuestion[]>([]);

  // Current Question
  const [questionCounter, setQuestionCounter] = useState<number>(1);
  const [currentQ, setCurrentQ] = useState<TrigQuestion>(TRIG_QUESTIONS[0]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [correctShuffledIdx, setCorrectShuffledIdx] = useState<number>(0);

  // Buzzer system
  const [buzzedPlayerId, setBuzzedPlayerId] = useState<number | null>(null);
  const [buzzCountdown, setBuzzCountdown] = useState<number>(5);
  const [lockedPlayerIds, setLockedPlayerIds] = useState<number[]>([]);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);

  // Review history
  const [reviewedHistory, setReviewedHistory] = useState<ReviewedQuestionItem[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'Đúng' | 'Sai' | 'Bỏ qua'>('all');

  // Canvas ref for fireworks
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const buzzTimerRef = useRef<NodeJS.Timeout | null>(null);
  const matchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle sound
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
    if (next) soundManager.playClick();
  };

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Nạp câu hỏi và chuẩn bị trạng thái lượt
  const loadQuestion = useCallback((q: TrigQuestion) => {
    setCurrentQ(q);
    setShuffledOptions([...q.options]);
    setCorrectShuffledIdx(q.correctIndex);
    setBuzzedPlayerId(null);
    setLockedPlayerIds([]);
    setSelectedOptionIdx(null);
    setEliminatedOptions([]);
    setIsAnswerRevealed(false);
    setFeedback(null);
    setBuzzCountdown(5);
  }, []);

  // Lấy câu hỏi tiếp theo từ bộ bài cân bằng phân bố A-B-C-D
  const nextQuestion = useCallback(() => {
    if (buzzTimerRef.current) clearInterval(buzzTimerRef.current);
    setQuestionCounter(prev => prev + 1);

    if (questionDeckRef.current.length === 0) {
      questionDeckRef.current = createBalancedQuestionDeck();
    }
    const nextQ = questionDeckRef.current.shift() || TRIG_QUESTIONS[0];
    loadQuestion(nextQ);
  }, [loadQuestion]);

  // Record into Review History
  const recordQuestionReview = useCallback((item: ReviewedQuestionItem) => {
    setReviewedHistory(prev => [item, ...prev]);
  }, []);

  // Skip Current Question
  const skipCurrentQuestion = useCallback(() => {
    if (gameState !== 'playing') return;
    soundManager.playClick();
    setIsAnswerRevealed(true);

    recordQuestionReview({
      id: currentQ.id,
      q: currentQ.question,
      category: currentQ.category,
      difficulty: currentQ.difficulty,
      formula: currentQ.formulaPrompt,
      correctText: currentQ.options[currentQ.correctIndex],
      explanation: currentQ.explanation,
      status: 'Bỏ qua',
      playerResult: 'Cả nhóm đã bỏ qua câu hỏi khó',
      themeColor: '#9ca3af',
    });

    setFeedback({
      isCorrect: false,
      text: `Đã bỏ qua câu hỏi! Đáp án: ${currentQ.options[currentQ.correctIndex]}. ${currentQ.explanation}`,
    });

    setTimeout(() => nextQuestion(), 1600);
  }, [gameState, currentQ, nextQuestion, recordQuestionReview]);

  // Start 3-2-1 Countdown
  const startCountdown = () => {
    soundManager.playClick();
    setGameState('countdown');
    setCountdownNumber(3);
    soundManager.playDiceRoll();

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNumber(count);
        soundManager.playDiceRoll();
      } else if (count === 0) {
        setCountdownNumber('CHIẾN!');
        soundManager.playTurnStart();
      } else {
        clearInterval(interval);
        startGame();
      }
    }, 900);
  };

  // Start Match
  const startGame = () => {
    setGameState('playing');
    setTimeLeft(matchDuration);
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 })));
    setReviewedHistory([]);
    setQuestionCounter(1);
    questionDeckRef.current = createBalancedQuestionDeck();
    const firstQ = questionDeckRef.current.shift() || TRIG_QUESTIONS[0];
    loadQuestion(firstQ);
  };

  // Match Timer
  useEffect(() => {
    if (gameState !== 'playing') {
      if (matchTimerRef.current) clearInterval(matchTimerRef.current);
      return;
    }

    matchTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(matchTimerRef.current!);
          endGame(`Hết giờ thi đấu ${Math.floor(matchDuration / 60)} phút!`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    };
  }, [gameState, matchDuration]);

  // Player Buzz Action
  const handleBuzz = useCallback(
    (playerId: number) => {
      if (gameState !== 'playing') return;
      if (buzzedPlayerId !== null) return;
      if (lockedPlayerIds.includes(playerId)) return;

      soundManager.playTurnStart();
      setBuzzedPlayerId(playerId);
      setBuzzCountdown(5);

      if (buzzTimerRef.current) clearInterval(buzzTimerRef.current);
      let count = 5;
      buzzTimerRef.current = setInterval(() => {
        count--;
        setBuzzCountdown(count);
        if (count <= 0) {
          clearInterval(buzzTimerRef.current!);
          handleWrongAnswer(playerId, 'Hết 5 giây suy nghĩ!');
        }
      }, 1000);
    },
    [gameState, buzzedPlayerId, lockedPlayerIds]
  );

  // Submit Answer
  const handleSubmitAnswer = useCallback(
    (chosenIdx: number) => {
      if (gameState !== 'playing' || buzzedPlayerId === null) return;
      if (buzzTimerRef.current) clearInterval(buzzTimerRef.current);

      setSelectedOptionIdx(chosenIdx);
      const isCorrect = chosenIdx === correctShuffledIdx;
      const actingPlayer = players.find(p => p.id === buzzedPlayerId);

      if (isCorrect) {
        setIsAnswerRevealed(true);
        soundManager.playCriticalSuccess();
        setFeedback({
          isCorrect: true,
          text: `Chính xác (+10đ)! ${currentQ.explanation}`,
        });

        recordQuestionReview({
          id: currentQ.id,
          q: currentQ.question,
          category: currentQ.category,
          difficulty: currentQ.difficulty,
          formula: currentQ.formulaPrompt,
          correctText: currentQ.options[currentQ.correctIndex],
          explanation: currentQ.explanation,
          status: 'Đúng',
          playerResult: `${actingPlayer?.name} (${actingPlayer?.colorName}) trả lời chính xác (+10đ)`,
          themeColor: actingPlayer?.themeColor || '#10b981',
        });

        setPlayers(prev => {
          const updated = prev.map(p => (p.id === buzzedPlayerId ? { ...p, score: p.score + 10 } : p));
          const winner = updated.find(p => p.score >= 50);
          if (winner) {
            setTimeout(() => endGame(`${winner.name} (${winner.colorName}) đã đạt mốc 50 điểm trước!`), 1000);
          } else {
            setTimeout(() => nextQuestion(), 1600);
          }
          return updated;
        });
      } else {
        // Trả lời sai: Đánh dấu phương án đó đã bị loại, KHÔNG hiện đáp án đúng, nhường quyền cho các đội khác!
        setEliminatedOptions(prev => (prev.includes(chosenIdx) ? prev : [...prev, chosenIdx]));
        handleWrongAnswer(buzzedPlayerId, 'Trả lời chưa chính xác (-5đ)!', chosenIdx);
      }
    },
    [gameState, buzzedPlayerId, correctShuffledIdx, currentQ, players, nextQuestion, recordQuestionReview]
  );

  // Wrong Answer Handler (-5 điểm)
  const handleWrongAnswer = (playerId: number, reason: string, chosenIdx?: number) => {
    soundManager.playCriticalFail();
    const actingPlayer = players.find(p => p.id === playerId);

    // Trừ 5 điểm (tối thiểu 0 điểm)
    setPlayers(prev =>
      prev.map(p => (p.id === playerId ? { ...p, score: Math.max(0, p.score - 5) } : p))
    );

    const updatedLocked = [...lockedPlayerIds, playerId];
    setLockedPlayerIds(updatedLocked);
    setBuzzedPlayerId(null);
    setSelectedOptionIdx(null);

    // Nếu cả 4 đội đều đã trả lời sai câu này
    if (updatedLocked.length >= 4) {
      setIsAnswerRevealed(true);
      setFeedback({
        isCorrect: false,
        text: `Cả 4 đội đều chưa có câu trả lời đúng! Đáp án đúng là: ${shuffledOptions[correctShuffledIdx]}. ${currentQ.explanation}`,
      });

      recordQuestionReview({
        id: currentQ.id,
        q: currentQ.question,
        category: currentQ.category,
        difficulty: currentQ.difficulty,
        formula: currentQ.formulaPrompt,
        correctText: currentQ.options[currentQ.correctIndex],
        explanation: currentQ.explanation,
        status: 'Sai',
        playerResult: 'Cả 4 đội đều không vượt qua câu này',
        themeColor: '#ef4444',
      });

      setTimeout(() => nextQuestion(), 2400);
    } else {
      // KHÔNG HIỆN ĐÁP ÁN ĐÚNG! Mở chuông lại cho các đội còn lại cướp quyền trả lời!
      const remainingCount = 4 - updatedLocked.length;
      setFeedback({
        isCorrect: false,
        text: `❌ ${actingPlayer?.name} (${actingPlayer?.colorName}) trả lời sai (-5đ)! Chuông đã mở lại cho ${remainingCount} đội còn lại cướp lượt!`,
      });
    }
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      const key = e.key;

      if (key === 's' || key === 'S') {
        skipCurrentQuestion();
        return;
      }

      if (buzzedPlayerId === null) {
        if (key === 'w' || key === 'W') handleBuzz(1);
        else if (key === 'i' || key === 'I') handleBuzz(2);
        else if (key === 'c' || key === 'C') handleBuzz(3);
        else if (key === 'n' || key === 'N' || key === 'ArrowUp') handleBuzz(4);
      } else {
        if (key === '1' || key === 'a' || key === 'A') handleSubmitAnswer(0);
        else if (key === '2' || key === 'b' || key === 'B') handleSubmitAnswer(1);
        else if (key === '3' || key === 'c' || key === 'C') handleSubmitAnswer(2);
        else if (key === '4' || key === 'd' || key === 'D') handleSubmitAnswer(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, buzzedPlayerId, handleBuzz, handleSubmitAnswer, skipCurrentQuestion]);

  // End Game & Trigger Fireworks
  const endGame = (reason: string) => {
    if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    if (buzzTimerRef.current) clearInterval(buzzTimerRef.current);
    setGameState('ended');
    soundManager.playCriticalSuccess();
    startFireworks();
  };

  // Canvas Fireworks effect
  const startFireworks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      radius: number;
      alpha: number;
      decay: number;
    }> = [];

    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14 - 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 4 + 2,
        alpha: 1,
        decay: Math.random() * 0.012 + 0.007,
      });
    }

    let animId: number;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (particles.some(p => p.alpha > 0)) {
        animId = requestAnimationFrame(loop);
      }
    };
    loop();
  };

  const getWinner = () => {
    let topScore = -1;
    let winner = players[0];
    players.forEach(p => {
      if (p.score > topScore) {
        topScore = p.score;
        winner = p;
      }
    });
    return winner;
  };

  const downloadSingleHtml = async () => {
    try {
      const res = await fetch('/game.html');
      const htmlText = await res.text();
      const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DauTruongLuongGiac11_5Phut_4P.html';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error downloading HTML:', e);
    }
  };

  const buzzedPlayer = players.find(p => p.id === buzzedPlayerId);

  const filteredReviewItems = reviewedHistory.filter(item => {
    if (reviewFilter === 'all') return true;
    return item.status === reviewFilter;
  });

  const getThemeBackground = () => {
    if (bgTheme === 'sunny') {
      return {
        background: 'radial-gradient(ellipse at 50% 15%, #fffbeb 0%, #fef3c7 45%, #ecfdf5 85%, #f0fdf4 100%)',
      };
    }
    if (bgTheme === 'pastel') {
      return {
        background: 'radial-gradient(ellipse at 50% 15%, #fdf2f8 0%, #fae8ff 45%, #ecfeff 85%, #f0fdf4 100%)',
      };
    }
    // Mặc định: Vở Ô Ly Trắng Sáng Tươi Tắn
    return {
      background: 'radial-gradient(ellipse at 50% 15%, #ffffff 0%, #f0fdf4 40%, #eff6ff 80%, #f8fafc 100%)',
    };
  };

  return (
    <div
      className={`min-h-screen text-slate-800 flex flex-col font-sans select-none overflow-hidden relative ${
        bgTheme === 'sunny' ? 'bright-pastel-pattern' : 'bright-notebook-pattern'
      }`}
      style={getThemeBackground()}
    >
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* Playful Floating High-School Math Doodles & Cute Stickers (Nền sáng ngộ nghĩnh tuổi học trò) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {/* Chibi Cat Mascot & Formula Top-Left */}
        <div className="absolute top-12 left-6 lg:left-12 animate-float-slow pointer-events-none hidden sm:block">
          <div className="bg-white/95 border-2 border-emerald-300 rounded-2xl p-3 shadow-lg shadow-emerald-100/60 max-w-[220px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🐱</span>
              <span className="text-xs font-black text-emerald-700">Mèo Bác Học</span>
            </div>
            <p className="text-[11px] text-emerald-900 font-medium italic leading-snug">
              &quot;Toán không khó, chỉ tại lười nhớ thôi nè~ (◕‿◕✿)&quot;
            </p>
            <div className="mt-1 text-xs font-serif font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-center">
              sin²α + cos²α = 1 📐
            </div>
          </div>
        </div>

        {/* Trà sữa trân châu cute */}
        <div className="absolute bottom-24 left-8 animate-float-reverse pointer-events-none hidden md:block">
          <div className="bg-white/95 border-2 border-amber-300 rounded-2xl p-2.5 shadow-lg shadow-amber-100/60 flex items-center gap-2.5">
            <span className="text-3xl">🧋</span>
            <div>
              <div className="text-xs font-black text-amber-800">Trà Sữa 100% Đường</div>
              <div className="text-[10px] text-amber-900 font-medium">Bù đường cho não tiết 5 🎒</div>
            </div>
          </div>
        </div>

        {/* Thơ vui lượng giác Top-Right */}
        <div className="absolute top-12 right-6 lg:right-12 animate-float-reverse pointer-events-none hidden sm:block">
          <div className="bg-white/95 border-2 border-sky-300 rounded-2xl p-3 shadow-lg shadow-sky-100/60 max-w-[230px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🐧</span>
              <span className="text-xs font-black text-sky-700">Cánh Cụt Ghi Nhớ</span>
            </div>
            <p className="text-[11px] text-sky-900 font-medium leading-snug">
              🍬 &quot;Sin đi học, Cos khóc than, Thôi đừng khóc, Có kẹo đây!&quot;
            </p>
            <div className="mt-1 text-xs font-serif font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200 text-center">
              tan α = sin α / cos α 📏
            </div>
          </div>
        </div>

        {/* Ê-ke & Compa Bottom-Right */}
        <div className="absolute bottom-24 right-8 animate-float-slow pointer-events-none hidden md:block">
          <div className="bg-white/95 border-2 border-purple-300 rounded-2xl p-2.5 shadow-lg shadow-purple-100/60 flex items-center gap-2.5">
            <span className="text-3xl">📐</span>
            <div>
              <div className="text-xs font-black text-purple-800">Bộ Đôi Ê-ke & Compa</div>
              <div className="text-[10px] text-purple-900 font-medium">Góc nào đo cũng chuẩn 🎯</div>
            </div>
          </div>
        </div>

        {/* Floating bright doodles in background */}
        <div className="absolute top-1/2 left-3 text-3xl font-serif text-teal-600/20 rotate-[-15deg] hidden lg:block">
          cos 2a = 2cos²a - 1 ✨
        </div>
        <div className="absolute top-1/3 right-3 text-3xl font-serif text-amber-600/20 rotate-[12deg] hidden lg:block">
          sin 2a = 2sin a cos a 💡
        </div>
        <div className="absolute bottom-1/3 left-1/4 text-2xl font-serif text-pink-600/20 rotate-[-8deg] hidden xl:block">
          tan(a+b) = (tan a + tan b)/(1 - tan a tan b) 📝
        </div>
        <div className="absolute top-2/3 right-1/4 text-2xl font-serif text-emerald-600/20 rotate-[6deg] hidden xl:block">
          10 Điểm Toán Học Kỳ 💯⭐
        </div>
      </div>

      {/* Top Bar (Nền Sáng Tươi Tắn) */}
      <header className="bg-white/95 border-b border-amber-200/90 px-3 sm:px-4 py-2 flex items-center justify-between z-20 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-amber-300/40">
            🎓
          </div>
          <div>
            <h1 className="font-extrabold text-xs sm:text-base tracking-tight bg-gradient-to-r from-amber-600 via-rose-600 to-sky-600 bg-clip-text text-transparent flex items-center gap-1.5">
              <span>ĐẤU TRƯỜNG LƯỢNG GIÁC 11</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 hidden sm:inline">
                Cấp 3 Vui Nhộn 🧋
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold hidden md:block">
              SGK Kết Nối Tri Thức • 60 Câu Hỏi • <strong className="text-emerald-600">Đúng +10đ</strong> • <strong className="text-rose-600">Sai -5đ</strong> • Đều 25% A-B-C-D
            </p>
          </div>
        </div>

        {/* Center: Match Timer & Balance Tag */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-amber-100/90 border-2 border-amber-300/80 px-3 sm:px-3.5 py-1 rounded-full shadow-inner">
            <Clock className="w-4 h-4 text-amber-700" />
            <span className="font-mono font-black text-xs sm:text-sm text-amber-900">{formatTime(timeLeft)}</span>
          </div>

          <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-[10px] font-black text-emerald-800">
            <span>+10đ / -5đ</span>
            <span className="text-slate-400">•</span>
            <span>Đều 25% A-B-C-D</span>
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Selector */}
          <button
            onClick={() => {
              soundManager.playClick();
              setBgTheme(prev => (prev === 'notebook' ? 'sunny' : prev === 'sunny' ? 'pastel' : 'notebook'));
            }}
            className="p-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Đổi giao diện sáng tuổi học trò"
          >
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">
              {bgTheme === 'notebook' ? 'Vở Ô Ly 📘' : bgTheme === 'sunny' ? 'Nắng Ấm ☀️' : 'Pastel 🍬'}
            </span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setIsReviewOpen(true);
            }}
            className="p-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-50 text-sky-700 border-2 border-sky-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Xem lại các câu hỏi đã chơi và lời giải chi tiết"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>Xem Lại ({reviewedHistory.length})</span>
          </button>

          <button
            onClick={downloadSingleHtml}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-amber-700 border-2 border-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 hidden md:flex shadow-sm"
            title="Tải về file HTML độc lập"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>Lưu File HTML</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 cursor-pointer shadow-sm"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* Main 4-Corner Arena (Nền Sáng Trực Quan) */}
      <main className="flex-1 p-2 sm:p-4 grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 relative z-10">
        {/* Player 1 (Top-Left / Red) */}
        <div
          className={`rounded-3xl border-2 p-3 sm:p-4 flex flex-col justify-between transition-all backdrop-blur-md relative bg-white/95 shadow-md ${
            buzzedPlayerId === 1
              ? 'ring-4 ring-rose-500 scale-[1.02] shadow-2xl shadow-rose-200 border-rose-500 bg-rose-50/60'
              : lockedPlayerIds.includes(1)
              ? 'opacity-40 grayscale border-slate-200 bg-slate-100 pointer-events-none'
              : 'border-rose-300 hover:border-rose-400 shadow-rose-100/50'
          }`}
          style={{ gridColumn: '1', gridRow: '1' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐱</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs sm:text-sm text-rose-600">{players[0].name}</span>
                </div>
                <kbd className="px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200 text-[10px] font-mono font-bold text-rose-700">
                  Phím W
                </kbd>
              </div>
            </div>
            <span className="font-mono font-black text-3xl sm:text-4xl text-rose-600">{players[0].score}</span>
          </div>

          <button
            type="button"
            disabled={gameState !== 'playing' || buzzedPlayerId !== null || lockedPlayerIds.includes(1)}
            onClick={() => handleBuzz(1)}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-sm sm:text-base shadow-lg shadow-rose-300/40 flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <span>BẤM CHUÔNG</span>
            <span className="text-[10px] font-bold opacity-90">Nhấn phím W</span>
          </button>
        </div>

        {/* Center Stage: Question, Formula & Options (Ban đầu) */}
        <div
          className="col-span-1 md:col-span-2 row-span-2 rounded-3xl bg-white/95 border-2 border-slate-200/90 p-3 sm:p-5 flex flex-col justify-between shadow-xl shadow-slate-200/60 relative"
        >
          {/* Category, Difficulty & Counter banner */}
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider uppercase text-rose-600">
                {currentQ.category}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                  currentQ.difficulty === 'Dễ'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : currentQ.difficulty === 'Trung bình'
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300'
                }`}
              >
                {currentQ.difficulty}
              </span>
            </div>
            <span className="text-slate-500 font-mono font-bold text-[11px]">
              Câu {questionCounter} / 60
            </span>
          </div>

          {/* Formula Display Box */}
          <div className="bg-amber-50/70 border-2 border-amber-200/80 rounded-2xl p-3 sm:p-4 text-center my-1.5 space-y-2">
            <p className="text-xs sm:text-sm text-slate-700 font-semibold">{currentQ.question}</p>
            <div className="inline-block bg-white border-2 border-sky-400 text-sky-700 rounded-xl px-5 py-2 font-serif text-lg sm:text-2xl font-black tracking-wide shadow-sm">
              {currentQ.formulaPrompt}
            </div>
          </div>

          {/* Buzzer Alert Status */}
          {buzzedPlayer && (
            <div
              className="py-1.5 px-3 rounded-xl text-center font-black text-xs sm:text-sm animate-pulse mb-1.5 shadow-md"
              style={{
                backgroundColor: buzzedPlayer.themeColor,
                color: '#fff',
              }}
            >
              🔔 {buzzedPlayer.name} ({buzzedPlayer.colorName}) ĐÃ GIÀNH QUYỀN TRẢ LỜI! ({buzzCountdown}s)
            </div>
          )}

          {/* 4 Options: TO RÕ NHƯ CÂU HỎI, TỰ ĐỘNG THU NHỎ PHÔNG CHO CÂU DÀI, NỘI DUNG 1 HÀNG (WHITESPACE-NOWRAP) */}
          <div className={`grid ${optionLayout === 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-2.5 sm:gap-3 my-2 w-full`}>
            {shuffledOptions.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isCorrect = idx === correctShuffledIdx;
              const isEliminated = eliminatedOptions.includes(idx);

              // Tự động điều chỉnh kích thước phông chữ: câu trả lời dài thì cho bé phông chữ lại
              let fontScaleClass = 'text-base sm:text-xl tracking-wide';
              if (opt.length > 25) {
                // Rất dài (> 25 ký tự): cho bé phông lại để vừa vặn, không bị tràn (12px - 13.5px)
                fontScaleClass = 'text-xs sm:text-[13px] md:text-sm tracking-tight';
              } else if (opt.length > 15) {
                // Dài vừa (16 - 25 ký tự): thu nhỏ vừa phải (13.5px - 15.5px)
                fontScaleClass = 'text-xs sm:text-[15px] tracking-normal';
              }

              let btnStyle = 'bg-white hover:bg-sky-50/70 border-2 border-slate-300 hover:border-sky-400 text-slate-950 shadow-sm';
              if (isAnswerRevealed) {
                if (isCorrect) btnStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300 shadow-md shadow-emerald-100';
                else if (isEliminated) btnStyle = 'bg-rose-50 border-2 border-rose-300 text-rose-500 line-through opacity-60';
              } else if (isEliminated) {
                // Đã bị một đội chọn sai: gạch ngang đỏ, nhưng CHƯA HIỆN đáp án đúng!
                btnStyle = 'bg-rose-50/80 border-2 border-rose-300 text-rose-500 line-through opacity-60 cursor-not-allowed';
              } else if (buzzedPlayerId !== null) {
                btnStyle = 'bg-amber-50 border-2 border-amber-500 hover:border-amber-600 text-slate-950 ring-2 ring-amber-300/80 shadow-md';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={buzzedPlayerId === null || isEliminated || isAnswerRevealed}
                  onClick={() => handleSubmitAnswer(idx)}
                  className={`px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-2xl font-bold flex items-center justify-between gap-3 transition-all min-h-[60px] active:scale-[0.98] ${
                    buzzedPlayerId === null ? 'cursor-default' : 'cursor-pointer'
                  } ${btnStyle}`}
                >
                  <div className="flex items-center gap-3 min-w-0 overflow-x-auto no-scrollbar">
                    <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg font-mono font-black shadow-inner shrink-0 ${
                      idx === 0 ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                      idx === 1 ? 'bg-sky-100 text-sky-700 border border-sky-300' :
                      idx === 2 ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                      'bg-amber-100 text-amber-700 border border-amber-300'
                    }`}>
                      {letter}
                    </span>
                    {/* Nội dung đáp án: font-serif, tự động thu nhỏ phông khi nội dung dài */}
                    <span className={`font-serif font-black text-slate-950 whitespace-nowrap select-all ${fontScaleClass}`}>
                      {opt}
                    </span>
                  </div>

                  <div className="shrink-0 pl-2">
                    {isEliminated && !isAnswerRevealed ? (
                      <span className="text-[10px] sm:text-xs text-rose-600 font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-rose-100 border border-rose-300 whitespace-nowrap">
                        Sai ✕ (-5đ)
                      </span>
                    ) : isAnswerRevealed && isCorrect ? (
                      <span className="text-[10px] sm:text-xs text-emerald-700 font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 whitespace-nowrap">
                        Đúng ✓ (+10đ)
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300 whitespace-nowrap hidden sm:inline font-bold">
                        Phím {idx + 1}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Skip Button Row & Layout Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-1">
            <button
              type="button"
              onClick={skipCurrentQuestion}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-amber-800 border-2 border-slate-300 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Bỏ qua câu hỏi này nếu quá khó (hoặc bấm phím S)"
            >
              <FastForward className="w-3.5 h-3.5 text-amber-600" />
              <span>Bỏ Qua Câu Này</span>
              <kbd className="px-1.5 py-0.2 rounded bg-white border border-slate-300 text-[10px] text-slate-600 font-mono">
                Phím S
              </kbd>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOptionLayout(l => l === 'grid2x2' ? 'list' : 'grid2x2')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                title="Bấm để đổi kiểu hiển thị 2 Cột hoặc 1 Hàng Ngang dài"
              >
                <span>Bố cục: {optionLayout === 'grid2x2' ? '2 Cột (2x2)' : '1 Hàng Dài'}</span>
              </button>
              <span className="text-[11px] font-bold text-slate-500 hidden md:inline">
                Đua 50 điểm hoặc 5 phút
              </span>
            </div>
          </div>

          {/* Feedback & Guide footer */}
          <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 flex items-center gap-2 min-h-[34px]">
            {feedback ? (
              <div className="flex items-center gap-2">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span className={`font-bold ${feedback.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {feedback.text}
                </span>
              </div>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                Bấm chuông (W, I, C, N) để giành quyền trả lời (+10đ), sai (-5đ), hoặc bấm (S) để Bỏ qua!
              </span>
            )}
          </div>
        </div>

        {/* Player 2 (Top-Right / Blue) */}
        <div
          className={`rounded-3xl border-2 p-3 sm:p-4 flex flex-col justify-between transition-all backdrop-blur-md relative bg-white/95 shadow-md ${
            buzzedPlayerId === 2
              ? 'ring-4 ring-blue-500 scale-[1.02] shadow-2xl shadow-blue-200 border-blue-500 bg-blue-50/60'
              : lockedPlayerIds.includes(2)
              ? 'opacity-40 grayscale border-slate-200 bg-slate-100 pointer-events-none'
              : 'border-blue-300 hover:border-blue-400 shadow-blue-100/50'
          }`}
          style={{ gridColumn: '4', gridRow: '1' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐧</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs sm:text-sm text-blue-600">{players[1].name}</span>
                </div>
                <kbd className="px-1.5 py-0.2 rounded bg-blue-50 border border-blue-200 text-[10px] font-mono font-bold text-blue-700">
                  Phím I
                </kbd>
              </div>
            </div>
            <span className="font-mono font-black text-3xl sm:text-4xl text-blue-600">{players[1].score}</span>
          </div>

          <button
            type="button"
            disabled={gameState !== 'playing' || buzzedPlayerId !== null || lockedPlayerIds.includes(2)}
            onClick={() => handleBuzz(2)}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white font-black text-sm sm:text-base shadow-lg shadow-blue-300/40 flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <span>BẤM CHUÔNG</span>
            <span className="text-[10px] font-bold opacity-90">Nhấn phím I</span>
          </button>
        </div>

        {/* Player 3 (Bottom-Left / Green) */}
        <div
          className={`rounded-3xl border-2 p-3 sm:p-4 flex flex-col justify-between transition-all backdrop-blur-md relative bg-white/95 shadow-md ${
            buzzedPlayerId === 3
              ? 'ring-4 ring-emerald-500 scale-[1.02] shadow-2xl shadow-emerald-200 border-emerald-500 bg-emerald-50/60'
              : lockedPlayerIds.includes(3)
              ? 'opacity-40 grayscale border-slate-200 bg-slate-100 pointer-events-none'
              : 'border-emerald-300 hover:border-emerald-400 shadow-emerald-100/50'
          }`}
          style={{ gridColumn: '1', gridRow: '2' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐸</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs sm:text-sm text-emerald-600">{players[2].name}</span>
                </div>
                <kbd className="px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-bold text-emerald-700">
                  Phím C
                </kbd>
              </div>
            </div>
            <span className="font-mono font-black text-3xl sm:text-4xl text-emerald-600">{players[2].score}</span>
          </div>

          <button
            type="button"
            disabled={gameState !== 'playing' || buzzedPlayerId !== null || lockedPlayerIds.includes(3)}
            onClick={() => handleBuzz(3)}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-300/40 flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <span>BẤM CHUÔNG</span>
            <span className="text-[10px] font-bold opacity-90">Nhấn phím C</span>
          </button>
        </div>

        {/* Player 4 (Bottom-Right / Yellow) */}
        <div
          className={`rounded-3xl border-2 p-3 sm:p-4 flex flex-col justify-between transition-all backdrop-blur-md relative bg-white/95 shadow-md ${
            buzzedPlayerId === 4
              ? 'ring-4 ring-amber-500 scale-[1.02] shadow-2xl shadow-amber-200 border-amber-500 bg-amber-50/60'
              : lockedPlayerIds.includes(4)
              ? 'opacity-40 grayscale border-slate-200 bg-slate-100 pointer-events-none'
              : 'border-amber-300 hover:border-amber-400 shadow-amber-100/50'
          }`}
          style={{ gridColumn: '4', gridRow: '2' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐥</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs sm:text-sm text-amber-600">{players[3].name}</span>
                </div>
                <kbd className="px-1.5 py-0.2 rounded bg-amber-50 border border-amber-200 text-[10px] font-mono font-bold text-amber-700">
                  Phím N / ↑
                </kbd>
              </div>
            </div>
            <span className="font-mono font-black text-3xl sm:text-4xl text-amber-600">{players[3].score}</span>
          </div>

          <button
            type="button"
            disabled={gameState !== 'playing' || buzzedPlayerId !== null || lockedPlayerIds.includes(4)}
            onClick={() => handleBuzz(4)}
            className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 font-black text-sm sm:text-base shadow-lg shadow-amber-300/40 flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            <span>BẤM CHUÔNG</span>
            <span className="text-[10px] font-black opacity-90">Nhấn phím N hoặc ↑</span>
          </button>
        </div>
      </main>

      {/* Intro Modal (Nền Sáng Tươi Sáng) */}
      {gameState === 'intro' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-amber-300 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-2xl space-y-4 text-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 border-2 border-amber-300 flex items-center justify-center text-3xl mx-auto shadow-md">
              🎓
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              ĐẤU TRƯỜNG LƯỢNG GIÁC 11
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-black">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✅ Đúng +10đ • ❌ Sai -5đ
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                ⚖️ Đều 25% A-B-C-D
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                📚 60 Câu SGK KNTT 2018
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Trò chơi Arcade 4 người cùng bấm chuông tranh tài trên 1 màn hình. Trả lời sai <strong className="text-rose-600">-5 điểm</strong> và không lộ đáp án, nhường quyền cho các đội còn lại cướp lượt!
            </p>

            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 text-left text-xs space-y-2">
              <div className="font-black text-amber-900 uppercase tracking-wider mb-1">
                Linh Vật & Phím Bấm 4 Người Chơi:
              </div>
              <div className="flex items-center justify-between">
                <span className="text-rose-600 font-bold">🐱 P1: Mèo Đỏ Quậy (Góc trên trái):</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-rose-300 text-rose-700 font-mono font-bold shadow-sm">
                  Phím W
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-bold">🐧 P2: Cánh Cụt Học Bá (Góc trên phải):</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-blue-300 text-blue-700 font-mono font-bold shadow-sm">
                  Phím I
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-600 font-bold">🐸 P3: Ếch Thông Thái (Góc dưới trái):</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-700 font-mono font-bold shadow-sm">
                  Phím C
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-600 font-bold">🐥 P4: Vịt Siêu Quậy (Góc dưới phải):</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-700 font-mono font-bold shadow-sm">
                  Phím N hoặc ↑
                </kbd>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-amber-200/80">
                <span className="text-amber-800 font-bold">⏭️ Bỏ qua câu khó:</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700 font-mono font-bold shadow-sm">
                  Phím S
                </kbd>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="flex items-center justify-center gap-2 pt-1 text-xs">
              <span className="text-slate-600 font-bold">Thời gian thi đấu:</span>
              <select
                value={matchDuration}
                onChange={e => {
                  const val = Number(e.target.value);
                  setMatchDuration(val);
                  setTimeLeft(val);
                }}
                className="bg-white border-2 border-slate-300 rounded-xl px-2.5 py-1 text-amber-800 font-black focus:outline-none shadow-sm cursor-pointer"
              >
                <option value={300}>5 Phút (Chuẩn 300s)</option>
                <option value={180}>3 Phút (180s)</option>
                <option value={60}>1 Phút (60s)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={startCountdown}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-900 font-black text-base shadow-xl shadow-amber-300/50 cursor-pointer active:scale-95 transition-all"
            >
              BẮT ĐẦU TRANH TÀI (ĐẾM NGƯỢC 3-2-1)
            </button>
          </div>
        </div>
      )}

      {/* Countdown Overlay */}
      {gameState === 'countdown' && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4">
          <div className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-yellow-400 animate-bounce drop-shadow-lg">
            {countdownNumber}
          </div>
          <p className="text-base sm:text-lg font-black text-white mt-4 tracking-wide uppercase">
            Chuẩn bị sẵn tay trên phím bấm!
          </p>
        </div>
      )}

      {/* Review Modal (Nền Sáng) */}
      {isReviewOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border-2 border-slate-300 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600" />
                <h3 className="font-black text-base sm:text-lg text-slate-800">
                  Nhật Ký & Xem Lại Câu Hỏi ({reviewedHistory.length})
                </h3>
              </div>
              <button
                onClick={() => setIsReviewOpen(false)}
                className="p-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 py-3 border-b border-slate-200 text-xs">
              <span className="text-slate-500 font-bold mr-1">Lọc:</span>
              {(['all', 'Đúng', 'Sai', 'Bỏ qua'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setReviewFilter(tab)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    reviewFilter === tab
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab === 'all' ? 'Tất cả' : tab}
                </button>
              ))}
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {filteredReviewItems.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium text-xs sm:text-sm">
                  Chưa có câu hỏi nào trong danh mục này. Hãy tiếp tục giải đố!
                </div>
              ) : (
                filteredReviewItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs shadow-sm"
                    style={{ borderLeftColor: item.themeColor, borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{item.q}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          item.status === 'Đúng'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Sai'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="font-serif text-sm font-black text-sky-700">
                      {item.formula}
                    </div>

                    <div className="text-emerald-700 font-bold">
                      ✓ Đáp án đúng: {item.correctText}
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                      💡 {item.explanation}
                    </p>

                    <div className="text-[10px] font-bold text-slate-500 pt-0.5">
                      • {item.playerResult}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ended / Victory Modal (Nền Sáng Rực Rỡ) */}
      {gameState === 'ended' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl space-y-4 text-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 border-2 border-amber-300 flex items-center justify-center text-3xl mx-auto shadow-md">
              <Trophy className="w-8 h-8 text-amber-600" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-amber-600">
              {getWinner().name} ({getWinner().colorName}) CHIẾN THẮNG!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold">
              Quán Quân Lượng Giác Toán 11 với tổng điểm: <strong className="text-emerald-600 text-base">{getWinner().score} điểm</strong>! Đã hoàn thành 5 phút thi đấu.
            </p>

            {/* Scoreboard table */}
            <div className="grid grid-cols-4 gap-2 py-2">
              {players.map(p => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-2xl bg-slate-50 border-2 flex flex-col items-center shadow-sm"
                  style={{ borderColor: p.themeColor }}
                >
                  <span className="text-[11px] font-black" style={{ color: p.themeColor }}>
                    {p.name.split(':')[0]}
                  </span>
                  <span className="text-2xl font-mono font-black text-slate-800 mt-1">{p.score}đ</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-sky-800 font-black text-xs border border-slate-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-600" /> Xem Lại Câu Hỏi ({reviewedHistory.length})
              </button>
              <button
                type="button"
                onClick={startCountdown}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-900 font-black text-xs shadow-lg shadow-amber-300/50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Chơi Lại Ván Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
