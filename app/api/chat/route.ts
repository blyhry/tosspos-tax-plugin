// DEMO MODE: API 키 없이 실행되는 목(mock) 버전

const mockResponses: { keywords: string[]; response: string }[] = [
  {
    keywords: ["신용카드", "카드", "세액공제", "1.3"],
    response:
      "신용카드발행세액공제는 카드로 결제받은 금액의 1.3%를 세금에서 빼주는 제도예요 💳\n\n박민준 사장님 기준으로 이번 분기 카드 매출이 약 5,525만원이니까 **72만원 정도** 공제받으실 수 있어요!\n\n토스포스 결제 데이터에서 자동으로 계산되니까 별도로 서류 준비하실 필요 없어요.\n\n※ 정확한 세무 처리는 세무사와 상담하시는 것을 권장드려요.",
  },
  {
    keywords: ["의제매입", "식재료", "음식업", "매입"],
    response:
      "의제매입세액공제는 음식업 사장님들이 받을 수 있는 좋은 혜택이에요 🥘\n\n식재료 구매비용의 6/106(약 5.7%)를 세금에서 공제받을 수 있어요. 황금치킨처럼 음식업이시면 당연히 해당되세요!\n\n이번 분기 예상 공제액은 **약 144만원**이에요. 단, 식재료 살 때 세금계산서나 영수증을 꼭 챙겨두셔야 해요.\n\n※ 정확한 세무 처리는 세무사와 상담하시는 것을 권장드려요.",
  },
  {
    keywords: ["부가세", "신고", "언제", "기한", "마감"],
    response:
      "이번 1기 부가세 신고 마감일은 **2026년 4월 25일**이에요 📅\n\nD-43 남았으니까 아직 여유 있으세요! 미리 준비하시면 훨씬 편해요.\n\n준비할 서류:\n• 카드 매출 내역 (토스포스 자동 제공)\n• 식재료 세금계산서\n• 임대차 계약서 및 세금계산서\n\n신고가 부담스러우시면 저희 제휴 세무사를 연결해드릴게요!\n\n※ 정확한 세무 처리는 세무사와 상담하시는 것을 권장드려요.",
  },
  {
    keywords: ["임대료", "임차료", "월세", "건물"],
    response:
      "매장 임대료도 부가세 공제가 돼요! 🏪\n\n단, 임대인(건물주)이 세금계산서를 발행해줘야 해요. 임대료의 10%가 부가세인데, 그걸 돌려받는 거예요.\n\n예를 들어 월세 200만원이면 → 부가세 20만원 → 분기에 60만원 공제!\n\n아직 세금계산서 안 받고 계시면 지금 당장 건물주에게 요청해보세요 😊\n\n※ 정확한 세무 처리는 세무사와 상담하시는 것을 권장드려요.",
  },
  {
    keywords: ["차량", "자동차", "기름", "주유", "차"],
    response:
      "업무용으로 쓰는 차량도 경비 처리가 돼요 🚗\n\n차량 구입비, 보험료, 수리비, 주유비 모두 포함돼요. 연간 한도는 **1,500만원**이에요.\n\n중요한 건 **운행일지**를 꼭 써두셔야 해요! 업무용/개인용 구분이 필요하거든요. 앱으로 간단하게 기록할 수 있어요.\n\n배달 오토바이도 해당될 수 있으니 확인해보세요!\n\n※ 정확한 세무 처리는 세무사와 상담하시는 것을 권장드려요.",
  },
  {
    keywords: ["세무사", "연결", "신청", "도움"],
    response:
      "세무사 연결 도와드릴게요! 👨‍💼\n\n저희 제휴 세무사분들은 음식업 소상공인 전문이에요. 첫 상담은 무료고, 연결 수수료도 없어요.\n\n황금치킨 강남점 기준으로 이번 분기 절세 예상액이 **215만원** 정도 되는데, 세무사가 추가로 더 찾아줄 수도 있어요!\n\n절세팁 탭에서 '세무사 연결 신청하기' 버튼을 눌러보세요 😊\n\n※ 정확한 세무 처리는 세무사와 상담하시는 것을 권장드려요.",
  },
  {
    keywords: ["간편장부", "장부", "기장"],
    response:
      "간편장부는 연 매출이 일정 기준 이하인 소규모 사업자가 쓸 수 있는 간단한 장부예요 📒\n\n음식업 기준으로 직전 연도 매출이 **1억 5천만원 미만**이면 간편장부 대상이에요.\n\n황금치킨 강남점은 분기 매출이 약 6,350만원이니까 연간으로 보면 해당 여부를 확인해보셔야 해요!\n\n간편장부를 쓰면 복식부기보다 훨씬 간단해서 직접 하실 수도 있어요.\n\n※ 정확한 세무 처리는 세무사와 상담하시는 것을 권장드려요.",
  },
];

function getMockResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const mock of mockResponses) {
    if (mock.keywords.some((kw) => lower.includes(kw))) {
      return mock.response;
    }
  }
  return `좋은 질문이에요, 사장님! 😊\n\n"${userMessage}"에 대해 말씀드릴게요.\n\n세금 관련 궁금한 사항은 신용카드 공제, 의제매입세액공제, 부가세 신고 등 다양한 항목이 있어요. 구체적인 항목을 말씀해주시면 더 정확하게 안내해드릴 수 있어요!\n\n또는 절세팁 탭에서 박민준 사장님께 해당되는 공제 항목들을 확인해보세요 👍\n\n※ 정확한 세무 처리는 세무사와 상담하시는 것을 권장드려요.`;
}

// 타이핑 효과를 위해 청크로 나눠서 스트리밍
function streamText(text: string): ReadableStream {
  const words = text.split(" ");
  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? "" : " ") + words[i];
        controller.enqueue(new TextEncoder().encode(chunk));
        await new Promise((r) => setTimeout(r, 30 + Math.random() * 40));
      }
      controller.close();
    },
  });
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];
  const userText = typeof lastMessage.content === "string" ? lastMessage.content : "";
  const response = getMockResponse(userText);
  return new Response(streamText(response), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
