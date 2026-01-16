import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

df = pd.read_csv("datasets/hr_faq.csv")

vectorizer = TfidfVectorizer()
faq_vectors = vectorizer.fit_transform(df["question"])

def find_best_match(user_question, user_role):
    user_vec = vectorizer.transform([user_question])
    similarities = cosine_similarity(user_vec, faq_vectors)[0]

    best_idx = similarities.argmax()
    best_score = similarities[best_idx]

    row = df.iloc[best_idx]

    if user_role != row["role"] and row["role"] != "Employee":
        return "You are not authorized to view this information."

    if best_score < 0.3:
        return "Sorry, I could not understand your question."

    return row["answer"]
