import React, { useState, useEffect, useCallback } from "react";

// --- 0. 타입 정의 (TypeScript 에러 완벽 방지) ---
interface QuizItem {
  type: string;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

interface FeedbackState {
  isCorrect: boolean;
  msg: string;
}

interface IconProps {
  className?: string;
}

// --- 1. 자체 제작 아이콘 (lucide-react 설치 없이 바로 작동) ---
const IconTrophy = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 22V18" />
    <path d="M14 22V18" />
    <path d="M18 4H6v11a6 6 0 0 0 12 0V4Z" />
  </svg>
);

const IconCheckCircle = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconXCircle = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const IconChevronRight = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconRotateCcw = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <polyline points="3 3 3 8 8 8" />
  </svg>
);

const IconAward = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const IconPlay = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// --- 2. 오방색 로고 ("우" 글자 진한 초록색) ---
const QuizLogo = ({ className = "w-12 h-12" }: IconProps) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath id="rounded-corners">
        <rect width="100" height="100" rx="24" />
      </clipPath>
    </defs>
    <g clipPath="url(#rounded-corners)">
      <rect x="0" y="0" width="20" height="100" fill="#FF0000" />
      <rect x="20" y="0" width="20" height="100" fill="#FFFF00" />
      <rect x="40" y="0" width="20" height="100" fill="#FFFFFF" />
      <rect x="60" y="0" width="20" height="100" fill="#0000FF" />
      <rect x="80" y="0" width="20" height="100" fill="#000000" />
      <circle cx="50" cy="50" r="30" fill="white" fillOpacity="0.95" />
      <circle cx="50" cy="50" r="26" stroke="#006400" strokeWidth="2.5" />
      <text
        x="50"
        y="62"
        fill="#006400"
        fontSize="32"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        우
      </text>
    </g>
    <rect
      width="100"
      height="100"
      rx="24"
      stroke="rgba(0,0,0,0.15)"
      strokeWidth="1"
    />
  </svg>
);

// --- 3. 퀴즈 데이터 ---
const totalQuizPool: QuizItem[] = [
  {
    type: "맞춤법",
    question: '다음 중 올바른 맞춤법은?\n"일이 너무 황당해서 정말 ( )?"',
    options: ["어이없다", "어의없다"],
    answer: "어이없다",
    explanation: "'어이'는 어처구니를 뜻하며, '어의'는 임금의 의사를 뜻합니다.",
  },
  {
    type: "맞춤법",
    question: "다음 중 올바른 단어는?",
    options: ["며칠", "몇일"],
    answer: "며칠",
    explanation: "'몇 일'이 아닌 '며칠'이 무조건 표준어입니다.",
  },
  {
    type: "맞춤법",
    question: "마음이 무척 ( ).",
    options: ["설레었다", "설레였다"],
    answer: "설레었다",
    explanation: "기본형 '설레다'에 '-었다'가 붙어 '설레었다'가 됩니다.",
  },
  {
    type: "맞춤법",
    question: "다음 중 올바른 표기는?",
    options: ["희한하다", "희안하다"],
    answer: "희한하다",
    explanation: "드물 희(稀), 드물 한(罕)을 사용하여 '희한하다'가 맞습니다.",
  },
  {
    type: "속담",
    question: '빈칸에 들어갈 말은?\n"( ) 말이 고와야 오는 말이 곱다."',
    answer: "가는",
    explanation: "내가 남에게 잘해야 남도 나에게 잘한다는 뜻입니다.",
  },
  {
    type: "순우리말",
    question: "'모르는 사이에 조금씩 조금씩'을 뜻하는 순우리말은?",
    answer: "시나브로",
    explanation: "시나브로는 조금씩 서서히 진행되는 모양을 뜻합니다.",
  },
  {
    type: "띄어쓰기",
    question: "다음 중 띄어쓰기가 올바른 것은?",
    options: ["할 수 있다", "할수있다"],
    answer: "할 수 있다",
    explanation: "'수'는 의존 명사이므로 띄어 써야 합니다.",
  },
  {
    type: "관용어",
    question: "인맥이 넓은 사람을 '( )이 넓다'고 합니다.",
    answer: "발",
    explanation: "사교 범위가 넓어 아는 사람이 많을 때 쓰는 표현입니다.",
  },
  {
    type: "순우리말",
    question: "'세상의 중심'을 뜻하는 순우리말은?",
    answer: "가온누리",
    explanation:
      "가운데를 뜻하는 '가온'과 세상을 뜻하는 '누리'의 합성어입니다.",
  },
  {
    type: "맞춤법",
    question: "다음 중 맞는 표기는?",
    options: ["웬일인지", "왠일인지"],
    answer: "웬일인지",
    explanation: "'왠지'를 제외하고는 모두 '웬'을 씁니다.",
  },
  {
    type: "띄어쓰기",
    question: "다음 중 올바른 띄어쓰기는?",
    options: ["본 대로", "본대로"],
    answer: "본 대로",
    explanation: "의존 명사로 쓰인 '대로'는 앞말과 띄어 씁니다.",
  },
  {
    type: "속담",
    question: '빈칸 완성: "( ) 범 무서운 줄 모른다."',
    answer: "하룻강아지",
    explanation: "무식하면 용감하다는 뜻으로도 쓰입니다.",
  },
  {
    type: "순우리말",
    question: "'바다'를 뜻하는 옛 순우리말은?",
    answer: "아라",
    explanation: "아라는 바다의 고유어입니다.",
  },
  {
    type: "맞춤법",
    question: "내일 ( ).",
    options: ["봬요", "뵈요"],
    answer: "봬요",
    explanation: "'뵈어요'의 준말은 '봬요'입니다.",
  },
  {
    type: "띄어쓰기",
    question: "다음 중 올바른 것은?",
    options: ["집에서처럼", "집에서 처럼"],
    answer: "집에서처럼",
    explanation: "조사는 앞말에 붙여 씁니다.",
  },
  {
    type: "순우리말",
    question: "아이의 성장이 건강한 모양을 뜻하는 말은?",
    answer: "도담도담",
    explanation: "도담도담은 아이가 잘 자라는 모습을 뜻합니다.",
  },
  {
    type: "관용어",
    question: "음식을 적게 먹거나 가릴 때 '( )이 짧다'고 합니다.",
    answer: "입",
    explanation: "식성이 까다롭거나 적게 먹는 것을 뜻합니다.",
  },
  {
    type: "맞춤법",
    question: "오지랖이 ( ).",
    options: ["넓다", "넒다"],
    answer: "넓다",
    explanation: "표준어 표기는 '넓다'입니다.",
  },
  {
    type: "띄어쓰기",
    question: "수량을 나타낼 때 맞는 것은?",
    options: ["세 명", "세명"],
    answer: "세 명",
    explanation: "수 관형사 뒤의 단위 명사는 띄어 씁니다.",
  },
  {
    type: "순우리말",
    question: "반짝이는 잔물결을 뜻하는 말은?",
    answer: "윤슬",
    explanation: "햇빛이나 달빛에 비친 물결을 뜻합니다.",
  },
];

