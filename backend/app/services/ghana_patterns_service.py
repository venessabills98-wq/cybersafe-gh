import re
from typing import List, Dict, Any

# Ghana-specific scam templates
GHANA_SCAM_PATTERNS = [
    {
        "name": "MoMo Reversal Scam",
        "patterns": [
            r"momo\s*reversal",
            r"mobile\s*money\s*reversal",
            r"wrong\s*(?:transfer|momo|mobile\s*money)",
            r"sent\s*(?:you|money)\s*(?:by\s*)?(?:mistake|error|accident)",
            r"reverse\s*(?:the\s*)?(?:money|momo|transfer)",
            r"please\s*(?:return|send\s*back|reverse)",
        ],
        "category": "Mobile Money Fraud",
        "score": 25,
        "explanation": "This matches the MoMo reversal scam pattern common in Ghana. Scammers claim to have sent money by mistake and ask you to 'reverse' it, but no actual transfer was made.",
    },
    {
        "name": "MTN Promo Scam",
        "patterns": [
            r"mtn\s*(?:promo|promotion|reward|winner|lucky)",
            r"congratulations.*mtn",
            r"mtn.*(?:selected|chosen|won)",
            r"dial\s*\*\d+\#.*(?:claim|redeem|collect)",
            r"mtn\s*(?:ghana\s*)?(?:50th|anniversary|celebration)",
        ],
        "category": "Fake Prize Scam",
        "score": 25,
        "explanation": "This matches the MTN fake promotion scam. MTN Ghana does not randomly select winners via SMS. Official promotions are announced through verified channels.",
    },
    {
        "name": "E-Levy Refund Scam",
        "patterns": [
            r"e[\-\s]?levy\s*(?:refund|rebate|cashback|return)",
            r"(?:government|gra|mof)\s*(?:is\s*)?(?:refund|return).*e[\-\s]?levy",
            r"claim\s*(?:your\s*)?e[\-\s]?levy",
            r"e[\-\s]?levy.*(?:overpay|excess|reimburse)",
        ],
        "category": "Phishing",
        "score": 20,
        "explanation": "This matches the E-Levy refund scam. The Ghana government does not issue E-Levy refunds via SMS or require personal details to process them.",
    },
    {
        "name": "GRA Impersonation",
        "patterns": [
            r"ghana\s*revenue\s*authority",
            r"gra\s*(?:tax|notice|alert|payment|refund)",
            r"tax\s*(?:refund|clearance|payment).*gra",
            r"(?:tin|tax)\s*(?:number|identification).*(?:update|verify|confirm)",
        ],
        "category": "Identity Theft Attempt",
        "score": 20,
        "explanation": "This impersonates the Ghana Revenue Authority (GRA). GRA does not request personal details or payments via SMS/WhatsApp.",
    },
    {
        "name": "NHIS Registration Scam",
        "patterns": [
            r"nhis\s*(?:registration|renewal|card|update|expire)",
            r"national\s*health\s*insurance.*(?:expire|renew|update|register)",
            r"(?:renew|update)\s*(?:your\s*)?nhis",
            r"nhis\s*(?:card|number)\s*(?:block|suspend|deactivat)",
        ],
        "category": "Identity Theft Attempt",
        "score": 20,
        "explanation": "This matches the NHIS registration scam. The National Health Insurance Scheme does not require card renewal via SMS or request fees through mobile money.",
    },
    {
        "name": "Cocobod Payment Scam",
        "patterns": [
            r"cocobod\s*(?:payment|bonus|arrears)",
            r"cocoa\s*(?:board|farmer).*(?:payment|bonus|subsidy)",
            r"(?:farmer|cocoa)\s*(?:payment|subsidy|bonus).*(?:claim|collect|receive)",
        ],
        "category": "Fake Prize Scam",
        "score": 20,
        "explanation": "This matches the Cocobod payment scam targeting cocoa farmers. COCOBOD does not send payment notifications via SMS or require upfront fees.",
    },
    {
        "name": "ECG Meter Credit Scam",
        "patterns": [
            r"ecg\s*(?:meter|credit|prepaid|token|unit)",
            r"(?:free|cheap|discount)\s*(?:ecg|electricity|meter)\s*(?:credit|unit|token)",
            r"electricity\s*company.*(?:free|promo|discount)",
            r"(?:buy|get)\s*(?:ecg|electricity)\s*(?:credit|unit).*(?:cheap|half|discount)",
        ],
        "category": "Phishing",
        "score": 20,
        "explanation": "This matches the ECG meter credit scam. Discounted electricity credits are not sold via unofficial channels. Only buy from authorized ECG vendors.",
    },
    {
        "name": "Pidgin English Indicators",
        "patterns": [
            r"(?:chale|charley)\s*(?:i\s*)?(?:beg|help|send)",
            r"(?:abeg|bros|oga|madam)\s*(?:help|send|borrow)",
            r"(?:make|dey)\s*(?:you\s*)?(?:send|help|borrow)",
            r"(?:wahala|palava)\s*(?:dey|be)",
        ],
        "category": "Mobile Money Fraud",
        "score": 10,
        "explanation": "Message uses Pidgin English patterns commonly associated with social engineering attempts. While Pidgin is widely spoken, its use in money requests via SMS/WhatsApp can indicate a social engineering attempt.",
    },
    {
        "name": "SSNIT Scam",
        "patterns": [
            r"ssnit\s*(?:pension|benefit|claim|update|verify)",
            r"social\s*security.*(?:ghana|update|verify|claim)",
            r"(?:pension|retirement)\s*(?:benefit|claim|payment).*(?:ssnit|social\s*security)",
        ],
        "category": "Identity Theft Attempt",
        "score": 20,
        "explanation": "This impersonates SSNIT (Social Security and National Insurance Trust). SSNIT does not request personal details or payments via SMS/WhatsApp.",
    },
    {
        "name": "Ghana Lottery Scam",
        "patterns": [
            r"(?:ghana|national)\s*(?:lotto|lottery).*(?:won|winner|selected)",
            r"lotto\s*(?:ghana|winner|prize|claim)",
            r"(?:won|winner)\s*.*(?:ghs|ghc|cedis?)\s*\d+",
        ],
        "category": "Fake Prize Scam",
        "score": 25,
        "explanation": "This matches the Ghana lottery scam pattern. You cannot win a lottery you did not enter. National Lottery Authority does not notify winners via SMS.",
    },
]


def detect_ghana_patterns(text: str) -> List[Dict[str, Any]]:
    """
    Check message text against Ghana-specific scam templates.

    Returns list of matched patterns with name, category, score, and explanation.
    """
    text_lower = text.lower()
    matched = []
    seen_names = set()

    for template in GHANA_SCAM_PATTERNS:
        if template["name"] in seen_names:
            continue
        for pattern in template["patterns"]:
            if re.search(pattern, text_lower):
                matched.append({
                    "name": template["name"],
                    "category": template["category"],
                    "score": template["score"],
                    "explanation": template["explanation"],
                })
                seen_names.add(template["name"])
                break  # Only match once per template

    return matched


def get_ghana_pattern_score(patterns: List[Dict]) -> int:
    """Get total additional score from Ghana-specific patterns."""
    if not patterns:
        return 0
    # Take the highest-scoring pattern to avoid double-counting
    return max(p["score"] for p in patterns)
