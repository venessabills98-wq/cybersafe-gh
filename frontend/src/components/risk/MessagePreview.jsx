import React from 'react';
import { Box, Typography } from '@mui/material';
import PhonePreview from './PhonePreview';
import EmailPreview from './EmailPreview';
import WhatsAppPreview from './WhatsAppPreview';

const MessagePreview = ({ message, messageType, senderInfo, indicators }) => {
  if (!message) return null;

  const type = (messageType || 'sms').toLowerCase();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1, textAlign: 'center' }}>
        Original Message
      </Typography>
      {type === 'email' ? (
        <EmailPreview message={message} senderInfo={senderInfo} indicators={indicators} />
      ) : type === 'whatsapp' ? (
        <WhatsAppPreview message={message} senderInfo={senderInfo} indicators={indicators} />
      ) : (
        <PhonePreview message={message} senderInfo={senderInfo} indicators={indicators} />
      )}
    </Box>
  );
};

export default MessagePreview;
