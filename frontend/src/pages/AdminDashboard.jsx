import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Grid, Box, Alert, CircularProgress,
  Button, FormControl, InputLabel, Select, MenuItem, Pagination,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboard, getAdminReports, moderateReport } from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import AdminReportTable from '../components/admin/AdminReportTable';
import ModerationDialog from '../components/admin/ModerationDialog';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FlagIcon from '@mui/icons-material/Flag';
import AssessmentIcon from '@mui/icons-material/Assessment';

const AdminDashboard = () => {
  const { token, admin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modDialog, setModDialog] = useState({ open: false, report: null });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!token) return;
    getAdminDashboard(token).then(setStats).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getAdminReports(token, { page, status: statusFilter || undefined })
      .then((data) => {
        setReports(data.reports);
        setTotal(data.total);
      })
      .catch((err) => setError('Failed to load reports'))
      .finally(() => setLoading(false));
  }, [token, page, statusFilter]);

  const handleModerate = async (reportId, data) => {
    try {
      await moderateReport(token, reportId, data);
      setModDialog({ open: false, report: null });
      // Refresh
      const reportsData = await getAdminReports(token, { page, status: statusFilter || undefined });
      setReports(reportsData.reports);
      setTotal(reportsData.total);
      const newStats = await getAdminDashboard(token);
      setStats(newStats);
    } catch (err) {
      setError('Failed to moderate report');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated) return null;

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Admin Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome, {admin?.email}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard icon={<PendingActionsIcon />} label="Pending" value={stats.pending_reports} color="warning.main" />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard icon={<CheckCircleIcon />} label="Approved" value={stats.approved_reports} color="success.main" />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard icon={<CancelIcon />} label="Rejected" value={stats.rejected_reports} color="error.main" />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard icon={<FlagIcon />} label="Flagged" value={stats.flagged_reports} color="info.main" />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard icon={<AssessmentIcon />} label="Analyses" value={stats.total_analyses} />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <StatCard
              icon={<AssessmentIcon />}
              label="Avg Confidence"
              value={stats.avg_confidence ? `${stats.avg_confidence}%` : 'N/A'}
            />
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Typography variant="h6">Reports</Typography>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="flagged">Flagged</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <>
          <AdminReportTable reports={reports} onOpenModerate={(report) => setModDialog({ open: true, report })} />
          {total > 20 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination count={Math.ceil(total / 20)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
            </Box>
          )}
        </>
      )}

      <ModerationDialog
        open={modDialog.open}
        report={modDialog.report}
        onClose={() => setModDialog({ open: false, report: null })}
        onSubmit={handleModerate}
      />
    </Container>
  );
};

export default AdminDashboard;
