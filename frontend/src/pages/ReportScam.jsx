import React, { useState } from 'react';
import {
  Container, Typography, Card, CardContent, TextField, Button,
  Box, FormControl, InputLabel, Select, MenuItem, Alert, LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { createReport } from '../services/api';
import { getSessionId } from '../utils/sessionHelper';

const CATEGORIES = [
  'Mobile Money Fraud', 'Phishing', 'Fake Bank Alert', 'Fake Job Scam',
  'Fake Loan Scam', 'Fake Prize Scam', 'Delivery Scam',
  'Identity Theft Attempt', 'OTP/PIN Theft Attempt',
];

const ReportScam = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    message_text: '',
    message_type: 'sms',
    sender_info: '',
    scam_category: '',
    description: '',
    reporter_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message_text.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await createReport({
        ...form,
        message_text: form.message_text.trim(),
        session_id: getSessionId(),
        scam_category: form.scam_category || undefined,
        sender_info: form.sender_info || undefined,
        description: form.description || undefined,
        reporter_name: form.reporter_name || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Report submitted successfully! It will be reviewed by our moderators.
        </Alert>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => navigate('/community')}>
            View Community Reports
          </Button>
          <Button variant="outlined" onClick={() => { setSuccess(false); setForm({ message_text: '', message_type: 'sms', sender_info: '', scam_category: '', description: '', reporter_name: '' }); }}>
            Submit Another
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/community')} sx={{ mb: 2 }}>
        Back to Community
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Report a Scam</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Help protect the community by reporting suspicious messages you've received.
      </Typography>

      <Card elevation={2}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth required multiline rows={4}
              label="Suspicious Message"
              placeholder="Paste the suspicious message here..."
              value={form.message_text}
              onChange={handleChange('message_text')}
              slotProps={{ htmlInput: { maxLength: 5000 } }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Message Type</InputLabel>
                <Select value={form.message_type} label="Message Type" onChange={handleChange('message_type')}>
                  <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="whatsapp">WhatsApp</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small" fullWidth
                label="Sender Info (optional)"
                placeholder="Phone, email, or name"
                value={form.sender_info}
                onChange={handleChange('sender_info')}
              />
            </Box>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Scam Category (optional)</InputLabel>
              <Select value={form.scam_category} label="Scam Category (optional)" onChange={handleChange('scam_category')}>
                <MenuItem value="">Not sure</MenuItem>
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth multiline rows={2} size="small"
              label="Description (optional)"
              placeholder="Add any additional context..."
              value={form.description}
              onChange={handleChange('description')}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth size="small"
              label="Your Name (optional)"
              placeholder="Anonymous if left blank"
              value={form.reporter_name}
              onChange={handleChange('reporter_name')}
              sx={{ mb: 2 }}
            />

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button
              type="submit" variant="contained" fullWidth size="large"
              disabled={!form.message_text.trim() || loading}
              startIcon={<SendIcon />}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ReportScam;
