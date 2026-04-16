import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// v1beta 모델이 더 풍부한 기능을 제공하므로 v1beta로 다시 시도합니다.
const genAI = new GoogleGenerativeAI(API_KEY || "", { apiVersion: "v1beta" });
 
 // 429 에러 발생 시 대기를 위한 헬퍼 함수
 const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
 
 // AI가 생성한 JSON 문자열의 제어 문자 및 이스케이프 오류를 정제하는 함수
 const cleanJSONString = (str) => {
   return str
     .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // 제어 문자 제거
     .replace(/\\'/g, "'") // 잘못된 홑따옴표 이스케이프 수정
     .replace(/\n/g, " ") // 줄바꿈을 공백으로 대체 (JSON 문자열 내부 줄바꿈 방지)
     .trim();
 };

/**
 * 학습 자료(텍스트 또는 파일)를 바탕으로 계층 구조의 핵심 요약을 생성합니다.
 * @param {string} title - 자료 제목
 * @param {string} category - 카테고리
 * @param {object} fileData - { data: string, mimeType: string } 형태의 파일 데이터
 */
export const generateSummary = async (title, category, fileData = null) => {
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
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite-preview",
      "gemini-1.5-flash"
    ];

    let lastError = null;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        console.log(`[시도] 모델: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `
          당신은 전문 학습 도우미입니다. 첨부된 학습 자료를 분석하여 마크다운(.md) 형식의 고품질 학습 요약본을 생성해 주세요.
          
          [자료 정보]
          제목: ${title}
          카테고리: ${category}
          
          [출력 가이드라인]
          1. **구조화된 요약**: [대주제 > 소주제 > 핵심 키워드] 순서로 계층형 마크다운으로 작성하세요.
          2. **시각적 강조**: 중요한 개념이나 용어는 **굵게** 표시하거나 \`코드 블록\` 형식을 활용하여 강조하세요.
          3. **불렛 포인트 활용**: 긴 문장보다는 간결한 불렛 포인트를 사용하여 가독성을 높이세요.
          4. **핵심 요약**: 도입부나 맺음말 없이 바로 본론 요약부터 시작하세요.
          5. **언어**: 한국어로 전문적이고 이해하기 쉽게 작성하세요.
          
          출력 형식 예시:
          # ${title} 요약
          ## 1. 개요
          - 핵심 내용 설명...
          ## 2. 세부 개념
          - **용어**: 설명...
        `;

        let parts = [{ text: prompt }];
        
        // 파일 데이터가 있으면 멀티모달 입력으로 처리
        if (fileData && fileData.data && fileData.mimeType) {
          parts.push({
            inlineData: {
              data: fileData.data,
              mimeType: fileData.mimeType
            }
          });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        console.log(`[성공] 모델 '${modelName}' 연결됨!`);
        return response.text();
      } catch (err) {
        lastError = err;
        console.warn(`[실패] 모델 '${modelName}': ${err.message}`);
        
        // 404(없음) 또는 429(할당량 초과) 발생 시 다음 후보 모델로 시도합니다.
        if (err.message.includes("404") || err.message.includes("429")) {
          console.log(`모델 '${modelName}' 실패. 다른 모델로 재시도합니다...`);
          continue;
        }
        
        // 그 외의 치명적 에러(인증 실패 등)는 즉시 중단
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
/**
 * 학습 자료(요약본 또는 원본 파일)를 바탕으로 퀴즈 문제 세트를 생성합니다.
 * @param {string} summary - 요약 내용
 * @param {object} config - { count, type, fileData } 문항 수, 유형, 파일 데이터
 */
export const generateQuestions = async (summary, config = { count: 5, type: 'mixed', fileData: null }) => {
  if (!API_KEY) {
    console.warn("Gemini API Key가 설정되지 않았습니다. Mock 퀴즈를 반환합니다.");
    return []; // Quiz.jsx에서 보완 처리
  }

  try {
    // 429 방지를 위해 다양한 모델 후보와 재시도 로직을 가집니다.
    const models = [
      "gemini-2.0-flash-lite", 
      "gemini-1.5-flash", 
      "gemini-2.0-flash", 
      "gemini-2.5-flash-lite",
      "gemini-flash-latest"
    ];
    let lastError = null;

    for (const modelName of models) {
      // 각 모델별로 최대 2번까지 재시도 (429 발생 시)
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `
          당신은 교육 전문가이자 전문 출제 위원입니다. 
          전달받은 [학습 자료]를 분석하여 학습자가 핵심 내용을 완벽히 이해했는지 확인하기 위한 퀴즈 ${config.count}문항을 생성해 주세요.
          
          [자료 분석 지침]
          1. 원본 파일(이미지/PDF 등)이 첨부되어 있다면, 요약본보다 **원본 파일 내용을 우선적으로 상세히 분석**하여 문제를 출제하세요.
          2. 요약본에 없는 세부적인 수치, 사례, 개념 설명까지 포함하여 변별력 있는 문제를 만드세요.
          3. 문항 유형: ${config.type === 'mixed' ? '객관식, O/X, 단답형 혼합' : config.type} (총 ${config.count}개)
          
          [기술적 요구 사항 - 필둑]
          1. **오직 JSON 배열만 출력하세요.** "학습 자료를 분석했습니다" 같은 서두나 인사말, 말머리를 절대 포함하지 마세요.
          2. 질문이나 보기에 개행 문자(\\n)를 직접 포함하지 마세요. (JSON 파싱 오류 방지)
          3. 정답은 반드시 제공된 자료에 근거해야 합니다.
          
          JSON 구조 예시 (이 형식 외의 다른 텍스트는 불허):
          [
            {
              "id": 1,
              "type": "mc4",
              "question": "문제 내용",
              "options": ["보기1", "보기2", "보기3", "보기4"],
              "answer": 0, 
              "source": "정답의 근거가 되는 원문의 구체적인 문장",
              "keyword": "핵심 키워드"
            }
          ]
        `;

        let parts = [{ text: prompt }];

        if (config.fileData && config.fileData.data) {
          parts.push({
            inlineData: {
              data: config.fileData.data,
              mimeType: config.fileData.mimeType || 'application/pdf'
            }
          });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();
        
        // JSON 추출 고도화: '[학습 자료]' 같은 텍스트가 섞여 있어도 첫 번째 배열 시작점([ {)을 찾음
        let jsonStr = text.replace(/```json|```/g, "").trim();
        const firstBracket = jsonStr.indexOf("[");
        const lastBracket = jsonStr.lastIndexOf("]");
        
        if (firstBracket !== -1 && lastBracket !== -1 && firstBracket < lastBracket) {
          // [ 다음 바로 { 가 오거나 공백 후 { 가 오는 지점을 찾아 서두 텍스트를 걸러냄
          const actualArrayStart = jsonStr.substring(firstBracket).search(/\[\s*\{/);
          if (actualArrayStart !== -1) {
            jsonStr = jsonStr.substring(firstBracket + actualArrayStart, lastBracket + 1);
          } else {
            jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
          }
        }
        
        // JSON 정제 후 파싱
        try {
          return JSON.parse(jsonStr);
        } catch (parseErr) {
          console.warn("일반 파싱 실패, 정제 후 재시도합니다...");
          const cleaned = cleanJSONString(jsonStr);
          return JSON.parse(cleaned);
        }
      } catch (err) {
        lastError = err;
        
        // 429(할당량 초과) 발생 시 2초 대기 후 해당 모델로 재시도 또는 다음 모델로 이동
        if (err.message.includes("429")) {
          if (attempt === 1) {
            console.warn(`[429 에러] 모델 '${modelName}' 1차 실패. 2초 후 재시도합니다...`);
            await sleep(2000);
            continue; // 같은 모델로 재시도
          } else {
            console.warn(`[429 에러] 모델 '${modelName}' 최종 실패. 다음 모델로 넘어갑니다.`);
            break; // 다음 모델로 이동
          }
        }
        
        if (err.message.includes("404")) {
          console.warn(`[404 에러] 모델 '${modelName}'를 찾을 수 없습니다. 다음 모델로 이동합니다.`);
          break;
        }
        
        throw err;
      }
    }
    }
    throw lastError;
  } catch (error) {
    console.error("Question generation error:", error);
    throw error;
  }
};
