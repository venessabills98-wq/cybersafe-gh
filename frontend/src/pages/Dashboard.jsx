import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Grid, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Box,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { getDashboardStats, getCommunityStats } from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import RiskBarChart from '../components/dashboard/RiskBarChart';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [communityStats, setCommunityStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard data. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    getCommunityStats().then(setCommunityStats).catch(() => {});
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LoadingSkeleton variant="dashboard" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const mostCommonCategory = stats?.category_distribution
    ? Object.entries(stats.category_distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    : 'N/A';

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Analytics Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of all analyzed messages and detected threats.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            icon={<AssessmentIcon sx={{ fontSize: 36 }} />}
            label="Total Analyzed"
            value={stats?.total_messages || 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            icon={<WarningAmberIcon sx={{ fontSize: 36 }} />}
            label="High Risk %"
            value={`${stats?.high_risk_percentage || 0}%`}
            color="error.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            icon={<TrendingUpIcon sx={{ fontSize: 36 }} />}
            label="Top Scam"
            value={mostCommonCategory}
            color="warning.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            icon={<PeopleIcon sx={{ fontSize: 36 }} />}
            label="Community Reports"
            value={communityStats?.total_reports || 0}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatCard
            icon={<PhotoCameraIcon sx={{ fontSize: 36 }} />}
            label="Screenshots"
            value={0}
            color="secondary.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CategoryPieChart data={stats?.category_distribution} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <RiskBarChart data={stats?.risk_level_distribution} />
        </Grid>
      </Grid>

      {stats?.recent_analyses && stats.recent_analyses.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recent Analyses
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Message</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell align="center">Risk Level</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recent_analyses.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.message_preview}
                    </TableCell>
                    <TableCell align="center">{row.risk_score}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.risk_level}
                        size="small"
                        sx={{
                          backgroundColor: row.risk_level === 'Critical' ? 'risk.critical' : row.risk_level === 'High' ? 'risk.high' : row.risk_level === 'Medium' ? 'risk.medium' : 'risk.low',
                          color: 'common.white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.scam_category}</TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
