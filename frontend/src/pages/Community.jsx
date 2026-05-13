import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box, Button, Fab, Pagination, Alert, CircularProgress, Grid, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from 'react-router-dom';
import { getReports, getCommunityStats, voteOnReport } from '../services/api';
import { getSessionId } from '../utils/sessionHelper';
import ReportCard from '../components/community/ReportCard';
import ReportFilters from '../components/community/ReportFilters';

const Community = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const sessionId = getSessionId();

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReports({ page, category, sort_by: sortBy, session_id: sessionId });
      setReports(data.reports);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [page, category, sortBy, sessionId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    getCommunityStats().then(setStats).catch(() => {});
  }, []);

  const handleVote = async (reportId, voteType) => {
    try {
      const result = await voteOnReport(reportId, sessionId, voteType);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, upvote_count: result.upvote_count, downvote_count: result.downvote_count, user_vote: result.vote_type }
            : r
        )
      );
    } catch (err) {
      // ignore
    }
  };

  const filteredReports = search
    ? reports.filter((r) => r.message_text.toLowerCase().includes(search.toLowerCase()))
    : reports;

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Community Reports</Typography>
          <Typography variant="body2" color="text.secondary">
            Browse and vote on scam reports from the community
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/community/report')}>
          Report a Scam
        </Button>
      </Box>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.total_reports}</Typography>
                <Typography variant="caption" color="text.secondary">Total Reports</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.approved_reports}</Typography>
                <Typography variant="caption" color="text.secondary">Verified</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{stats.recent_reports_count}</Typography>
                <Typography variant="caption" color="text.secondary">This Week</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {Object.keys(stats.top_categories || {}).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">Categories</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <ReportFilters
        category={category}
        sortBy={sortBy}
        search={search}
        onCategoryChange={(v) => { setCategory(v); setPage(1); }}
        onSortChange={(v) => { setSortBy(v); setPage(1); }}
        onSearchChange={setSearch}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredReports.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">No reports yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Be the first to report a scam and help protect the community.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/community/report')}>
            Report a Scam
          </Button>
        </Box>
      ) : (
        <>
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onVote={(type) => handleVote(report.id, type)}
              onClick={() => navigate(`/community/report/${report.id}`)}
            />
          ))}
          {total > 10 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(total / 10)}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24, display: { xs: 'flex', md: 'none' } }}
        onClick={() => navigate('/community/report')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default Community;
