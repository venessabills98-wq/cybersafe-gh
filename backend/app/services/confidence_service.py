from typing import Dict, List, Any


def calculate_confidence(
    indicators: List[Dict],
    risk_score: int,
    scam_category: str,
    message_text: str,
) -> int:
    """
    Calculate confidence percentage (0-100) for the analysis result.

    Algorithm: base 50% + indicator diversity bonus + category match bonus - ambiguity penalty
    """
    if not indicators and scam_category == "Safe":
        return 95  # High confidence it's safe when no indicators found

    base = 50

    # Indicator diversity bonus: more distinct indicator types = higher confidence
    indicator_types = set()
    for ind in indicators:
        name_lower = ind["name"].lower()
        if "credential" in name_lower or "otp" in name_lower or "pin" in name_lower:
            indicator_types.add("credential")
        elif "urgency" in name_lower:
            indicator_types.add("urgency")
        elif "link" in name_lower:
            indicator_types.add("link")
        elif "financial" in name_lower or "money" in name_lower or "payment" in name_lower:
            indicator_types.add("financial")
        elif "impersonation" in name_lower:
            indicator_types.add("impersonation")
        elif "suspension" in name_lower or "blocking" in name_lower:
            indicator_types.add("suspension")
        elif "ghana" in name_lower or "momo" in name_lower:
            indicator_types.add("ghana_pattern")
        else:
            indicator_types.add("other")

    diversity_bonus = min(len(indicator_types) * 8, 30)

    # Category match bonus: non-generic categories get a bonus
    category_bonus = 0
    if scam_category not in ("Safe", "Phishing"):
        category_bonus = 10
    elif scam_category == "Phishing" and len(indicators) >= 2:
        category_bonus = 5

    # Risk score alignment bonus: extreme scores (very low or very high) are more confident
    score_bonus = 0
    if risk_score >= 75 or risk_score == 0:
        score_bonus = 10
    elif risk_score >= 50:
        score_bonus = 5

    # Ambiguity penalty: short messages or borderline scores reduce confidence
    ambiguity_penalty = 0
    word_count = len(message_text.split())
    if word_count < 5:
        ambiguity_penalty += 15
    elif word_count < 10:
        ambiguity_penalty += 8

    if 20 <= risk_score <= 35:
        ambiguity_penalty += 10  # Borderline low/medium

    # Single indicator with high score is less reliable
    if len(indicators) == 1 and indicators[0]["score"] >= 20:
        ambiguity_penalty += 5

    confidence = base + diversity_bonus + category_bonus + score_bonus - ambiguity_penalty
    return max(10, min(confidence, 99))


def get_confidence_label(confidence: int) -> str:
    """Return a human-readable confidence label."""
    if confidence >= 85:
        return "Very High"
    elif confidence >= 70:
        return "High"
    elif confidence >= 50:
        return "Moderate"
    elif confidence >= 30:
        return "Low"
    else:
        return "Very Low"
