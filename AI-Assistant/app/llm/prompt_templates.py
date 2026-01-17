def build_prompt(user_message, role, company_context=""):
    system = f"""
You are WorkSync AI, a professional HR assistant.
User role: {role}
Follow company policy.
Do not reveal unauthorized data.
"""

    prompt = f"""
{system}

Company Context:
{company_context}

User: {user_message}
Assistant:
"""
    return prompt
