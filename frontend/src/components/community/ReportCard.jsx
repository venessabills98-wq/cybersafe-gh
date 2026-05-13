import React from 'react';
import { Card, CardContent, CardActionArea, Typography, Box, Chip } from '@mui/material';
import { getRiskColor } from '../../utils/riskHelpers';
import { formatTimeAgo } from '../../utils/sessionHelper';
import VoteButtons from './VoteButtons';

const ReportCard = ({ report, onVote, onClick }) => {
  const riskColor = getRiskColor(report.auto_risk_level);

  return (
    <Card elevation={2} sx={{ mb: 2 }}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {report.auto_scam_category && (
                <Chip label={report.auto_scam_category} size="small" color="warning" variant="outlined" />
              )}
              {report.auto_risk_level && (
                <Chip
                  label={report.auto_risk_level}
                  size="small"
                  sx={{ backgroundColor: riskColor, color: 'white', fontWeight: 600 }}
                />
              )}
              {report.auto_confidence && (
                <Chip label={`${report.auto_confidence}% confidence`} size="small" variant="outlined" />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {formatTimeAgo(report.created_at)}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
            {report.message_text}
          </Typography>

          {report.description && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {report.description.slice(0, 120)}{report.description.length > 120 ? '...' : ''}
            </Typography>
          )}

          {report.reporter_name && (
            <Typography variant="caption" color="text.secondary">
              Reported by {report.reporter_name}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
      <Box sx={{ px: 2, pb: 1.5 }} onClick={(e) => e.stopPropagation()}>
        <VoteButtons
          upvotes={report.upvote_count}
          downvotes={report.downvote_count}
          userVote={report.user_vote}
          onVote={onVote}
        />
      </Box>
    </Card>
  );
};

export default ReportCard;
