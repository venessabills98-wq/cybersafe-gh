import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Button, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getRiskColor } from '../../utils/riskHelpers';
import { formatTimeAgo } from '../../utils/sessionHelper';

const AdminReportTable = ({ reports, onOpenModerate }) => {
  if (!reports || reports.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No reports to display</Typography>
      </Paper>
    );
  }

  const statusColor = (s) => {
    if (s === 'approved') return 'success';
    if (s === 'rejected') return 'error';
    if (s === 'flagged') return 'warning';
    return 'default';
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Message</TableCell>
            <TableCell align="center">Risk</TableCell>
            <TableCell align="center">Category</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Votes</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {report.message_text}
              </TableCell>
              <TableCell align="center">
                {report.auto_risk_level && (
                  <Chip
                    label={`${report.auto_risk_score} - ${report.auto_risk_level}`}
                    size="small"
                    sx={{ backgroundColor: getRiskColor(report.auto_risk_level), color: 'white', fontWeight: 600 }}
                  />
                )}
              </TableCell>
              <TableCell align="center">
                <Chip label={report.auto_scam_category || 'N/A'} size="small" variant="outlined" />
              </TableCell>
              <TableCell align="center">
                <Chip label={report.status} size="small" color={statusColor(report.status)} />
              </TableCell>
              <TableCell align="center">
                <Typography variant="caption">
                  +{report.upvote_count || 0} / -{report.downvote_count || 0}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption">{formatTimeAgo(report.created_at)}</Typography>
              </TableCell>
              <TableCell align="center">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => onOpenModerate(report)}
                >
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AdminReportTable;
