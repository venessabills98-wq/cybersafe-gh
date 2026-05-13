import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WorkIcon from '@mui/icons-material/Work';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BadgeIcon from '@mui/icons-material/Badge';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

const categoryIcons = {
  'Mobile Money Fraud': <PhoneAndroidIcon sx={{ fontSize: 36, color: 'warning.main' }} />,
  'Phishing': <WarningAmberIcon sx={{ fontSize: 36, color: 'error.main' }} />,
  'Fake Bank Alert': <AccountBalanceIcon sx={{ fontSize: 36, color: 'error.main' }} />,
  'Fake Job Scam': <WorkIcon sx={{ fontSize: 36, color: 'warning.main' }} />,
  'Fake Loan Scam': <RequestQuoteIcon sx={{ fontSize: 36, color: 'warning.main' }} />,
  'Fake Prize Scam': <EmojiEventsIcon sx={{ fontSize: 36, color: 'warning.main' }} />,
  'Delivery Scam': <LocalShippingIcon sx={{ fontSize: 36, color: 'warning.main' }} />,
  'Identity Theft Attempt': <BadgeIcon sx={{ fontSize: 36, color: 'error.main' }} />,
  'OTP/PIN Theft Attempt': <LockIcon sx={{ fontSize: 36, color: 'error.main' }} />,
  'Safe': <CheckCircleIcon sx={{ fontSize: 36, color: 'success.main' }} />,
};

const ScamCategoryCard = ({ category, confidence }) => {
  const icon = categoryIcons[category] || <WarningAmberIcon sx={{ fontSize: 36, color: 'warning.main' }} />;

  return (
    <Card elevation={2}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon}
        <Box sx={{ flex: 1 }}>
          <Typography variant="overline" color="text.secondary">
            Scam Category
          </Typography>
          <Typography variant="h6">{category || 'Unknown'}</Typography>
        </Box>
        {confidence !== undefined && (
          <Typography variant="caption" color="text.secondary">
            {confidence}% confidence
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ScamCategoryCard;
