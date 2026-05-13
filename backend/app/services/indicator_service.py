import re
from typing import List, Dict

# Keyword lists
URGENCY_KEYWORDS = ["urgent", "immediately", "blocked", "suspended", "verify now", "limited time", "act now", "expire"]
FINANCIAL_KEYWORDS = ["reward", "prize", "money", "loan", "payment", "fee", "cash", "bonus", "winnings"]
CREDENTIAL_KEYWORDS = ["otp", "pin", "password", "card", "cvv", "verification code", "secret code", "access code"]
PAYMENT_PHRASES = ["pay now", "send money", "transfer", "registration fee", "processing fee", "pay registration", "make payment", "mobile money"]
IMPERSONATION_KEYWORDS = ["mtn", "vodafone", "airtel", "tigo", "glo", "momo", "mobile money", "bank of ghana", "ecobank", "gcb", "stanbic", "fidelity", "calbank", "access bank", "zenith bank"]
SUSPENSION_PHRASES = ["account.*suspend", "account.*block", "account.*deactivat", "account.*clos", "account.*restrict", "will be blocked", "has been blocked", "has been suspended"]


def extract_urls(text: str) -> List[str]:
    """Extract URLs from text."""
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    return re.findall(url_pattern, text, re.IGNORECASE)


def extract_phone_numbers(text: str) -> List[str]:
    """Extract phone numbers from text."""
    phone_pattern = r'(?:\+?233|0)\d{9}'
    return re.findall(phone_pattern, text)


def check_urgency_keywords(text: str) -> List[Dict]:
    """Check for urgency-related keywords. Score: +15"""
    found = []
    text_lower = text.lower()
    for keyword in URGENCY_KEYWORDS:
        if keyword in text_lower:
            found.append({"name": f"Urgency keyword detected: '{keyword}'", "score": 15})
            break  # Only count once
    return found


def check_financial_keywords(text: str) -> List[Dict]:
    """Check for financial/money-related keywords. Score: +15"""
    found = []
    text_lower = text.lower()
    for keyword in FINANCIAL_KEYWORDS:
        if keyword in text_lower:
            found.append({"name": f"Financial keyword detected: '{keyword}'", "score": 15})
            break
    return found


def check_credential_keywords(text: str) -> List[Dict]:
    """Check for credential theft keywords. Score: +25"""
    found = []
    text_lower = text.lower()
    for keyword in CREDENTIAL_KEYWORDS:
        if keyword in text_lower:
            found.append({"name": f"Credential theft keyword detected: '{keyword}'", "score": 25})
            break
    return found


def check_suspicious_links(text: str) -> List[Dict]:
    """Check for suspicious URLs. Score: +20"""
    urls = extract_urls(text)
    if urls:
        return [{"name": "Suspicious link detected", "score": 20}]
    return []


def check_payment_request(text: str) -> List[Dict]:
    """Check for payment request phrases. Score: +20"""
    text_lower = text.lower()
    for phrase in PAYMENT_PHRASES:
        if phrase in text_lower:
            return [{"name": f"Payment request detected: '{phrase}'", "score": 20}]
    return []


def check_impersonation(text: str) -> List[Dict]:
    """Check for bank/telco impersonation. Score: +10"""
    text_lower = text.lower()
    for keyword in IMPERSONATION_KEYWORDS:
        if keyword in text_lower:
            return [{"name": f"Possible impersonation: '{keyword}'", "score": 10}]
    return []


def check_suspension_threat(text: str) -> List[Dict]:
    """Check for account suspension/blocking threats. Score: +15"""
    text_lower = text.lower()
    for pattern in SUSPENSION_PHRASES:
        if re.search(pattern, text_lower):
            return [{"name": "Account suspension/blocking threat detected", "score": 15}]
    return []


def detect_all_indicators(text: str) -> List[Dict]:
    """Run all indicator checks and return combined list."""
    indicators = []
    indicators.extend(check_credential_keywords(text))
    indicators.extend(check_urgency_keywords(text))
    indicators.extend(check_suspicious_links(text))
    indicators.extend(check_financial_keywords(text))
    indicators.extend(check_payment_request(text))
    indicators.extend(check_impersonation(text))
    indicators.extend(check_suspension_threat(text))
    return indicators


# --- Enhanced indicator functions for V2 ---

INDICATOR_EXPLANATIONS = {
    "credential": "Asking for credentials like OTPs, PINs, or passwords is a hallmark of phishing and account takeover scams.",
    "urgency": "Creating false urgency pressures victims into acting before they can think critically.",
    "link": "Suspicious links can lead to fake websites designed to steal your information.",
    "financial": "Mentions of money, rewards, or prizes are common lures in advance-fee fraud.",
    "payment": "Unsolicited payment requests are a major red flag for fraud.",
    "impersonation": "Impersonating trusted brands (banks, telcos) is used to gain victims' trust.",
    "suspension": "Threatening account suspension creates panic and bypasses rational decision-making.",
}


def generate_indicator_explanation(indicator: Dict) -> str:
    """Generate a contextual explanation for a specific indicator."""
    name_lower = indicator["name"].lower()
    if "credential" in name_lower or "otp" in name_lower or "pin" in name_lower or "password" in name_lower:
        return INDICATOR_EXPLANATIONS["credential"]
    elif "urgency" in name_lower:
        return INDICATOR_EXPLANATIONS["urgency"]
    elif "link" in name_lower:
        return INDICATOR_EXPLANATIONS["link"]
    elif "financial" in name_lower or "money" in name_lower or "reward" in name_lower:
        return INDICATOR_EXPLANATIONS["financial"]
    elif "payment" in name_lower:
        return INDICATOR_EXPLANATIONS["payment"]
    elif "impersonation" in name_lower:
        return INDICATOR_EXPLANATIONS["impersonation"]
    elif "suspension" in name_lower or "blocking" in name_lower:
        return INDICATOR_EXPLANATIONS["suspension"]
    return "This indicator suggests potentially fraudulent content."


def detect_all_indicators_enhanced(text: str) -> List[Dict]:
    """Run all checks and return indicators with explanations."""
    raw = detect_all_indicators(text)
    enhanced = []
    for ind in raw:
        enhanced.append({
            "name": ind["name"],
            "score": ind["score"],
            "detail": generate_indicator_explanation(ind),
        })
    return enhanced
