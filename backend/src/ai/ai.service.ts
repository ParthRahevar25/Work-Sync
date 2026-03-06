import axios from "axios";

const OLLAMA_URL = "http://localhost:11434/api/generate";

export interface AIResponse {
  message: string;
  action?: string;
  data?: any;
}

export async function generateAIResponse(prompt: string, context: any): Promise<AIResponse> {
  const systemPrompt = `
You are WorkSync AI, an HR assistant. 
Current Date: ${new Date().toISOString().split('T')[0]}

CRITICAL: You MUST respond with ONLY a valid JSON object. Do not include any text before or after the JSON.

{
  "message": "Friendly message",
  "action": "ACTION_NAME",
  "data": {}
}

Actions:
- APPLY_LEAVE: data: { "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "type": "casual" | "Sick" | "paid", "reason": "string" }
- GET_LEAVE_BALANCE: no data needed.
- GET_MY_LEAVES: no data needed.
- NONE: for general chat.

Context: Name: ${context.name}, Role: ${context.role}
`;

  try {
    const response = await axios.post(OLLAMA_URL, {
      model: "llama3:8b",
      prompt: systemPrompt + "\nUser: " + prompt,
      stream: false,
    });

    let rawResponse = response.data.response.trim();
    
    // Remove markdown code blocks if the AI includes them
    rawResponse = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(rawResponse);
  } catch (error) {
    console.error("AI Parsing Error. Raw response was:", error);
    return {
      message: "I processed your request but had trouble formatting the data. Could you try again?",
      action: "NONE",
    };
  }
}