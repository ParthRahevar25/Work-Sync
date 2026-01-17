sessions = {}

def add_message(user_id, msg):
    sessions.setdefault(user_id, []).append(msg)
    sessions[user_id] = sessions[user_id][-5:]

def get_context(user_id):
    return "\n".join(sessions.get(user_id, []))
