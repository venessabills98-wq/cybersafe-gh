import React from 'react';
import { Card, CardContent, Typography, Alert, Stack } from '@mui/material';

const AdviceCard = ({ advice, riskLevel }) => {
  if (!advice || advice.length === 0) return null;
  const severity = riskLevel === 'Critical' || riskLevel === 'High' ? 'error' : 'warning';

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Safety Recommendations
        </Typography>
        <Stack spacing={1}>
          {advice.map((tip, index) => (
            <Alert key={index} severity={severity} variant="outlined" sx={{ py: 0 }}>
              {tip}
            </Alert>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AdviceCard;
