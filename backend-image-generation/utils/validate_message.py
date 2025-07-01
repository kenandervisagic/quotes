import re

from better_profanity import profanity


def is_message_valid(message: str) -> bool:
    if len(message.strip()) == 0:
        raise ValueError("Message cannot be empty.")
    if len(message) > 500:
        raise ValueError("Message must be 500 characters or less.")
    if is_characters_repeating(message):
        raise ValueError("Message contains too many repeated characters.")
    if is_url(message):
        raise ValueError("Message must not contain URL.")
    if profanity.contains_profanity(message):
        raise ValueError("Message contains bad words.")

    return True


def is_url(message: str) -> bool:
    url_regex = r"(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9\-]+\.(com|org|net|io|gov|edu|co|ai)[^\s]*)"
    return bool(re.search(url_regex, message))


def is_characters_repeating(message: str) -> bool:
    repeating_char_regex = r"(.)\1{10,}"
    return bool(re.search(repeating_char_regex, message))
