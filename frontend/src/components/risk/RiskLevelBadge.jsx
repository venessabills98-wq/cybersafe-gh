import React from 'react';
import { Chip } from '@mui/material';
import { getRiskColor } from '../../utils/riskHelpers';

const RiskLevelBadge = ({ level }) => {
  const color = getRiskColor(level);

  return (
    <Chip
      label={level}
      sx={{
        backgroundColor: color,
        color: 'common.white',
        fontWeight: 700,
        fontSize: '1rem',
        px: 2,
        py: 0.5,
        height: 'auto',
      }}
    />
  );
};

export default RiskLevelBadge;
