import React, { useState } from 'react';
import {
  Card, CardContent, TextField, Button, Typography, LinearProgress,
  Alert, Box, Snackbar, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Tabs, Tab, FormControl,
  InputLabel, Select, MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useAnalysis } from '../../context/AnalysisContext';
import { useNavigate } from 'react-router-dom';
import ScreenshotUpload from './ScreenshotUpload';

const MAX_CHARS = 5000;

const AnalyzerForm = () => {
  const [message, setMessage] = useState('');
  const [senderInfo, setSenderInfo] = useState('');
  const [messageType, setMessageType] = useState('sms');
  const [tab, setTab] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { analyzeMessage, analyzeScreenshot, loading, error, clearResult } = useAnalysis();
  const navigate = useNavigate();

  const dismissError = () => clearResult();

  const performAnalysis = async () => {
    try {
      await analyzeMessage(message.trim(), senderInfo.trim() || null, messageType);
      navigate('/results');
    } catch (err) {
      // Error handled by context
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    if (message.trim().length < 10) {
      setConfirmOpen(true);
      return;
    }
    await performAnalysis();
  };

  const handleConfirmedSubmit = async () => {
    setConfirmOpen(false);
    await performAnalysis();
  };

  const handleScreenshotUpload = async (file) => {
    try {
      await analyzeScreenshot(file);
      navigate('/results');
    } catch (err) {
      // Error handled by context
    }
  };

  return (
    <Card elevation={3}>
      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h5" gutterBottom>
          Analyze a Suspicious Message
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Paste text or upload a screenshot to check for scam indicators.
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<TextFieldsIcon />} label="Paste Text" iconPosition="start" />
          <Tab icon={<PhotoCameraIcon />} label="Upload Screenshot" iconPosition="start" />
        </Tabs>

        {tab === 0 ? (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth multiline rows={5} variant="outlined"
              placeholder="Paste your suspicious message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
              disabled={loading}
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {message.length}/{MAX_CHARS} characters
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Message Type</InputLabel>
                <Select value={messageType} label="Message Type" onChange={(e) => setMessageType(e.target.value)}>
                  <MenuItem value="sms">SMS</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="whatsapp">WhatsApp</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small" fullWidth
                label="Sender Info (optional)"
                placeholder="Phone number, email, or sender name"
                value={senderInfo}
                onChange={(e) => setSenderInfo(e.target.value)}
                disabled={loading}
              />
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={dismissError}>{error}</Alert>}

            <Button
              type="submit" variant="contained" size="large" fullWidth
              disabled={!message.trim() || loading}
              startIcon={<SearchIcon />}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Analyzing...' : 'Analyze Message'}
            </Button>
          </Box>
        ) : (
          <Box>
            <ScreenshotUpload onUpload={handleScreenshotUpload} loading={loading} />
            {error && <Alert severity="error" sx={{ mt: 2 }} onClose={dismissError}>{error}</Alert>}
          </Box>
        )}

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={dismissError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" variant="filled" sx={{ width: '100%' }} onClose={dismissError}>
            {error}
          </Alert>
        </Snackbar>
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Short Message</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This message is very short and may not contain enough context for accurate analysis. Do you want to proceed?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmedSubmit} variant="contained">Analyze Anyway</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AnalyzerForm;
