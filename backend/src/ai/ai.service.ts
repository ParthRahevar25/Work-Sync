import axios from "axios";

const OLLAMA_URL = "http://localhost:11434/api/generate";

export interface AIResponse {
  message: string;
  action?: string;
  data?: any;
}

export async function generateAIResponse(
  prompt: string,
  context: any
): Promise<AIResponse> {
  const systemPrompt = `
You are WorkSync AI, an assistant for employee management.

You MUST respond in JSON format ONLY:

{
  "message": "message to show user",
  "action": "optional action name",
  "data": {}
}

Actions allowed:
- APPLY_LEAVE
- GET_LEAVE_BALANCE
- GET_MY_LEAVES
- NONE

Context:
${JSON.stringify(context)}
`;

  const fullPrompt = systemPrompt + "\nUser: " + prompt;

  const response = await axios.post(OLLAMA_URL, {
    model: "llama3:8b",
    prompt: fullPrompt,
    stream: false,
  });

  try {
    return JSON.parse(response.data.response);
  } catch {
    return {
      message: response.data.response,
      action: "NONE",
    };
  }
}