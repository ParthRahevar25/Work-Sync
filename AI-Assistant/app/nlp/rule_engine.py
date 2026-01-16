def is_authorized(intent, role):
    restricted_intents = ["add_employee", "leave_approve"]

    if intent in restricted_intents and role not in ["HR", "Admin"]:
        return False

    return True