// --- 4. 메인 컴포넌트 ---
export default function App() {
  const [gameState, setGameState] = useState<string>("START");
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [userValue, setUserValue] = useState<string>("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [activeQuizSet, setActiveQuizSet] = useState<QuizItem[]>([]);

  // 자동 디자인(Tailwind) 로드
  useEffect(() => {
    if (!document.getElementById("tailwind-cdn")) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  const startQuiz = useCallback(() => {
    const shuffled = [...totalQuizPool].sort(() => Math.random() - 0.5);
    setActiveQuizSet(shuffled.slice(0, 20));
    setScore(0);
    setCurrentIdx(0);
    setUserValue("");
    setFeedback(null);
    setGameState("PLAYING");
  }, []);

  const restartQuiz = useCallback(() => {
    startQuiz();
  }, [startQuiz]);

  const handleAnswer = (answer: string) => {
    if (feedback || !answer.trim() || activeQuizSet.length === 0) return;

    const currentQuestion = activeQuizSet[currentIdx];
    if (!currentQuestion) return;

    const isCorrect =
      answer.trim().replace(/\s/g, "") ===
      currentQuestion.answer.trim().replace(/\s/g, "");

    if (isCorrect) {
      setScore((prev) => prev + 5);
      setFeedback({ isCorrect: true, msg: "정답입니다! 아주 잘하셨습니다 👏" });
    } else {
      setFeedback({
        isCorrect: false,
        msg: `틀렸습니다. 정답은 [${currentQuestion.answer}]입니다.`,
      });
    }
  };

  const nextQuestion = () => {
    if (currentIdx < activeQuizSet.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setFeedback(null);
      setUserValue("");
    } else {
      setGameState("FINISHED");
    }
  };

  const getFinalMessage = () => {
    if (score >= 90)
      return "훌륭합니다! 우리말 달인에 도전하셔도 되겠습니다 👑";
    if (score >= 70)
      return "아주 잘하셨습니다! 조금만 더 연습하면 최고 수준입니다 👍";
    if (score >= 50)
      return "좋은 도전이었습니다! 꾸준히 하면 실력이 쑥쑥 늘어요 💪";
    return "괜찮습니다! 지금부터가 시작입니다 😊";
  };

  const currentQuestion = activeQuizSet[currentIdx];

  return (
    <div className="min-h-screen bg-[#fcf9f5] flex flex-col items-center justify-center p-4 font-sans text-[#1e293b]">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col min-h-[650px]">
        {/* 상단 헤더 */}
        <div className="bg-[#1d4ed8] p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="flex-1 bg-[#FF0000]"></div>
            <div className="flex-1 bg-[#FFFF00]"></div>
            <div className="flex-1 bg-[#FFFFFF]"></div>
            <div className="flex-1 bg-[#0000FF]"></div>
            <div className="flex-1 bg-[#000000]"></div>
          </div>

          <div className="flex items-center gap-4 mt-1.5">
            <QuizLogo className="w-10 h-10 shadow-sm border border-white/20 rounded-xl overflow-hidden" />
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-tight">
                우리말 겨루기
              </h1>
              <p className="text-blue-100 text-[10px] font-medium tracking-widest uppercase opacity-80">
                Korean Master Challenge
              </p>
            </div>
          </div>
          {gameState === "PLAYING" && (
            <div className="text-right mt-1.5">
              <div className="text-[10px] uppercase tracking-wider opacity-70 font-black">
                누적 점수
              </div>
              <div className="text-2xl font-mono font-black tracking-tighter">
                {score}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col p-8 lg:p-10">
          {gameState === "START" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700">
              <div className="mb-10 relative">
                <QuizLogo className="w-32 h-32 shadow-2xl rounded-3xl" />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tight text-slate-900 break-keep">
                우리말의 아름다움을 겨루다
              </h2>
              <p className="text-slate-500 mb-12 leading-relaxed px-6 font-medium">
                전통 오방색처럼 빛나는 우리말.
                <br />
                스무 고개를 넘어 달인의 경지에 올라보세요.
              </p>
              <div className="w-full space-y-4">
                <button
                  onClick={startQuiz}
                  className="w-full bg-[#1d4ed8] hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xl flex justify-center items-center gap-3 transition-all active:scale-[0.97] shadow-xl shadow-blue-100"
                >
                  <IconPlay className="w-6 h-6 fill-current" /> 겨루기 시작
                </button>
              </div>
            </div>
          )}

          {gameState === "PLAYING" && currentQuestion && (
            <div className="flex-1 flex flex-col animate-in fade-in duration-500">
              <div className="mb-10">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-black text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    문항 {currentIdx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-400 border border-slate-200 px-3 py-1 rounded-lg bg-slate-50">
                    {currentQuestion.type}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-[2px]">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-800 h-full transition-all duration-700 rounded-full"
                    style={{
                      width: `${
                        ((currentIdx + 1) / activeQuizSet.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex-1 mb-10">
                <h3 className="text-2xl lg:text-3xl font-bold leading-tight text-slate-800 whitespace-pre-wrap break-keep">
                  {currentQuestion.question}
                </h3>
              </div>

              <div className="mt-auto">
                {currentQuestion.options ? (
                  <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options.map(
                      (option: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(option)}
                          disabled={feedback !== null}
                          className={`group p-5 text-left rounded-[1.5rem] border-2 transition-all flex justify-between items-center ${
                            feedback
                              ? option === currentQuestion.answer
                                ? "border-green-600 bg-green-50 shadow-md scale-[1.02]"
                                : "border-slate-100 bg-slate-50 opacity-40"
                              : "border-slate-100 hover:border-blue-700 hover:bg-blue-50 active:scale-[0.98] shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-5">
                            <span
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-all ${
                                feedback && option === currentQuestion.answer
                                  ? "bg-green-600 text-white shadow-lg"
                                  : "bg-slate-100 group-hover:bg-blue-700 group-hover:text-white text-slate-500"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="font-bold text-lg lg:text-xl text-slate-800">
                              {option}
                            </span>
                          </div>
                          {feedback && option === currentQuestion.answer && (
                            <IconCheckCircle className="text-green-600 w-7 h-7" />
                          )}
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <div className="relative group">
                    <input
                      type="text"
                      value={userValue}
                      onChange={(e) => setUserValue(e.target.value)}
                      disabled={feedback !== null}
                      placeholder="정답을 입력하세요..."
                      className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-blue-600 focus:bg-white focus:outline-none text-xl lg:text-2xl font-bold transition-all shadow-inner"
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        userValue &&
                        handleAnswer(userValue)
                      }
                    />
                    {!feedback && (
                      <button
                        onClick={() => handleAnswer(userValue)}
                        disabled={!userValue.trim()}
                        className="absolute right-4 top-4 bottom-4 px-8 bg-blue-600 text-white rounded-[1rem] font-black text-lg shadow-xl active:scale-95"
                      >
                        확인
                      </button>
                    )}
                  </div>
                )}
              </div>

              {feedback && (
                <div
                  className={`mt-8 p-7 rounded-[2rem] border-2 shadow-sm animate-in slide-in-from-bottom-6 duration-700 ${
                    feedback.isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className={`p-2.5 rounded-2xl mt-1 shadow-md ${
                        feedback.isCorrect
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {feedback.isCorrect ? (
                        <IconCheckCircle className="w-6 h-6" />
                      ) : (
                        <IconXCircle className="text-red-600 w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-black text-2xl ${
                          feedback.isCorrect ? "text-green-900" : "text-red-900"
                        }`}
                      >
                        {feedback.msg}
                      </p>
                      <div className="mt-3 text-slate-700 text-base leading-relaxed bg-white/60 p-4 rounded-xl border border-white/60">
                        <span className="font-black text-blue-700 mr-2 underline decoration-blue-300 underline-offset-4">
                          해설
                        </span>
                        {currentQuestion.explanation}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={nextQuestion}
                    className="w-full mt-8 bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg flex justify-center items-center gap-3 transition-all shadow-2xl active:scale-[0.98]"
                  >
                    {currentIdx < activeQuizSet.length - 1
                      ? "다음 문제로"
                      : "최종 결과 보기"}{" "}
                    <IconChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          )}

          {gameState === "FINISHED" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
              <div className="relative mb-10">
                <div className="w-28 h-28 bg-yellow-50 rounded-[2.5rem] flex items-center justify-center animate-bounce shadow-2xl shadow-yellow-200/50 border-4 border-white overflow-hidden">
                  <div className="absolute inset-0 opacity-20 flex">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 ${
                          [
                            "bg-[#FF0000]",
                            "bg-[#FFFF00]",
                            "bg-[#FFFFFF]",
                            "bg-[#0000FF]",
                            "bg-[#000000]",
                          ][i]
                        }`}
                      ></div>
                    ))}
                  </div>
                  <IconTrophy className="w-14 h-14 text-yellow-600 relative z-10" />
                </div>
                <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[12px] font-black px-4 py-1.5 rounded-full border-4 border-white shadow-lg">
                  합격
                </div>
              </div>

              <h2 className="text-4xl font-black mb-3 tracking-tight text-slate-900">
                도전 성공!
              </h2>

              <div className="w-full bg-slate-50 border-2 border-slate-100 p-10 rounded-[2.5rem] my-10 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 flex opacity-30">
                  <div className="flex-1 bg-[#FF0000]"></div>
                  <div className="flex-1 bg-[#FFFF00]"></div>
                  <div className="flex-1 bg-[#FFFFFF]"></div>
                  <div className="flex-1 bg-[#0000FF]"></div>
                  <div className="flex-1 bg-[#000000]"></div>
                </div>
                <p className="text-slate-400 uppercase tracking-[0.25em] text-xs font-black mb-4">
                  최종 점수
                </p>
                <div className="flex items-baseline justify-center gap-3">
                  <span className="text-7xl lg:text-8xl font-mono font-black text-blue-700 leading-none drop-shadow-sm">
                    {score}
                  </span>
                  <span className="text-3xl text-slate-300 font-black">
                    / 100
                  </span>
                </div>
              </div>

              <div className="mb-12 px-8">
                <IconAward className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                <p className="text-2xl font-black text-slate-800 mb-3 break-keep">
                  {getFinalMessage()}
                </p>
                <p className="text-slate-400 font-bold italic">
                  당신이 우리말의 진정한 달인입니다.
                </p>
              </div>

              <div className="w-full space-y-4">
                <button
                  onClick={restartQuiz}
                  className="w-full bg-[#1d4ed8] text-white py-6 rounded-2xl font-black text-xl flex justify-center items-center gap-3 hover:bg-blue-800 transition-all active:scale-[0.97] shadow-2xl shadow-blue-200"
                >
                  <IconRotateCcw className="w-6 h-6" /> 다시 도전하기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-slate-400 text-[11px] font-black tracking-widest uppercase opacity-60">
            © 우리말 겨루기 연습장 제작 sodami
          </p>
        </div>
      </div>
    </div>
  );
}
