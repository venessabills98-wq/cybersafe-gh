import React, { useState, useCallback } from 'react';
import { Box, Typography, Button, Alert, LinearProgress, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const ScreenshotUpload = ({ onUpload, loading, ocrProgress }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return 'Invalid file type. Please upload PNG, JPG, or WebP images.';
    }
    if (f.size > MAX_SIZE_BYTES) {
      return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = useCallback((f) => {
    setError(null);
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleInputChange = (e) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const handleSubmit = () => {
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <Box>
      {!file ? (
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            border: '2px dashed',
            borderColor: dragActive ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragActive ? 'action.hover' : 'transparent',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
          }}
          onClick={() => document.getElementById('screenshot-input').click()}
        >
          <input
            id="screenshot-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={handleInputChange}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" sx={{ mb: 0.5 }}>
            Drag & drop a screenshot here, or click to browse
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PNG, JPG, or WebP — Max {MAX_SIZE_MB}MB
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {preview && (
              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
              />
            )}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2" noWrap>{file.name}</Typography>
              </Box>
              <Chip
                label={`${(file.size / 1024).toFixed(1)} KB`}
                size="small"
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={handleRemove} disabled={loading}>
              Remove
            </Button>
          </Box>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          {ocrProgress && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {ocrProgress}
            </Typography>
          )}
        </Box>
      )}

      {file && (
        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          startIcon={<CloudUploadIcon />}
          sx={{ mt: 2, py: 1.5 }}
        >
          {loading ? (ocrProgress || 'Processing...') : 'Analyze Screenshot'}
        </Button>
      )}
    </Box>
  );
};

export default ScreenshotUpload;
