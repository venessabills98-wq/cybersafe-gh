import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import PersonIcon from '@mui/icons-material/Person';
import HelpIcon from '@mui/icons-material/Help';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const typeIcons = {
  phone: <PhoneIcon sx={{ fontSize: 28 }} />,
  email: <EmailIcon sx={{ fontSize: 28 }} />,
  short_code: <SmsIcon sx={{ fontSize: 28 }} />,
  name: <PersonIcon sx={{ fontSize: 28 }} />,
  unknown: <HelpIcon sx={{ fontSize: 28 }} />,
};

const SenderAnalysis = ({ senderAnalysis }) => {
  if (!senderAnalysis) return null;

  const { sender_type, is_suspicious, reason, known_entity } = senderAnalysis;
  const icon = typeIcons[sender_type] || typeIcons.unknown;

  return (
    <Card elevation={2}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color: is_suspicious ? 'error.main' : 'success.main' }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="overline" color="text.secondary">Sender Analysis</Typography>
            <Chip
              icon={is_suspicious ? <WarningIcon /> : <CheckCircleIcon />}
              label={is_suspicious ? 'Suspicious' : 'Safe'}
              size="small"
              color={is_suspicious ? 'error' : 'success'}
              variant="outlined"
            />
          </Box>
          <Typography variant="body2">{reason}</Typography>
          {known_entity && (
            <Typography variant="caption" color="text.secondary">
              Recognized: {known_entity}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SenderAnalysis;
