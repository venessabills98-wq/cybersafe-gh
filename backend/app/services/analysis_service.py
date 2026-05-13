import re
from typing import Dict, List, Any, Optional
from app.services.indicator_service import detect_all_indicators, detect_all_indicators_enhanced
from app.services.confidence_service import calculate_confidence, get_confidence_label
from app.services.sender_service import analyze_sender
from app.services.ghana_patterns_service import detect_ghana_patterns, get_ghana_pattern_score

# Scam category definitions with associated keyword patterns
SCAM_CATEGORIES = {
    "Mobile Money Fraud": ["momo", "mobile money", "mtn", "vodafone", "airtel", "tigo"],
    "Phishing": ["click", "verify", "confirm", "update your", "login", "sign in"],
    "Fake Bank Alert": ["bank", "account", "transfer", "debit", "credit", "ecobank", "gcb", "stanbic", "fidelity"],
    "Fake Job Scam": ["job", "hired", "selected", "employment", "vacancy", "recruitment", "position"],
    "Fake Loan Scam": ["loan", "borrow", "credit", "interest rate", "approved loan"],
    "Fake Prize Scam": ["won", "winner", "prize", "congratulations", "lottery", "reward", "ghs"],
    "Delivery Scam": ["delivery", "package", "parcel", "shipping", "courier", "tracking"],
    "Identity Theft Attempt": ["identity", "id card", "passport", "social security", "personal information", "date of birth"],
    "OTP/PIN Theft Attempt": ["otp", "pin", "verification code", "secret code", "one-time", "cvv", "password"],
}


def normalize_text(text: str) -> str:
    """Normalize input text: lowercase, clean whitespace, remove special formatting."""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text


def calculate_risk_score(indicators: List[Dict]) -> int:
    """Calculate cumulative risk score from indicators, capped at 100."""
    total = sum(ind["score"] for ind in indicators)
    return min(total, 100)


def determine_risk_level(score: int) -> str:
    """Determine risk level from score."""
    if score <= 25:
        return "Low"
    elif score <= 50:
        return "Medium"
    elif score <= 75:
        return "High"
    else:
        return "Critical"


def classify_scam_category(text: str, indicators: List[Dict]) -> str:
    """Determine best-fit scam category based on text content and indicators."""
    normalized = normalize_text(text)
    scores = {}

    for category, keywords in SCAM_CATEGORIES.items():
        score = 0
        for keyword in keywords:
            if keyword in normalized:
                score += 1
        scores[category] = score

    # If no keywords matched at all, skip to indicator-based fallback
    if max(scores.values()) == 0:
        if not indicators:
            return "Safe"
        indicator_names = " ".join(ind["name"].lower() for ind in indicators)
        if "credential" in indicator_names or "otp" in indicator_names or "pin" in indicator_names:
            return "OTP/PIN Theft Attempt"
        if "payment" in indicator_names:
            return "Phishing"
        return "Phishing"

    # Get category with highest match score
    best_category = max(scores, key=scores.get)

    return best_category


def generate_explanation(category: str, indicators: List[Dict], risk_level: str) -> str:
    """Generate a human-readable explanation of the risk assessment."""
    explanations = {
        "Mobile Money Fraud": "This message appears to impersonate a mobile money service to steal your financial information or credentials.",
        "Phishing": "This message attempts to trick you into revealing sensitive information by pretending to be a legitimate service.",
        "Fake Bank Alert": "This message impersonates a bank to create urgency and steal your banking credentials or funds.",
        "Fake Job Scam": "This message uses a fake job offer to lure you into paying fraudulent fees or sharing personal information.",
        "Fake Loan Scam": "This message advertises a fraudulent loan to collect upfront fees or steal your personal and financial data.",
        "Fake Prize Scam": "This message falsely claims you have won a prize to trick you into sharing credentials or paying fees.",
        "Delivery Scam": "This message uses a fake delivery notification to get you to click malicious links or share personal information.",
        "Identity Theft Attempt": "This message attempts to collect personal identification details for identity theft purposes.",
        "OTP/PIN Theft Attempt": "This message attempts to steal your one-time passwords, PINs, or security codes to access your accounts.",
    }

    if category == "Safe":
        return "This message does not contain any known scam indicators. It appears to be safe."

    base = explanations.get(category, "This message contains suspicious content that may be a scam attempt.")

    indicator_summary = ", ".join(ind["name"].split(":")[0].strip() for ind in indicators[:3])
    if indicator_summary:
        base += f" Detected indicators: {indicator_summary}."

    return base


