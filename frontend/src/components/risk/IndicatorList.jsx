import React, { useState } from 'react';
import {
  Card, CardContent, Typography, List, ListItem, ListItemIcon,
  ListItemText, Chip, Box, Collapse, IconButton, LinearProgress,
} from '@mui/material';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const getIndicatorColor = (name) => {
  const n = name.toLowerCase();
  if (n.includes('credential') || n.includes('otp') || n.includes('pin')) return '#ef5350';
  if (n.includes('urgency')) return '#ff9800';
  if (n.includes('financial') || n.includes('payment')) return '#fdd835';
  if (n.includes('link')) return '#42a5f5';
  if (n.includes('impersonation')) return '#ab47bc';
  if (n.includes('suspension')) return '#ff7043';
  return '#ef5350';
};

const IndicatorList = ({ indicators }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!indicators || indicators.length === 0) return null;

  const maxScore = Math.max(...indicators.map((i) => i.score), 1);

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Detected Indicators
        </Typography>
        <List dense>
          {indicators.map((indicator, index) => {
            const color = getIndicatorColor(indicator.name);
            const hasDetail = !!indicator.detail;

            return (
              <Box key={index}>
                <ListItem
                  sx={{ px: 0, cursor: hasDetail ? 'pointer' : 'default' }}
                  onClick={() => hasDetail && setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ReportProblemOutlinedIcon sx={{ color }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={indicator.name}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 60 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(indicator.score / maxScore) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'action.hover',
                          '& .MuiLinearProgress-bar': { backgroundColor: color, borderRadius: 3 },
                        }}
                      />
                    </Box>
                    <Chip label={`+${indicator.score}`} size="small" sx={{ backgroundColor: color + '22', color, fontWeight: 600, borderColor: color }} variant="outlined" />
                    {hasDetail && (
                      <IconButton size="small">
                        {expandedIndex === index ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
                {hasDetail && (
                  <Collapse in={expandedIndex === index}>
                    <Box sx={{ pl: 4.5, pb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {indicator.detail}
                      </Typography>
                    </Box>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default IndicatorList;
