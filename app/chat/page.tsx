"use client";

import { useState, useRef, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { Send, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "신용카드발행세액공제가 뭔가요?",
  "의제매입세액공제 받으려면 어떻게 해야 해요?",
  "부가세 신고는 어떻게 해요?",
  "임대료 부가세도 공제받을 수 있나요?",
];

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "안녕하세요, 박민준 사장님! 👋\n저는 절세이예요. 황금치킨 강남점 세금 관련 궁금한 거 뭐든지 쉽게 알려드릴게요!\n\n아래 자주 묻는 질문을 눌러보시거나, 직접 질문해주세요 😊",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages.filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0), userMessage];

    // Welcome 메시지 제외하고 실제 대화만 API로 전송
    const apiMessages = [...messages.slice(1), userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            content: last.content + text,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "죄송해요, 일시적으로 연결이 안 돼요. 잠시 후 다시 시도해주세요 🙏",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="flex flex-col h-screen pb-16">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 flex items-center justify-between shrink-0 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-toss-blue rounded-full flex items-center justify-center text-lg">
            🤖
          </div>
          <div>
            <p className="text-[15px] font-bold text-toss-text-primary">절세이</p>
            <p className="text-xs text-toss-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-toss-success rounded-full inline-block" />
              답변 준비 완료
            </p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50"
        >
          <RefreshCw size={15} color="#9CA3AF" />
        </button>
      </div>

      {/* 면책 고지 */}
      <div className="bg-yellow-50 px-5 py-2.5 shrink-0">
        <p className="text-[11px] text-yellow-700 text-center">
          ⚠️ AI 답변은 참고용이에요. 실제 신고는 세무사와 상담해주세요.
        </p>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 bg-toss-blue rounded-full flex items-center justify-center text-sm mr-2 mt-1 shrink-0">
                🤖
              </div>
            )}
            <div
              className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-toss-blue text-white rounded-tr-sm"
                  : "bg-white text-toss-text-primary rounded-tl-sm shadow-sm"
              }`}
            >
              {msg.content}
              {msg.role === "assistant" && msg.content === "" && isLoading && (
                <div className="flex gap-1 py-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 추천 질문 */}
        {showSuggestions && (
          <div className="flex flex-col gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-left px-4 py-3 bg-white rounded-xl text-sm text-toss-blue border border-toss-blue-light font-medium hover:bg-toss-blue-light transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="세금 관련 질문을 입력해주세요..."
            rows={1}
            className="flex-1 resize-none bg-gray-50 rounded-xl px-4 py-3 text-sm text-toss-text-primary placeholder-toss-text-hint outline-none max-h-24"
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              input.trim() && !isLoading
                ? "bg-toss-blue"
                : "bg-gray-200"
            }`}
          >
            <Send
              size={16}
              color={input.trim() && !isLoading ? "white" : "#9CA3AF"}
            />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