def generate_advice(category: str, risk_level: str) -> List[str]:
    """Generate safety recommendations based on category and risk level."""
    if category == "Safe":
        return ["This message appears safe, but always stay vigilant against scams."]

    general_advice = [
        "Do not click any links in the message",
        "Do not share personal information or credentials",
        "Verify the sender through official channels"
    ]

    category_advice = {
        "Mobile Money Fraud": [
            "Never share your MoMo PIN with anyone",
            "Contact your mobile money provider directly using their official number",
            "Report the number to your network provider"
        ],
        "Phishing": [
            "Check the sender's identity carefully",
            "Do not enter credentials on unfamiliar websites",
            "Report the message as spam"
        ],
        "Fake Bank Alert": [
            "Call your bank directly using the number on your bank card",
            "Never share your bank PIN or OTP via message",
            "Visit your bank branch if unsure"
        ],
        "Fake Job Scam": [
            "Legitimate employers never ask for upfront fees",
            "Research the company independently before responding",
            "Report to the Ghana Police Service Cyber Crime Unit"
        ],
        "Fake Loan Scam": [
            "Legitimate lenders do not request upfront fees",
            "Verify the lender's license with Bank of Ghana",
            "Never share financial details via SMS or WhatsApp"
        ],
        "Fake Prize Scam": [
            "You cannot win a lottery you never entered",
            "Never pay fees to claim a prize",
            "Report to the National Communications Authority"
        ],
        "Delivery Scam": [
            "Verify deliveries with the actual courier service",
            "Do not pay unexpected delivery fees via mobile money",
            "Check tracking numbers on official courier websites"
        ],
        "Identity Theft Attempt": [
            "Never share ID card or passport details via message",
            "Report identity theft attempts to the police",
            "Monitor your accounts for unauthorized activity"
        ],
        "OTP/PIN Theft Attempt": [
            "Never share OTPs or PINs — no legitimate service asks for them",
            "Change your passwords if you suspect compromise",
            "Enable two-factor authentication on your accounts"
        ],
    }

    advice = general_advice.copy()
    if category in category_advice:
        advice.extend(category_advice[category])

    # Add urgency-based advice for critical risk
    if risk_level == "Critical":
        advice.append("This message is highly dangerous — delete it immediately")

    return advice


def analyze_message(text: str) -> Dict[str, Any]:
    """Main orchestrator: analyze a message and return full result."""
    normalized = normalize_text(text)

    # Detect all indicators
    indicators = detect_all_indicators(normalized)

    # Calculate score
    risk_score = calculate_risk_score(indicators)

    # Determine risk level
    risk_level = determine_risk_level(risk_score)

    # Classify scam category
    scam_category = classify_scam_category(normalized, indicators)

    # Generate explanation
    explanation = generate_explanation(scam_category, indicators, risk_level)

    # Generate advice
    advice = generate_advice(scam_category, risk_level)

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "scam_category": scam_category,
        "indicators": [{"name": ind["name"], "score": ind["score"]} for ind in indicators],
        "explanation": explanation,
        "advice": advice,
    }


def analyze_message_v2(
    text: str,
    sender_info: Optional[str] = None,
    message_type: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Enhanced V2 orchestrator: wraps V1 analysis + confidence + sender + Ghana patterns.
    """
    normalized = normalize_text(text)

    # V1 indicators (enhanced with explanations)
    enhanced_indicators = detect_all_indicators_enhanced(normalized)

    # Base score from indicators
    base_indicators = [{"name": i["name"], "score": i["score"]} for i in enhanced_indicators]
    risk_score = calculate_risk_score(base_indicators)

    # Ghana-specific pattern detection
    ghana_patterns = detect_ghana_patterns(normalized)
    ghana_bonus = get_ghana_pattern_score(ghana_patterns)

    # Add Ghana pattern score (capped at 100 total)
    risk_score = min(risk_score + ghana_bonus, 100)

    # Risk level and category
    risk_level = determine_risk_level(risk_score)
    scam_category = classify_scam_category(normalized, base_indicators)

    # If Ghana patterns suggest a more specific category, prefer it
    if ghana_patterns and scam_category in ("Phishing", "Safe"):
        scam_category = ghana_patterns[0]["category"]

    # Sender analysis
    sender_analysis = analyze_sender(sender_info)

    # Bump score slightly if sender is suspicious
    if sender_analysis["is_suspicious"] and risk_score < 100:
        risk_score = min(risk_score + 10, 100)
        risk_level = determine_risk_level(risk_score)

    # Confidence calculation
    confidence = calculate_confidence(
        indicators=base_indicators,
        risk_score=risk_score,
        scam_category=scam_category,
        message_text=normalized,
    )

    # Explanation and advice
    explanation = generate_explanation(scam_category, base_indicators, risk_level)
    advice = generate_advice(scam_category, risk_level)

    # Add Ghana-specific advice
    if ghana_patterns:
        advice.append(f"Ghana-specific scam detected: {ghana_patterns[0]['name']}")

    if sender_analysis["is_suspicious"]:
        advice.append(f"Sender flagged: {sender_analysis['reason']}")

    return {
        "message_text": text,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "scam_category": scam_category,
        "indicators": enhanced_indicators,
        "explanation": explanation,
        "advice": advice,
        "confidence": confidence,
        "confidence_label": get_confidence_label(confidence),
        "sender_analysis": sender_analysis,
        "ghana_patterns": [
            {
                "name": p["name"],
                "category": p["category"],
                "score": p["score"],
                "explanation": p["explanation"],
            }
            for p in ghana_patterns
        ],
        "message_type": message_type or "sms",
    }
