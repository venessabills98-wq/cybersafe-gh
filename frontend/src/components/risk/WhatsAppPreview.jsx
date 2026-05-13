import React from 'react';
import { Box, Typography } from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import TextHighlighter from './TextHighlighter';

const WhatsAppPreview = ({ message, senderInfo, indicators }) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Box
      sx={{
        maxWidth: 380,
        mx: 'auto',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* WhatsApp header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1,
          backgroundColor: '#075e54',
          color: 'white',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#128c7e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {(senderInfo || '?')[0].toUpperCase()}
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700 }}>
            {senderInfo || 'Unknown'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>
            online
          </Typography>
        </Box>
      </Box>

      {/* Chat area */}
      <Box
        sx={{
          p: 2,
          minHeight: 120,
          backgroundColor: 'background.default',
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Incoming message bubble */}
        <Box
          sx={{
            backgroundColor: '#dcf8c6',
            color: '#000',
            borderRadius: 2,
            borderTopLeftRadius: 0,
            p: 1.5,
            maxWidth: '85%',
            position: 'relative',
          }}
        >
          <TextHighlighter text={message} indicators={indicators} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.65rem' }}>
              {timeStr}
            </Typography>
            <DoneAllIcon sx={{ fontSize: 14, color: '#53bdeb' }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WhatsAppPreview;
