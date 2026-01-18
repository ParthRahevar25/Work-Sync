from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

tokenizer = None
model = None

def load_model():
    global tokenizer, model
    if model is None:
        print("Loading LLM model...")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto"
        )
        print("LLM loaded.")

def get_model():
    load_model()
    return tokenizer, model
