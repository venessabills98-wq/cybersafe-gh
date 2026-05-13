import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const CATEGORIES = [
  'All Categories',
  'Mobile Money Fraud',
  'Phishing',
  'Fake Bank Alert',
  'Fake Job Scam',
  'Fake Loan Scam',
  'Fake Prize Scam',
  'Delivery Scam',
  'Identity Theft Attempt',
  'OTP/PIN Theft Attempt',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'most_voted', label: 'Most Voted' },
  { value: 'highest_risk', label: 'Highest Risk' },
];

const ReportFilters = ({ category, sortBy, search, onCategoryChange, onSortChange, onSearchChange }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel>Category</InputLabel>
        <Select value={category || ''} label="Category" onChange={(e) => onCategoryChange(e.target.value || null)}>
          {CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat === 'All Categories' ? '' : cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Sort By</InputLabel>
        <Select value={sortBy} label="Sort By" onChange={(e) => onSortChange(e.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        placeholder="Search reports..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flexGrow: 1, minWidth: 200 }}
      />
    </Box>
  );
};

export default ReportFilters;
