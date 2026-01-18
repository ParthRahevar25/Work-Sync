from app.llm.model_loader import get_model
from app.llm.prompt_templates import build_prompt

def generate_reply(message, role, company_context=""):
    tokenizer, model = get_model()

    prompt = build_prompt(message, role, company_context)

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    outputs = model.generate(
        **inputs,
        max_new_tokens=80,
        do_sample=True,
        temperature=0.7
    )

    response = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return response.split("Assistant:")[-1].strip()
