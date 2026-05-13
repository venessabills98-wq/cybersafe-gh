import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Card, CardContent, Chip, Alert, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport, voteOnReport } from '../services/api';
import { getSessionId, formatTimeAgo } from '../utils/sessionHelper';
import { getRiskColor } from '../utils/riskHelpers';
import MessagePreview from '../components/risk/MessagePreview';
import VoteButtons from '../components/community/VoteButtons';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sessionId = getSessionId();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getReport(id, sessionId);
        setReport(data);
      } catch (err) {
        setError('Report not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, sessionId]);

  const handleVote = async (voteType) => {
    try {
      const result = await voteOnReport(id, sessionId, voteType);
      setReport((prev) => ({
        ...prev,
        upvote_count: result.upvote_count,
        downvote_count: result.downvote_count,
        user_vote: result.vote_type,
      }));
    } catch (err) {
      // ignore
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !report) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Report not found'}</Alert>
        <Button onClick={() => navigate('/community')} sx={{ mt: 2 }}>Back to Community</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/community')} sx={{ mb: 2 }}>
        Back to Community
      </Button>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {report.auto_scam_category && (
          <Chip label={report.auto_scam_category} color="warning" />
        )}
        {report.auto_risk_level && (
          <Chip
            label={`Risk: ${report.auto_risk_score} (${report.auto_risk_level})`}
            sx={{ backgroundColor: getRiskColor(report.auto_risk_level), color: 'white', fontWeight: 600 }}
          />
        )}
        {report.auto_confidence && (
          <Chip label={`${report.auto_confidence}% confidence`} variant="outlined" />
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">{report.view_count} views</Typography>
        </Box>
      </Box>

      <MessagePreview
        message={report.message_text}
        messageType={report.message_type}
        senderInfo={report.sender_info}
      />

      {report.description && (
        <Card elevation={2} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Reporter's Description</Typography>
            <Typography variant="body2">{report.description}</Typography>
          </CardContent>
        </Card>
      )}

      <Card elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Reported {formatTimeAgo(report.created_at)}
                {report.reporter_name ? ` by ${report.reporter_name}` : ' anonymously'}
              </Typography>
            </Box>
            <VoteButtons
              upvotes={report.upvote_count}
              downvotes={report.downvote_count}
              userVote={report.user_vote}
              onVote={handleVote}
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ReportDetail;
