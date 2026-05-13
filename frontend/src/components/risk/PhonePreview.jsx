import React from 'react';
import { Box, Typography } from '@mui/material';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import TextHighlighter from './TextHighlighter';

const PhonePreview = ({ message, senderInfo, indicators }) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Box
      sx={{
        maxWidth: 340,
        mx: 'auto',
        border: '3px solid',
        borderColor: 'divider',
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: 'background.default',
      }}
    >
      {/* Status bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 1.5,
          py: 0.5,
          backgroundColor: 'action.hover',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
          {timeStr}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SignalCellularAltIcon sx={{ fontSize: 14 }} />
          <BatteryFullIcon sx={{ fontSize: 14 }} />
        </Box>
      </Box>

      {/* Header */}
      <Box sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider', backgroundColor: 'action.hover' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {senderInfo || 'Unknown Sender'}
        </Typography>
        <Typography variant="caption" color="text.secondary">SMS Message</Typography>
      </Box>

      {/* Message bubble */}
      <Box sx={{ p: 2, minHeight: 120 }}>
        <Box
          sx={{
            backgroundColor: 'action.selected',
            borderRadius: 2,
            borderTopLeftRadius: 0,
            p: 1.5,
            maxWidth: '90%',
          }}
        >
          <TextHighlighter text={message} indicators={indicators} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
            {timeStr}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PhonePreview;
