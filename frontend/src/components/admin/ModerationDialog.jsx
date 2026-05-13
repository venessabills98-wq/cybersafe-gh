import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Typography, Box, Chip, Slider, Divider,
} from '@mui/material';
import { getRiskColor } from '../../utils/riskHelpers';

const CATEGORIES = [
  'Mobile Money Fraud', 'Phishing', 'Fake Bank Alert', 'Fake Job Scam',
  'Fake Loan Scam', 'Fake Prize Scam', 'Delivery Scam',
  'Identity Theft Attempt', 'OTP/PIN Theft Attempt', 'Safe',
];

const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

const scoreToLevel = (score) => {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Medium';
  if (score <= 75) return 'High';
  return 'Critical';
};

const ModerationDialog = ({ open, report, onClose, onSubmit }) => {
  const [status, setStatus] = useState('approved');
  const [note, setNote] = useState('');
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('Low');
  const [scamCategory, setScamCategory] = useState('');

  // Sync fields when report changes
  useEffect(() => {
    if (report) {
      setStatus('approved');
      setNote('');
      setRiskScore(report.auto_risk_score ?? 0);
      setRiskLevel(report.auto_risk_level ?? 'Low');
      setScamCategory(report.auto_scam_category ?? '');
    }
  }, [report]);

  const handleScoreChange = (_, value) => {
    setRiskScore(value);
    setRiskLevel(scoreToLevel(value));
  };

  const handleSubmit = () => {
    onSubmit(report?.id, {
      status,
      moderation_note: note,
      risk_score: riskScore,
      risk_level: riskLevel,
      scam_category: scamCategory,
    });
  };

  if (!report) return null;

  const currentColor = getRiskColor(riskLevel);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Moderate Report</DialogTitle>
      <DialogContent>
        {/* Original message */}
        <Typography variant="overline" color="text.secondary">Reported Message</Typography>
        <Typography
          variant="body2"
          sx={{ mb: 2, p: 1.5, backgroundColor: 'action.hover', borderRadius: 1, whiteSpace: 'pre-wrap' }}
        >
          {report.message_text}
        </Typography>

        {/* Auto-analysis summary (read-only) */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {report.auto_risk_level && (
            <Chip
              label={`Auto: ${report.auto_risk_score} (${report.auto_risk_level})`}
              size="small"
              sx={{ backgroundColor: getRiskColor(report.auto_risk_level), color: 'white' }}
            />
          )}
          {report.auto_scam_category && (
            <Chip label={`Auto: ${report.auto_scam_category}`} size="small" variant="outlined" />
          )}
          {report.auto_confidence && (
            <Chip label={`${report.auto_confidence}% confidence`} size="small" variant="outlined" />
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Editable risk fields */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Risk Assessment (editable)</Typography>

        <Box sx={{ px: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2">Risk Score</Typography>
            <Chip
              label={`${riskScore} — ${riskLevel}`}
              size="small"
              sx={{ backgroundColor: currentColor, color: 'white', fontWeight: 600 }}
            />
          </Box>
          <Slider
            value={riskScore}
            onChange={handleScoreChange}
            min={0}
            max={100}
            valueLabelDisplay="auto"
            sx={{
              color: currentColor,
              '& .MuiSlider-thumb': { width: 20, height: 20 },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">0 — Safe</Typography>
            <Typography variant="caption" color="text.secondary">100 — Critical</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Risk Level</InputLabel>
            <Select value={riskLevel} label="Risk Level" onChange={(e) => setRiskLevel(e.target.value)}>
              {RISK_LEVELS.map((lvl) => (
                <MenuItem key={lvl} value={lvl}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: getRiskColor(lvl) }} />
                    {lvl}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Scam Category</InputLabel>
            <Select value={scamCategory} label="Scam Category" onChange={(e) => setScamCategory(e.target.value)}>
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Moderation action */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="flagged">Flagged</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={2}
          label="Moderation Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModerationDialog;
