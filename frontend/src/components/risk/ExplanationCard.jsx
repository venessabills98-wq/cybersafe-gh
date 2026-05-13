import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const ExplanationCard = ({ explanation }) => {
  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <InfoOutlinedIcon color="info" />
          <Typography variant="h6">Analysis Explanation</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {explanation || 'No explanation available.'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ExplanationCard;
