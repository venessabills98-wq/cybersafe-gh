export const getRiskColor = (level) => {
  const colors = {
    Low: '#2e7d32',
    Medium: '#f9a825',
    High: '#e65100',
    Critical: '#c62828',
  };
  return colors[level] || '#9e9e9e';
};

export const getRiskLabel = (score) => {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Medium';
  if (score <= 75) return 'High';
  return 'Critical';
};

export const getConfidenceColor = (confidence) => {
  if (confidence >= 85) return '#2e7d32';
  if (confidence >= 70) return '#f9a825';
  if (confidence >= 50) return '#e65100';
  return '#c62828';
};

export const getConfidenceLabel = (confidence) => {
  if (confidence >= 85) return 'Very High';
  if (confidence >= 70) return 'High';
  if (confidence >= 50) return 'Moderate';
  if (confidence >= 30) return 'Low';
  return 'Very Low';
};

export const getCategoryIcon = (category) => {
  const icons = {
    'Mobile Money Fraud': 'PhoneAndroid',
    'Phishing': 'Phishing',
    'Fake Bank Alert': 'AccountBalance',
    'Fake Job Scam': 'Work',
    'Fake Loan Scam': 'RequestQuote',
    'Fake Prize Scam': 'EmojiEvents',
    'Delivery Scam': 'LocalShipping',
    'Identity Theft Attempt': 'Badge',
    'OTP/PIN Theft Attempt': 'Lock',
    'Safe': 'CheckCircle',
  };
  return icons[category] || 'Warning';
};

export const formatTimeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString();
};
