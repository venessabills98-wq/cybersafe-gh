import React from 'react';
import { Box, Typography, Tooltip, CircularProgress } from '@mui/material';

const getConfidenceColor = (confidence) => {
  if (confidence >= 85) return '#2e7d32';
  if (confidence >= 70) return '#f9a825';
  if (confidence >= 50) return '#e65100';
  return '#c62828';
};

const ConfidenceIndicator = ({ confidence, label }) => {
  const color = getConfidenceColor(confidence);

  return (
    <Tooltip title={`Analysis confidence: ${label || 'Unknown'}`} arrow>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={48}
            thickness={4}
            sx={{ color: 'action.hover', position: 'absolute' }}
          />
          <CircularProgress
            variant="determinate"
            value={confidence}
            size={48}
            thickness={4}
            sx={{ color }}
          />
          <Box
            sx={{
              top: 0, left: 0, bottom: 0, right: 0,
              position: 'absolute',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', color }}>
              {confidence}%
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
            Confidence
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color, lineHeight: 1.2 }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  );
};

export default ConfidenceIndicator;
