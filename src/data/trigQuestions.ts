export interface TrigQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  formulaPrompt: string;
  options: [string, string, string, string]; // [A, B, C, D]
  correctIndex: number; // 0: A, 1: B, 2: C, 3: D
  explanation: string;
}

// 50 câu hỏi phân bố đều đặn 25% A, 25% B, 25% C, 25% D (chu kỳ A -> B -> C -> D)
export const TRIG_QUESTIONS: TrigQuestion[] = [
  // 1. Hệ thức cơ bản
  {
    id: 1,
    question: 'Hệ thức lượng giác cơ bản nào sau đây ĐÚNG với mọi góc α?',
    category: 'Hệ thức cơ bản',
    difficulty: 'Dễ',
    formulaPrompt: 'sin²α + cos²α = ?',
    options: ['1', '0', '-1', '2'],
    correctIndex: 0, // A
    explanation: 'Với mọi góc α: sin²α + cos²α = 1 (Định lý Pythagoras trên đường tròn lượng giác).',
  },
  {
    id: 2,
    question: 'Công thức liên hệ giữa 1 + tan²α và cos²α là gì?',
    category: 'Hệ thức cơ bản',
    difficulty: 'Dễ',
    formulaPrompt: '1 + tan²α = ?  (α ≠ π/2 + kπ)',
    options: ['1 / sin²α', '1 / cos²α', 'cos²α', '-1 / cos²α'],
    correctIndex: 1, // B
    explanation: '1 + tan²α = 1 + sin²α/cos²α = 1 / cos²α.',
  },
  {
    id: 3,
    question: 'Công thức biểu diễn 1 + cot²α theo sin²α là:',
    category: 'Hệ thức cơ bản',
    difficulty: 'Dễ',
    formulaPrompt: '1 + cot²α = ?  (α ≠ kπ)',
    options: ['1 / cos²α', 'sin²α', '1 / sin²α', '-1 / sin²α'],
    correctIndex: 2, // C
    explanation: '1 + cot²α = 1 + cos²α/sin²α = 1 / sin²α.',
  },
  {
    id: 4,
    question: 'Tích tan α · cot α luôn bằng bao nhiêu khi các biểu thức xác định?',
    category: 'Hệ thức cơ bản',
    difficulty: 'Dễ',
    formulaPrompt: 'tan α · cot α = ?',
    options: ['0', '-1', '2', '1'],
    correctIndex: 3, // D
    explanation: 'tan α · cot α = (sin α / cos α) · (cos α / sin α) = 1.',
  },

  // 2. Cung liên kết
  {
    id: 5,
    question: 'Quy tắc góc đối nhau (Cos đối): cos(-x) bằng gì?',
    category: 'Cung liên kết',
    difficulty: 'Dễ',
    formulaPrompt: 'cos(-x) = ?',
    options: ['cos x', '-cos x', 'sin x', '-sin x'],
    correctIndex: 0, // A
    explanation: 'Cos đối: cos(-x) = cos x.',
  },
  {
    id: 6,
    question: 'Quy tắc góc đối nhau: sin(-x) bằng gì?',
    category: 'Cung liên kết',
    difficulty: 'Dễ',
    formulaPrompt: 'sin(-x) = ?',
    options: ['sin x', '-sin x', 'cos x', '-cos x'],
    correctIndex: 1, // B
    explanation: 'sin(-x) = -sin x (Hàm số sin là hàm lẻ).',
  },
  {
    id: 7,
    question: 'Quy tắc góc bù nhau (Sin bù): cos(π - x) bằng biểu thức nào?',
    category: 'Cung liên kết',
    difficulty: 'Dễ',
    formulaPrompt: 'cos(π - x) = ?',
    options: ['cos x', 'sin x', '-cos x', '-sin x'],
    correctIndex: 2, // C
    explanation: 'Sin bù: chỉ sin giữ nguyên dấu: sin(π - x) = sin x, còn cos(π - x) = -cos x.',
  },
  {
    id: 8,
    question: 'Quy tắc góc bù nhau: sin(π - x) bằng gì?',
    category: 'Cung liên kết',
    difficulty: 'Dễ',
    formulaPrompt: 'sin(π - x) = ?',
    options: ['-sin x', 'cos x', '-cos x', 'sin x'],
    correctIndex: 3, // D
    explanation: 'Sin bù: sin(π - x) = sin x.',
  },
  {
    id: 9,
    question: 'Quy tắc góc phụ nhau (Phụ chéo): sin(π/2 - x) bằng gì?',
    category: 'Cung liên kết',
    difficulty: 'Dễ',
    formulaPrompt: 'sin(π/2 - x) = ?',
    options: ['cos x', '-cos x', 'sin x', '-sin x'],
    correctIndex: 0, // A
    explanation: 'Phụ chéo: sin góc này bằng cos góc kia: sin(π/2 - x) = cos x.',
  },
  {
    id: 10,
    question: 'Quy tắc góc phụ nhau (Phụ chéo): tan(π/2 - x) bằng gì?',
    category: 'Cung liên kết',
    difficulty: 'Dễ',
    formulaPrompt: 'tan(π/2 - x) = ?',
    options: ['tan x', 'cot x', '-cot x', '-tan x'],
    correctIndex: 1, // B
    explanation: 'Phụ chéo: tan(π/2 - x) = cot x.',
  },
  {
    id: 11,
    question: 'Góc hơn kém π: cos(x + π) bằng biểu thức nào sau đây?',
    category: 'Cung liên kết',
    difficulty: 'Trung bình',
    formulaPrompt: 'cos(x + π) = ?',
    options: ['cos x', 'sin x', '-cos x', '-sin x'],
    correctIndex: 2, // C
    explanation: 'cos(x + π) = -cos x.',
  },
  {
    id: 12,
    question: 'Góc hơn kém π: tan(x + π) bằng bao nhiêu?',
    category: 'Cung liên kết',
    difficulty: 'Trung bình',
    formulaPrompt: 'tan(x + π) = ?',
    options: ['-tan x', 'cot x', '-cot x', 'tan x'],
    correctIndex: 3, // D
    explanation: 'Tang tuần hoàn chu kỳ π nên tan(x + π) = tan x.',
  },

  // 3. Công thức cộng
  {
    id: 13,
    question: 'Công thức cộng: sin(a + b) bằng biểu thức nào sau đây?',
    category: 'Công thức cộng',
    difficulty: 'Dễ',
    formulaPrompt: 'sin(a + b) = ?',
    options: [
      'sin a cos b + cos a sin b',
      'sin a cos b - cos a sin b',
      'cos a cos b - sin a sin b',
      'cos a cos b + sin a sin b',
    ],
    correctIndex: 0, // A
    explanation: 'sin(a + b) = sin a cos b + cos a sin b.',
  },
  {
    id: 14,
    question: 'Công thức cộng: sin(a - b) bằng biểu thức nào sau đây?',
    category: 'Công thức cộng',
    difficulty: 'Dễ',
    formulaPrompt: 'sin(a - b) = ?',
    options: [
      'sin a cos b + cos a sin b',
      'sin a cos b - cos a sin b',
      'cos a cos b - sin a sin b',
      'cos a cos b + sin a sin b',
    ],
    correctIndex: 1, // B
    explanation: 'sin(a - b) = sin a cos b - cos a sin b.',
  },
  {
    id: 15,
    question: 'Công thức cộng: cos(a + b) bằng biểu thức nào sau đây?',
    category: 'Công thức cộng',
    difficulty: 'Dễ',
    formulaPrompt: 'cos(a + b) = ?',
    options: [
      'cos a cos b + sin a sin b',
      'sin a cos b + cos a sin b',
      'cos a cos b - sin a sin b',
      'sin a cos b - cos a sin b',
    ],
    correctIndex: 2, // C
    explanation: 'cos cộng bằng cos cos trừ sin sin: cos(a + b) = cos a cos b - sin a sin b.',
  },
  {
    id: 16,
    question: 'Công thức cộng: cos(a - b) bằng biểu thức nào sau đây?',
    category: 'Công thức cộng',
    difficulty: 'Dễ',
    formulaPrompt: 'cos(a - b) = ?',
    options: [
      'cos a cos b - sin a sin b',
      'sin a cos b - cos a sin b',
      'sin a cos b + cos a sin b',
      'cos a cos b + sin a sin b',
    ],
    correctIndex: 3, // D
    explanation: 'cos trừ bằng cos cos cộng sin sin: cos(a - b) = cos a cos b + sin a sin b.',
  },
  {
    id: 17,
    question: 'Công thức cộng: tan(a + b) bằng biểu thức nào sau đây?',
    category: 'Công thức cộng',
    difficulty: 'Trung bình',
    formulaPrompt: 'tan(a + b) = ?',
    options: [
      '(tan a + tan b) / (1 - tan a tan b)',
      '(tan a - tan b) / (1 + tan a tan b)',
      '(tan a + tan b) / (1 + tan a tan b)',
      'tan a + tan b',
    ],
    correctIndex: 0, // A
    explanation: 'tan(a + b) = (tan a + tan b) / (1 - tan a tan b).',
  },
  {
    id: 18,
    question: 'Công thức cộng: tan(a - b) bằng biểu thức nào sau đây?',
    category: 'Công thức cộng',
    difficulty: 'Trung bình',
    formulaPrompt: 'tan(a - b) = ?',
    options: [
      '(tan a + tan b) / (1 - tan a tan b)',
      '(tan a - tan b) / (1 + tan a tan b)',
      '(tan a - tan b) / (1 - tan a tan b)',
      'tan a - tan b',
    ],
    correctIndex: 1, // B
    explanation: 'tan(a - b) = (tan a - tan b) / (1 + tan a tan b).',
  },

  // 4. Công thức nhân đôi
  {
    id: 19,
    question: 'Khẳng định nào sau đây ĐÚNG về công thức cos 2a theo cả cos và sin?',
    category: 'Công thức nhân đôi',
    difficulty: 'Dễ',
    formulaPrompt: 'cos 2a = ?',
    options: [
      'cos²a + sin²a',
      'sin²a - cos²a',
      'cos²a - sin²a',
      '2 cos a sin a',
    ],
    correctIndex: 2, // C
    explanation: 'cos 2a = cos²a - sin²a.',
  },
  {
    id: 20,
    question: 'Công thức nhân đôi: sin 2a bằng biểu thức nào?',
    category: 'Công thức nhân đôi',
    difficulty: 'Dễ',
    formulaPrompt: 'sin 2a = ?',
    options: [
      'sin²a - cos²a',
      '2 sin a',
      'cos²a - sin²a',
      '2 sin a cos a',
    ],
    correctIndex: 3, // D
    explanation: 'sin 2a = 2 sin a cos a.',
  },
  {
    id: 21,
    question: 'Công thức biểu diễn cos 2a chỉ theo cos a là:',
    category: 'Công thức nhân đôi',
    difficulty: 'Dễ',
    formulaPrompt: 'cos 2a = ? (theo cos a)',
    options: [
      '2 cos²a - 1',
      '1 - 2 cos²a',
      'cos²a - 1',
      '2 cos a - 1',
    ],
    correctIndex: 0, // A
    explanation: 'cos 2a = 2 cos²a - 1.',
  },
  {
    id: 22,
    question: 'Công thức biểu diễn cos 2a chỉ theo sin a là:',
    category: 'Công thức nhân đôi',
    difficulty: 'Dễ',
    formulaPrompt: 'cos 2a = ? (theo sin a)',
    options: [
      '2 sin²a - 1',
      '1 - 2 sin²a',
      '1 - sin²a',
      '2 sin a - 1',
    ],
    correctIndex: 1, // B
    explanation: 'cos 2a = 1 - 2 sin²a.',
  },
  {
    id: 23,
    question: 'Công thức nhân đôi cho tan: tan 2a bằng gì?',
    category: 'Công thức nhân đôi',
    difficulty: 'Trung bình',
    formulaPrompt: 'tan 2a = ?',
    options: [
      '2 tan a / (1 + tan²a)',
      '(1 - tan²a) / 2 tan a',
      '2 tan a / (1 - tan²a)',
      'tan²a - 1',
    ],
    correctIndex: 2, // C
    explanation: 'tan 2a = 2 tan a / (1 - tan²a).',
  },

  // 5. Công thức hạ bậc
  {
    id: 24,
    question: 'Công thức hạ bậc: cos²a bằng bao nhiêu?',
    category: 'Công thức hạ bậc',
    difficulty: 'Dễ',
    formulaPrompt: 'cos²a = ?',
    options: [
      '(1 - cos 2a) / 2',
      '(1 + sin 2a) / 2',
      '(1 - sin 2a) / 2',
      '(1 + cos 2a) / 2',
    ],
    correctIndex: 3, // D
    explanation: 'cos²a = (1 + cos 2a) / 2.',
  },
  {
    id: 25,
    question: 'Công thức hạ bậc: sin²a bằng bao nhiêu?',
    category: 'Công thức hạ bậc',
    difficulty: 'Dễ',
    formulaPrompt: 'sin²a = ?',
    options: [
      '(1 - cos 2a) / 2',
      '(1 + cos 2a) / 2',
      '(1 - sin 2a) / 2',
      '1 - cos 2a',
    ],
    correctIndex: 0, // A
    explanation: 'sin²a = (1 - cos 2a) / 2.',
  },
  {
    id: 26,
    question: 'Công thức hạ bậc cho tan: tan²a bằng biểu thức nào?',
    category: 'Công thức hạ bậc',
    difficulty: 'Trung bình',
    formulaPrompt: 'tan²a = ?',
    options: [
      '(1 + cos 2a) / (1 - cos 2a)',
      '(1 - cos 2a) / (1 + cos 2a)',
      '(1 - sin 2a) / (1 + sin 2a)',
      '(1 + sin 2a) / (1 - sin 2a)',
    ],
    correctIndex: 1, // B
    explanation: 'tan²a = sin²a / cos²a = (1 - cos 2a) / (1 + cos 2a).',
  },

  // 6. Tích thành tổng
  {
    id: 27,
    question: 'Biến đổi tích thành tổng: sin a sin b bằng biểu thức nào?',
    category: 'Tích thành tổng',
    difficulty: 'Trung bình',
    formulaPrompt: 'sin a sin b = ?',
    options: [
      '1/2 [cos(a - b) + cos(a + b)]',
      '1/2 [sin(a + b) - sin(a - b)]',
      '1/2 [cos(a - b) - cos(a + b)]',
      '-1/2 [cos(a - b) + cos(a + b)]',
    ],
    correctIndex: 2, // C
    explanation: 'sin a sin b = 1/2 [cos(a - b) - cos(a + b)].',
  },
  {
    id: 28,
    question: 'Biến đổi tích thành tổng: cos a cos b bằng biểu thức nào?',
    category: 'Tích thành tổng',
    difficulty: 'Trung bình',
    formulaPrompt: 'cos a cos b = ?',
    options: [
      '1/2 [cos(a - b) - cos(a + b)]',
      '1/2 [sin(a + b) + sin(a - b)]',
      'cos(a + b) + cos(a - b)',
      '1/2 [cos(a - b) + cos(a + b)]',
    ],
    correctIndex: 3, // D
    explanation: 'cos a cos b = 1/2 [cos(a - b) + cos(a + b)].',
  },
  {
    id: 29,
    question: 'Biến đổi tích thành tổng: sin a cos b bằng biểu thức nào?',
    category: 'Tích thành tổng',
    difficulty: 'Trung bình',
    formulaPrompt: 'sin a cos b = ?',
    options: [
      '1/2 [sin(a + b) + sin(a - b)]',
      '1/2 [sin(a + b) - sin(a - b)]',
      '1/2 [cos(a + b) + cos(a - b)]',
      '1/2 [cos(a + b) - cos(a - b)]',
    ],
    correctIndex: 0, // A
    explanation: 'sin a cos b = 1/2 [sin(a + b) + sin(a - b)].',
  },

  // 7. Tổng thành tích
  {
    id: 30,
    question: 'Biến đổi tổng thành tích: cos u + cos v bằng gì?',
    category: 'Tổng thành tích',
    difficulty: 'Trung bình',
    formulaPrompt: 'cos u + cos v = ?',
    options: [
      '-2 sin((u+v)/2) sin((u-v)/2)',
      '2 cos((u+v)/2) cos((u-v)/2)',
      '2 sin((u+v)/2) cos((u-v)/2)',
      '2 cos((u+v)/2) sin((u-v)/2)',
    ],
    correctIndex: 1, // B
    explanation: 'cos cộng cos bằng 2 cos cos: cos u + cos v = 2 cos((u+v)/2) cos((u-v)/2).',
  },
  {
    id: 31,
    question: 'Biến đổi tổng thành tích: sin u + sin v bằng gì?',
    category: 'Tổng thành tích',
    difficulty: 'Trung bình',
    formulaPrompt: 'sin u + sin v = ?',
    options: [
      '2 cos((u+v)/2) sin((u-v)/2)',
      '2 cos((u+v)/2) cos((u-v)/2)',
      '2 sin((u+v)/2) cos((u-v)/2)',
      '-2 sin((u+v)/2) cos((u-v)/2)',
    ],
    correctIndex: 2, // C
    explanation: 'sin cộng sin bằng 2 sin cos: sin u + sin v = 2 sin((u+v)/2) cos((u-v)/2).',
  },
  {
    id: 32,
    question: 'Biến đổi tổng thành tích: cos u - cos v bằng gì?',
    category: 'Tổng thành tích',
    difficulty: 'Trung bình',
    formulaPrompt: 'cos u - cos v = ?',
    options: [
      '2 sin((u+v)/2) sin((u-v)/2)',
      '2 cos((u+v)/2) sin((u-v)/2)',
      '-2 cos((u+v)/2) cos((u-v)/2)',
      '-2 sin((u+v)/2) sin((u-v)/2)',
    ],
    correctIndex: 3, // D
    explanation: 'cos trừ cos bằng trừ 2 sin sin: cos u - cos v = -2 sin((u+v)/2) sin((u-v)/2).',
  },
  {
    id: 33,
    question: 'Biến đổi tổng thành tích: sin u - sin v bằng gì?',
    category: 'Tổng thành tích',
    difficulty: 'Trung bình',
    formulaPrompt: 'sin u - sin v = ?',
    options: [
      '2 cos((u+v)/2) sin((u-v)/2)',
      '2 sin((u+v)/2) cos((u-v)/2)',
      '-2 sin((u+v)/2) sin((u-v)/2)',
      '2 cos((u+v)/2) cos((u-v)/2)',
    ],
    correctIndex: 0, // A
    explanation: 'sin trừ sin bằng 2 cos sin: sin u - sin v = 2 cos((u+v)/2) sin((u-v)/2).',
  },

  // 8. Góc đặc biệt
  {
    id: 34,
    question: 'Giá trị lượng giác của cos(π/6) (tức 30°) là:',
    category: 'Góc đặc biệt',
    difficulty: 'Dễ',
    formulaPrompt: 'cos(π/6) = ?',
    options: ['1/2', '√3 / 2', '√2 / 2', '0'],
    correctIndex: 1, // B
    explanation: 'cos(π/6) = cos(30°) = √3 / 2.',
  },
  {
    id: 35,
    question: 'Giá trị lượng giác của sin(π/6) (tức 30°) là:',
    category: 'Góc đặc biệt',
    difficulty: 'Dễ',
    formulaPrompt: 'sin(π/6) = ?',
    options: ['√3 / 2', '√2 / 2', '1/2', '1'],
    correctIndex: 2, // C
    explanation: 'sin(π/6) = sin(30°) = 1/2.',
  },
  {
    id: 36,
    question: 'Giá trị lượng giác của cos(π/4) (tức 45°) là:',
    category: 'Góc đặc biệt',
    difficulty: 'Dễ',
    formulaPrompt: 'cos(π/4) = ?',
    options: ['1/2', '√3 / 2', '1', '√2 / 2'],
    correctIndex: 3, // D
    explanation: 'cos(π/4) = sin(π/4) = √2 / 2.',
  },
  {
    id: 37,
    question: 'Giá trị lượng giác của tan(π/4) (tức 45°) là:',
    category: 'Góc đặc biệt',
    difficulty: 'Dễ',
    formulaPrompt: 'tan(π/4) = ?',
    options: ['1', '√3', '√3 / 3', '0'],
    correctIndex: 0, // A
    explanation: 'tan(π/4) = 1.',
  },
  {
    id: 38,
    question: 'Giá trị lượng giác của tan(π/3) (tức 60°) là:',
    category: 'Góc đặc biệt',
    difficulty: 'Dễ',
    formulaPrompt: 'tan(π/3) = ?',
    options: ['√3 / 3', '√3', '1', '1/2'],
    correctIndex: 1, // B
    explanation: 'tan(π/3) = √3.',
  },
  {
    id: 39,
    question: 'Giá trị lượng giác của sin(π/2) (tức 90°) là:',
    category: 'Góc đặc biệt',
    difficulty: 'Dễ',
    formulaPrompt: 'sin(π/2) = ?',
    options: ['0', '-1', '1', '1/2'],
    correctIndex: 2, // C
    explanation: 'sin(π/2) = 1, cos(π/2) = 0.',
  },
  {
    id: 40,
    question: 'Giá trị lượng giác của cos(π) (tức 180°) là:',
    category: 'Góc đặc biệt',
    difficulty: 'Dễ',
    formulaPrompt: 'cos(π) = ?',
    options: ['1', '0', '1/2', '-1'],
    correctIndex: 3, // D
    explanation: 'cos(π) = -1, sin(π) = 0.',
  },

  // 9. Hàm số lượng giác & Chu kỳ
  {
    id: 41,
    question: 'Chu kỳ tuần hoàn cơ bản của hàm số y = sin x là:',
    category: 'Hàm số lượng giác',
    difficulty: 'Trung bình',
    formulaPrompt: 'T của y = sin x là ?',
    options: ['2π', 'π', 'π/2', '4π'],
    correctIndex: 0, // A
    explanation: 'Hàm số y = sin x và y = cos x tuần hoàn với chu kỳ cơ sở T = 2π.',
  },
  {
    id: 42,
    question: 'Chu kỳ tuần hoàn cơ bản của hàm số y = tan x là:',
    category: 'Hàm số lượng giác',
    difficulty: 'Trung bình',
    formulaPrompt: 'T của y = tan x là ?',
    options: ['2π', 'π', 'π/2', '3π'],
    correctIndex: 1, // B
    explanation: 'Hàm số y = tan x và y = cot x tuần hoàn với chu kỳ cơ sở T = π.',
  },
  {
    id: 43,
    question: 'Tập xác định của hàm số y = cot x là:',
    category: 'Hàm số lượng giác',
    difficulty: 'Khó',
    formulaPrompt: 'D của y = cot x là ?',
    options: [
      'ℝ \\ {π/2 + kπ, k ∈ ℤ}',
      '[-1; 1]',
      'ℝ \\ {kπ, k ∈ ℤ}',
      'ℝ \\ {π/2 + k2π, k ∈ ℤ}',
    ],
    correctIndex: 2, // C
    explanation: 'cot x = cos x / sin x xác định khi sin x ≠ 0 <=> x ≠ kπ (k ∈ ℤ).',
  },
  {
    id: 44,
    question: 'Tập xác định của hàm số y = tan x là:',
    category: 'Hàm số lượng giác',
    difficulty: 'Khó',
    formulaPrompt: 'D của y = tan x là ?',
    options: [
      'ℝ \\ {kπ, k ∈ ℤ}',
      'ℝ \\ {k2π, k ∈ ℤ}',
      '[-1; 1]',
      'ℝ \\ {π/2 + kπ, k ∈ ℤ}',
    ],
    correctIndex: 3, // D
    explanation: 'tan x = sin x / cos x xác định khi cos x ≠ 0 <=> x ≠ π/2 + kπ (k ∈ ℤ).',
  },
  {
    id: 45,
    question: 'Tập giá trị của hàm số y = 3 sin x - 2 là:',
    category: 'Hàm số lượng giác',
    difficulty: 'Khó',
    formulaPrompt: 'Tập giá trị của y = 3 sin x - 2 là ?',
    options: ['[-5; 1]', '[-1; 5]', '[-3; 3]', '[-5; 5]'],
    correctIndex: 0, // A
    explanation: '-1 ≤ sin x ≤ 1 => -3 ≤ 3 sin x ≤ 3 => -5 ≤ 3 sin x - 2 ≤ 1.',
  },

  // 10. Phương trình lượng giác cơ bản
  {
    id: 46,
    question: 'Nghiệm của phương trình lượng giác sin x = 0 là:',
    category: 'Phương trình lượng giác',
    difficulty: 'Trung bình',
    formulaPrompt: 'sin x = 0 <=> x = ?',
    options: [
      'k2π (k ∈ ℤ)',
      'kπ (k ∈ ℤ)',
      'π/2 + kπ (k ∈ ℤ)',
      'π + k2π (k ∈ ℤ)',
    ],
    correctIndex: 1, // B
    explanation: 'sin x = 0 <=> x = kπ (k ∈ ℤ).',
  },
  {
    id: 47,
    question: 'Nghiệm của phương trình lượng giác sin x = 1 là:',
    category: 'Phương trình lượng giác',
    difficulty: 'Trung bình',
    formulaPrompt: 'sin x = 1 <=> x = ?',
    options: [
      'k2π (k ∈ ℤ)',
      'π/2 + kπ (k ∈ ℤ)',
      'π/2 + k2π (k ∈ ℤ)',
      '-π/2 + k2π (k ∈ ℤ)',
    ],
    correctIndex: 2, // C
    explanation: 'sin x = 1 <=> x = π/2 + k2π (k ∈ ℤ).',
  },
  {
    id: 48,
    question: 'Nghiệm của phương trình lượng giác cos x = 0 là:',
    category: 'Phương trình lượng giác',
    difficulty: 'Trung bình',
    formulaPrompt: 'cos x = 0 <=> x = ?',
    options: [
      'kπ (k ∈ ℤ)',
      'k2π (k ∈ ℤ)',
      'π/2 + k2π (k ∈ ℤ)',
      'π/2 + kπ (k ∈ ℤ)',
    ],
    correctIndex: 3, // D
    explanation: 'cos x = 0 <=> x = π/2 + kπ (k ∈ ℤ).',
  },
  {
    id: 49,
    question: 'Nghiệm của phương trình lượng giác tan x = 1 là:',
    category: 'Phương trình lượng giác',
    difficulty: 'Trung bình',
    formulaPrompt: 'tan x = 1 <=> x = ?',
    options: [
      'π/4 + kπ (k ∈ ℤ)',
      'π/4 + k2π (k ∈ ℤ)',
      '-π/4 + kπ (k ∈ ℤ)',
      'kπ (k ∈ ℤ)',
    ],
    correctIndex: 0, // A
    explanation: 'tan x = 1 = tan(π/4) <=> x = π/4 + kπ (k ∈ ℤ).',
  },
  {
    id: 50,
    question: 'Phương trình sin x = m có nghiệm khi nào?',
    category: 'Phương trình lượng giác',
    difficulty: 'Khó',
    formulaPrompt: 'sin x = m có nghiệm khi ?',
    options: [
      'm ≥ 1',
      '-1 ≤ m ≤ 1',
      'm ≤ -1',
      'm ∈ ℝ',
    ],
    correctIndex: 1, // B
    explanation: 'Tập giá trị của sin x là [-1; 1], do đó phương trình có nghiệm khi -1 ≤ m ≤ 1.',
  },
  {
    id: 51,
    question: 'Nghiệm của phương trình lượng giác cos x = 1 là:',
    category: 'Phương trình lượng giác',
    difficulty: 'Trung bình',
    formulaPrompt: 'cos x = 1 <=> x = ?',
    options: [
      'kπ (k ∈ ℤ)',
      'π/2 + k2π (k ∈ ℤ)',
      'k2π (k ∈ ℤ)',
      'π + k2π (k ∈ ℤ)',
    ],
    correctIndex: 2, // C
    explanation: 'cos x = 1 <=> x = k2π (k ∈ ℤ).',
  },
  {
    id: 52,
    question: 'Nghiệm của phương trình lượng giác cos x = -1 là:',
    category: 'Phương trình lượng giác',
    difficulty: 'Trung bình',
    formulaPrompt: 'cos x = -1 <=> x = ?',
    options: [
      'k2π (k ∈ ℤ)',
      'π/2 + kπ (k ∈ ℤ)',
      '-π/2 + k2π (k ∈ ℤ)',
      'π + k2π (k ∈ ℤ)',
    ],
    correctIndex: 3, // D
    explanation: 'cos x = -1 <=> x = π + k2π (k ∈ ℤ).',
  },
  {
    id: 53,
    question: 'Chu kỳ tuần hoàn của hàm số lượng giác cơ bản y = sin x là bao nhiêu?',
    category: 'Hàm số lượng giác',
    difficulty: 'Dễ',
    formulaPrompt: 'Chu kỳ T của y = sin x là ?',
    options: [
      '2π',
      'π',
      'π/2',
      '4π',
    ],
    correctIndex: 0, // A
    explanation: 'Hàm số lượng giác y = sin x tuần hoàn với chu kỳ nhỏ nhất là T = 2π.',
  },
  {
    id: 54,
    question: 'Chu kỳ tuần hoàn của hàm số lượng giác cơ bản y = cos x là bao nhiêu?',
    category: 'Hàm số lượng giác',
    difficulty: 'Dễ',
    formulaPrompt: 'Chu kỳ T của y = cos x là ?',
    options: [
      'π',
      '2π',
      'π/2',
      '3π',
    ],
    correctIndex: 1, // B
    explanation: 'Hàm số lượng giác y = cos x tuần hoàn với chu kỳ nhỏ nhất là T = 2π.',
  },
  {
    id: 55,
    question: 'Chu kỳ tuần hoàn của hàm số lượng giác y = tan x là bao nhiêu?',
    category: 'Hàm số lượng giác',
    difficulty: 'Dễ',
    formulaPrompt: 'Chu kỳ T của y = tan x là ?',
    options: [
      '2π',
      'π/2',
      'π',
      '4π',
    ],
    correctIndex: 2, // C
    explanation: 'Hàm số y = tan x tuần hoàn với chu kỳ nhỏ nhất là T = π.',
  },
  {
    id: 56,
    question: 'Chu kỳ tuần hoàn của hàm số lượng giác y = cot x là bao nhiêu?',
    category: 'Hàm số lượng giác',
    difficulty: 'Dễ',
    formulaPrompt: 'Chu kỳ T của y = cot x là ?',
    options: [
      '2π',
      'π/2',
      '3π',
      'π',
    ],
    correctIndex: 3, // D
    explanation: 'Hàm số y = cot x tuần hoàn với chu kỳ nhỏ nhất là T = π.',
  },
  {
    id: 57,
    question: 'Nếu sin α + cos α = m thì biểu thức sin 2α bằng bao nhiêu?',
    category: 'Hệ thức cơ bản',
    difficulty: 'Khó',
    formulaPrompt: 'sin α + cos α = m => sin 2α = ?',
    options: [
      'm² - 1',
      '1 - m²',
      'm² + 1',
      '(m² - 1) / 2',
    ],
    correctIndex: 0, // A
    explanation: '(sin α + cos α)² = sin²α + cos²α + 2sin α cos α = 1 + sin 2α = m² => sin 2α = m² - 1.',
  },
  {
    id: 58,
    question: 'Biểu thức hạ bậc: 2sin²(x/2) được viết lại theo cos x là:',
    category: 'Công thức hạ bậc',
    difficulty: 'Trung bình',
    formulaPrompt: '2sin²(x/2) = ?',
    options: [
      '1 + cos x',
      '1 - cos x',
      '1 - sin x',
      'cos x - 1',
    ],
    correctIndex: 1, // B
    explanation: 'Từ cos x = 1 - 2sin²(x/2) suy ra 2sin²(x/2) = 1 - cos x.',
  },
  {
    id: 59,
    question: 'Biểu thức hạ bậc: 2cos²(x/2) được viết lại theo cos x là:',
    category: 'Công thức hạ bậc',
    difficulty: 'Trung bình',
    formulaPrompt: '2cos²(x/2) = ?',
    options: [
      '1 - cos x',
      '1 + sin x',
      '1 + cos x',
      'cos x - 1',
    ],
    correctIndex: 2, // C
    explanation: 'Từ cos x = 2cos²(x/2) - 1 suy ra 2cos²(x/2) = 1 + cos x.',
  },
  {
    id: 60,
    question: 'Phương trình lượng giác cos x = m có nghiệm khi và chỉ khi:',
    category: 'Phương trình lượng giác',
    difficulty: 'Khó',
    formulaPrompt: 'cos x = m có nghiệm <=> ?',
    options: [
      'm ≥ 1',
      'm ≤ -1',
      'm ∈ ℝ',
      '-1 ≤ m ≤ 1',
    ],
    correctIndex: 3, // D
    explanation: 'Tập giá trị của cos x là [-1; 1], nên phương trình cos x = m có nghiệm khi -1 ≤ m ≤ 1.',
  },
];
