import re
from typing import Dict, Optional, Any

# Legitimate Ghana telco short codes
LEGITIMATE_SHORT_CODES = {
    "MTN": ["1515", "5050", "1355", "1390"],
    "Vodafone": ["1000", "5015", "100"],
    "AirtelTigo": ["1211", "1234", "126"],
    "Glo": ["1244", "127"],
}

# Legitimate bank domains
LEGITIMATE_BANK_DOMAINS = [
    "gcbbank.com.gh", "ecobank.com", "stanbicbank.com.gh",
    "fidelitybank.com.gh", "calbank.net", "absa.com.gh",
    "accessbankplc.com", "zenithbank.com.gh", "ubagroup.com",
    "bog.gov.gh", "gtbank.com",
]

# Known scam patterns for sender info
KNOWN_SCAM_PATTERNS = [
    r"^\+?(?:234|233)\d{10,}$",  # Nigerian/GH numbers with extra digits
    r"(?:info|support|admin|help)@(?:gmail|yahoo|hotmail)\.",  # Generic emails claiming to be official
    r"mtn[\-_]?(?:promo|winner|reward)",  # Fake MTN promo senders
    r"bank[\-_]?(?:alert|info|update)",  # Fake bank senders
    r"(?:whatsapp|telegram)\+",  # Fake platform senders
]

# Suspicious sender name patterns
SUSPICIOUS_SENDER_NAMES = [
    r"^(?:mtn|vodafone|airtel|glo)\s*(?:ghana|promo|winner|reward|offer)",
    r"^(?:bank|ecobank|gcb|stanbic|fidelity)\s*(?:alert|info|update|notice)",
    r"^(?:gov|gra|nhis|ssnit)\s*(?:ghana|alert|notice|update)",
]


def analyze_sender(sender_info: Optional[str]) -> Dict[str, Any]:
    """
    Analyze sender information for legitimacy.

    Returns dict with:
    - sender_type: phone/email/short_code/name/unknown
    - is_suspicious: bool
    - reason: explanation string
    - known_entity: matched entity name or None
    """
    if not sender_info or not sender_info.strip():
        return {
            "sender_type": "unknown",
            "is_suspicious": False,
            "reason": "No sender information provided",
            "known_entity": None,
        }

    sender = sender_info.strip()
    sender_lower = sender.lower()

    # Check if it's a short code
    if sender.isdigit() and len(sender) <= 6:
        return _check_short_code(sender)

    # Check if it's an email
    if "@" in sender:
        return _check_email(sender_lower)

    # Check if it's a phone number
    phone_match = re.match(r"^\+?\d{9,15}$", sender.replace(" ", "").replace("-", ""))
    if phone_match:
        return _check_phone(sender)

    # Check as sender name
    return _check_sender_name(sender_lower)


def _check_short_code(code: str) -> Dict[str, Any]:
    """Check if a short code is from a known legitimate provider."""
    for provider, codes in LEGITIMATE_SHORT_CODES.items():
        if code in codes:
            return {
                "sender_type": "short_code",
                "is_suspicious": False,
                "reason": f"Recognized as legitimate {provider} short code",
                "known_entity": provider,
            }
    return {
        "sender_type": "short_code",
        "is_suspicious": True,
        "reason": "Unrecognized short code — not from a known provider",
        "known_entity": None,
    }


def _check_email(email: str) -> Dict[str, Any]:
    """Check email sender against known legitimate domains and scam patterns."""
    domain = email.split("@")[-1] if "@" in email else ""

    # Check legitimate domains
    for legit_domain in LEGITIMATE_BANK_DOMAINS:
        if domain == legit_domain or domain.endswith("." + legit_domain):
            return {
                "sender_type": "email",
                "is_suspicious": False,
                "reason": f"Email from recognized domain: {domain}",
                "known_entity": domain,
            }

    # Check scam patterns
    for pattern in KNOWN_SCAM_PATTERNS:
        if re.search(pattern, email, re.IGNORECASE):
            return {
                "sender_type": "email",
                "is_suspicious": True,
                "reason": "Email matches known scam sender pattern",
                "known_entity": None,
            }

    # Free email providers impersonating organizations
    free_providers = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"]
    if domain in free_providers:
        return {
            "sender_type": "email",
            "is_suspicious": True,
            "reason": f"Uses free email provider ({domain}) — legitimate organizations use official domains",
            "known_entity": None,
        }

    return {
        "sender_type": "email",
        "is_suspicious": False,
        "reason": "Email sender does not match known scam patterns",
        "known_entity": None,
    }


def _check_phone(phone: str) -> Dict[str, Any]:
    """Check phone number for suspicious patterns."""
    clean = phone.replace(" ", "").replace("-", "").replace("+", "")

    # Check for extra-long numbers (potential spoofing)
    if len(clean) > 12:
        return {
            "sender_type": "phone",
            "is_suspicious": True,
            "reason": "Unusually long phone number — possible number spoofing",
            "known_entity": None,
        }

    # Nigerian prefix (common source of scams targeting Ghana)
    if clean.startswith("234"):
        return {
            "sender_type": "phone",
            "is_suspicious": True,
            "reason": "Nigerian phone number (+234) — commonly associated with cross-border scams",
            "known_entity": None,
        }

    # Valid Ghana number
    if clean.startswith("233") or clean.startswith("0"):
        return {
            "sender_type": "phone",
            "is_suspicious": False,
            "reason": "Ghana phone number format",
            "known_entity": None,
        }

    return {
        "sender_type": "phone",
        "is_suspicious": False,
        "reason": "Phone number format",
        "known_entity": None,
    }


def _check_sender_name(name: str) -> Dict[str, Any]:
    """Check sender display name for suspicious patterns."""
    for pattern in SUSPICIOUS_SENDER_NAMES:
        if re.search(pattern, name, re.IGNORECASE):
            return {
                "sender_type": "name",
                "is_suspicious": True,
                "reason": "Sender name impersonates a known organization",
                "known_entity": None,
            }
    return {
        "sender_type": "name",
        "is_suspicious": False,
        "reason": "Sender name does not match known scam patterns",
        "known_entity": None,
    }
