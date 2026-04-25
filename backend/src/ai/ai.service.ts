import axios from "axios";

const OLLAMA_URL = "http://localhost:11434/api/generate";

export interface AIResponse {
  message: string;
  action?: string;
  data?: any;
}

export async function generateAIResponse(
  prompt: string,
  context: any,
  history: { role: string; content: string }[] = []
): Promise<AIResponse> {

  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });

  // Build conversation history string for context
  const historyText = history.length
    ? "\n\nRecent conversation:\n" +
      history
        .slice(-5)
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n")
    : "";

  const systemPrompt = `
You are WorkSync AI, a smart HR assistant for a company ERP system.
Today is ${dayName}, ${currentDate}.

CRITICAL: Respond ONLY with a single valid JSON object. No extra text, no markdown, no explanation outside the JSON.

Format:
{
  "message": "A short, friendly response message",
  "action": "ACTION_NAME",
  "data": {}
}

--- AVAILABLE ACTIONS ---

EMPLOYEE ACTIONS (any role):
- GET_LEAVE_BALANCE
  Use when: user asks about their own leave balance, how many leaves they have left
  data: {}

- GET_MY_LEAVES
  Use when: user asks about their own leave history, past applications
  data: {}

- APPLY_LEAVE
  Use when: user wants to apply/request a leave
  data: { "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "type": "casual"|"sick"|"paid", "reason": "string" }
  Note: resolve relative dates like "tomorrow", "next Monday", "25th April" to YYYY-MM-DD using today's date.

- CANCEL_LEAVE
  Use when: user wants to cancel a pending leave they applied
  data: { "date": "YYYY-MM-DD" }
  Note: extract a date near which they want to cancel. Use startDate of the leave.

- MY_ATTENDANCE_SUMMARY
  Use when: user asks how many days they were present, their attendance this month/week
  data: {}

- MY_PROFILE
  Use when: user asks about their own department, manager, designation, joining date, role
  data: {}

ADMIN / MANAGER ACTIONS (admin or manager role only):
- LEAVES_ON_DATE
  Use when: admin asks who is on leave on a specific date, who is absent on a date
  data: { "date": "YYYY-MM-DD" }
  Note: resolve relative dates to YYYY-MM-DD.

- DEPT_LEAVE_SUMMARY
  Use when: admin asks which department has most leaves, department-wise leave breakdown
  data: {}

- PENDING_APPROVALS
  Use when: admin asks about pending leaves, leaves awaiting approval
  data: {}

- TODAYS_ABSENTEES
  Use when: admin asks who hasn't checked in today, who is absent today
  data: {}

- SEARCH_EMPLOYEE
  Use when: admin asks about a specific employee by name — their profile, department, manager
  data: { "name": "employee name from query" }

- APPROVE_LEAVE
  Use when: admin wants to approve a specific employee's leave
  data: { "employeeName": "string" }
  Note: will approve the most recent pending leave for that employee.

- REJECT_LEAVE
  Use when: admin wants to reject a specific employee's leave
  data: { "employeeName": "string" }
  Note: will reject the most recent pending leave for that employee.

GENERAL:
- NONE
  Use when: none of the above apply, or for general conversation
  data: {}

--- CONTEXT ---
User name: ${context.name}
User role: ${context.role}
${historyText}
`;

  const fullPrompt = systemPrompt + "\n\nUser: " + prompt;

  // Retry loop — attempt up to 3 times if JSON parsing fails
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.post(OLLAMA_URL, {
        model: "llama3:8b",
        prompt: fullPrompt,
        stream: false,
      });

      let raw = response.data.response.trim();

      // Strip markdown code fences
      raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

      // Extract first JSON object if model adds trailing text
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in response");

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    } catch (error) {
      console.error(`AI parse attempt ${attempt} failed:`, error);
      if (attempt === 3) {
        return {
          message:
            "I understood your request but had trouble processing it. Could you rephrase and try again?",
          action: "NONE",
        };
      }
    }
  }

  return { message: "Something went wrong. Please try again.", action: "NONE" };
}
