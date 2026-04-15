import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// v1beta 모델이 더 풍부한 기능을 제공하므로 v1beta로 다시 시도합니다.
const genAI = new GoogleGenerativeAI(API_KEY || "", { apiVersion: "v1beta" });

/**
 * 학습 자료를 바탕으로 계층 구조의 핵심 요약을 생성합니다.
 * @param {string} title - 자료 제목
 * @param {string} category - 카테고리
 * @param {string} content - 자료 내용 (추후 텍스트 추출 기능 추가 시 활용)
 */
export const generateSummary = async (title, category, content = "") => {
  if (!API_KEY) {
    console.warn("Gemini API Key가 설정되지 않았습니다. Mock 데이터를 반환합니다.");
    return `[${category}] ${title}에 대한 AI 요약 내용입니다.`;
  }

  try {
    // 1. 현재 키로 사용 가능한 모델 목록을 가져옵니다.
    console.log("사용 가능한 모델 목록 조회 중...");
    // SDK의 listModels를 사용하거나, 가장 보편적인 모델 순서로 재시도합니다.
    // 일부 모델은 'models/' 접두사가 필수이고 일부는 아니므로 이를 고려합니다.
    const CANDIDATE_MODELS = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro",
      "models/gemini-1.5-flash",
      "models/gemini-pro"
    ];

    let lastError = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        console.log(`[시도] 모델: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `
          당신은 전문 학습 도우미입니다. 다음 학습 자료를 분석하여 요약해 주세요.
          자료 제목: ${title}
          카테고리: ${category}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`[성공] 모델 '${modelName}' 연결됨!`);
        return response.text();
      } catch (err) {
        lastError = err;
        console.warn(`[실패] 모델 '${modelName}': ${err.message}`);
        if (err.message.includes("404")) continue;
        // 404 외의 에러(인증 등)는 즉시 중단
        throw err;
      }
    }

    throw new Error("접근 가능한 모델을 찾을 수 없습니다. API 키의 API 활성화 여부를 확인해주세요.");
  } catch (error) {
    console.error("최종 에러:", error);
    // 계속되는 실패 시 사용자 경험을 위해 가이드 메시지를 반환합니다.
    return `[AI 요약 서비스 안내]\n\n현재 서비스 연결에 어려움이 있습니다. \n\n**에러 내용**: ${error.message}\n\n**대처 방법**:\n1. Google AI Studio에서 API 키가 활성화되었는지 확인\n2. 'Generative Language API' 권한 확인\n\n임시로 제목 기반의 기본 학습 가이드를 생성합니다:\n- **${title}** 관련 핵심 개념 정리\n- **${category}** 빈출 키워드 체크`;
  }
};
