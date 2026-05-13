import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, Chip, Box } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const GhanaPatterns = ({ patterns }) => {
  if (!patterns || patterns.length === 0) return null;

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PlaceIcon sx={{ color: 'warning.main' }} />
          <Typography variant="h6">Ghana-Specific Patterns</Typography>
        </Box>
        <List dense>
          {patterns.map((pattern, index) => (
            <ListItem key={index} sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <InfoOutlinedIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={pattern.name}
                  primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                />
                <Chip label={`+${pattern.score}`} size="small" color="warning" variant="outlined" />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ pl: 4.5, mt: 0.5 }}>
                {pattern.explanation}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default GhanaPatterns;
