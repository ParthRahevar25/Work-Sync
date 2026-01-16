import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

MODEL_PATH = "intent_model.pkl"
VECT_PATH = "vectorizer.pkl"

model = None
vectorizer = None

def train():
    with open("datasets/intents.json") as f:
        data = json.load(f)

    X = [d["text"] for d in data]
    y = [d["intent"] for d in data]

    vectorizer_local = TfidfVectorizer()
    X_vec = vectorizer_local.fit_transform(X)

    model_local = LogisticRegression()
    model_local.fit(X_vec, y)

    joblib.dump(model_local, MODEL_PATH)
    joblib.dump(vectorizer_local, VECT_PATH)

    print("Intent model trained")

def load_model():
    global model, vectorizer
    if model is None or vectorizer is None:
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECT_PATH)

def predict(text):
    load_model()
    vec = vectorizer.transform([text])
    return model.predict(vec)[0]

if __name__ == "__main__":
    train()
