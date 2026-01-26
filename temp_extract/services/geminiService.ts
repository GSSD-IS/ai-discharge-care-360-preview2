
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Generates a medical discharge summary using AI in Traditional Chinese with a bulleted format.
 */
export const generateDischargeSummary = async (patientData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請使用「繁體中文」及「重點式條列」格式，基於以下病患資料生成一份出院準備摘要：
      姓名：${patientData.name}
      年齡：${patientData.age}
      主要診斷：${patientData.department}
      CCI 指數：${patientData.cci}
      ADL 分數：${patientData.adl}
      風險評分：${patientData.riskScore}
      
      請包含以下章節，並全部以簡潔的「重點條列」呈現：
      1. 臨床摘要 (重點式)
      2. 關鍵風險因子 (條列式)
      3. 居家照護重點 (條列式)
      
      注意：嚴禁冗長敘述，僅輸出繁體中文重點。`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "無法生成摘要。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "無法生成摘要，請聯繫系統管理員。";
  }
};

/**
 * Analyzes patient data to generate a care plan in JSON format.
 * Ensures the lists within the JSON are concise bullet points in Traditional Chinese.
 */
export const generateCarePlanAI = async (patient: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `請針對以下病患資料進行「出院準備計畫」分析。
      姓名：${patient.name}, 年齡：${patient.age}, 性別：${patient.gender}
      診斷科別：${patient.department}, CCI：${patient.cci}, ADL：${patient.adl}
      安置方向：${patient.dischargeType}
      
      請以「繁體中文」生成以下 JSON 內容，所有列表項目必須是簡短的「重點式」文字：
      1. 照護問題 (Care Problems)：列出病患最迫切需要解決的護理或安置問題。
      2. 資源建議 (Resource Suggestions)：針對其安置方向，列出具體的建議資源名稱。
      3. 團隊筆記 (Team Notes)：給跨領域團隊的簡短協作提醒。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            careProblems: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "繁體中文重點式照護問題列表"
            },
            resourceSuggestions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "繁體中文重點式建議資源列表"
            },
            teamNotes: { 
              type: Type.STRING,
              description: "繁體中文簡短團隊筆記"
            }
          },
          required: ["careProblems", "resourceSuggestions", "teamNotes"]
        }
      }
    });
    
    const jsonStr = response.text?.trim();
    return jsonStr ? JSON.parse(jsonStr) : null;
  } catch (error) {
    console.error("Care Plan Error:", error);
    return null;
  }
};

/**
 * Generates custom education text in Traditional Chinese using a concise, bulleted format.
 */
export const generateEducationText = async (category: string, patient: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    let context = "";
    if (category === 'Nutrition') {
      const note = patient.assessments?.find((a: any) => a.role === '營養')?.lastNote || "無紀錄";
      context = `參考營養師紀錄：${note}。`;
    } else if (category === 'Activity') {
      const note = patient.assessments?.find((a: any) => a.role === '復健')?.lastNote || "無紀錄";
      context = `參考復健師紀錄：${note}。`;
    } else {
      context = `生成關於 ${category} 的標準衛教指引。`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請身為醫療專業人員，針對以下資訊生成「重點式」繁體中文衛教文字：
      病患：${patient.name}, 主題：${category}
      背景資訊：${context}
      
      規則：
      1. 必須使用「繁體中文」。
      2. 必須以「重點式條列 (Bullet Points)」呈現。
      3. 每一點必須簡潔、有力、易於家屬理解。
      4. 語氣需專業且親切。`,
    });
    return response.text || "無法生成衛教內容。";
  } catch (error) {
    console.error("Education Generation Error:", error);
    return "生成衛教內容時發生錯誤。";
  }
};

/**
 * Generates AI follow-up questions based on the discharge plan.
 */
export const generateFollowUpQuestions = async (patient: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請針對以下出院個案資料，生成 5 個「繁體中文」電訪追蹤問題。
      姓名：${patient.name}
      安置方向：${patient.dischargeType}
      照護問題摘要：${JSON.stringify(patient.prepItems)}
      
      請生成具體的追蹤問題，例如傷口狀況、用藥情形、資源銜接是否順利等。
      輸出格式必須為 JSON 陣列。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const jsonStr = response.text?.trim();
    return jsonStr ? JSON.parse(jsonStr) : [];
  } catch (error) {
    console.error("Follow-up Questions Error:", error);
    return [];
  }
};

/**
 * Generates a narrative follow-up record summary.
 */
export const generateFollowUpNarrative = async (data: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請根據以下電訪追蹤數據，生成一段專業的「敘述性電訪記錄」(繁體中文)：
      病患姓名：${data.patientName}
      電訪日期：${data.callDate}
      受訪對象：${data.responder}
      最近醫療紀錄：${JSON.stringify(data.recentVisit)}
      問答摘要：${JSON.stringify(data.qa)}
      
      請以重點式、敘述流暢的格式撰寫，包含病患近況總結、是否有潛在風險、需採取的後續行動。`,
      config: {
        temperature: 0.7
      }
    });
    return response.text || "無法生成紀錄。";
  } catch (error) {
    console.error("Follow-up Narrative Error:", error);
    return "生成紀錄失敗。";
  }
};
