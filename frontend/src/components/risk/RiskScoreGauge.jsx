import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, keyframes } from '@mui/material';
import { getRiskColor } from '../../utils/riskHelpers';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const RiskScoreGauge = ({ score, level }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const safeScore = typeof score === 'number' ? score : 0;
  const color = getRiskColor(level);

  // Animated count-up
  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.ceil(safeScore / 30));
    const interval = setInterval(() => {
      current += step;
      if (current >= safeScore) {
        current = safeScore;
        clearInterval(interval);
      }
      setDisplayScore(current);
    }, 30);
    return () => clearInterval(interval);
  }, [safeScore]);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        animation: level === 'Critical' ? `${pulse} 2s ease-in-out infinite` : 'none',
      }}
    >
      <CircularProgress
        variant="determinate"
        value={100}
        size={160}
        thickness={4}
        sx={{ color: 'action.hover', position: 'absolute' }}
      />
      <CircularProgress
        variant="determinate"
        value={displayScore}
        size={160}
        thickness={4}
        sx={{
          color,
          transition: 'none',
          '& circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Box
        sx={{
          top: 0, left: 0, bottom: 0, right: 0,
          position: 'absolute',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 800, color }}>
          {displayScore}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          / 100
        </Typography>
      </Box>
    </Box>
  );
};

export default RiskScoreGauge;
