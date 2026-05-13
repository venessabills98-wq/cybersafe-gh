import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import TextHighlighter from './TextHighlighter';

const EmailPreview = ({ message, senderInfo, indicators }) => {
  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: 'auto',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
      }}
    >
      {/* Email toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          backgroundColor: 'action.hover',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <EmailIcon sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Suspicious Email</Typography>
      </Box>

      {/* Email headers */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50 }}>From:</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main' }}>
            {senderInfo || 'unknown@suspicious.com'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50 }}>To:</Typography>
          <Typography variant="caption">you@email.com</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50 }}>Subject:</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Suspicious Message</Typography>
        </Box>
      </Box>

      <Divider />

      {/* Email body */}
      <Box sx={{ p: 2, minHeight: 100 }}>
        <TextHighlighter text={message} indicators={indicators} />
      </Box>
    </Box>
  );
};

export default EmailPreview;
