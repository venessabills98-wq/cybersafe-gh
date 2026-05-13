import React from 'react';
import { Box, Typography } from '@mui/material';

const HIGHLIGHT_PATTERNS = [
  { regex: /\b(otp|pin|password|cvv|verification code|secret code|access code|card number)\b/gi, color: '#ef5350', label: 'credential' },
  { regex: /\b(urgent|immediately|blocked|suspended|verify now|limited time|act now|expire|right now)\b/gi, color: '#ff9800', label: 'urgency' },
  { regex: /\b(reward|prize|money|loan|payment|fee|cash|bonus|winnings|ghs|cedis?|ghc)\b/gi, color: '#fdd835', label: 'financial' },
  { regex: /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi, color: '#42a5f5', label: 'url' },
];

const TextHighlighter = ({ text, indicators = [] }) => {
  if (!text) return null;

  // Build a list of matches with positions
  const matches = [];
  HIGHLIGHT_PATTERNS.forEach(({ regex, color }) => {
    let match;
    const re = new RegExp(regex.source, regex.flags);
    while ((match = re.exec(text)) !== null) {
      matches.push({ start: match.index, end: match.index + match[0].length, color, text: match[0] });
    }
  });

  // Sort by start position
  matches.sort((a, b) => a.start - b.start);

  // Remove overlaps
  const filtered = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.end;
    }
  }

  // Build segments
  const segments = [];
  let pos = 0;
  for (const m of filtered) {
    if (m.start > pos) {
      segments.push({ text: text.slice(pos, m.start), highlight: false });
    }
    segments.push({ text: m.text, highlight: true, color: m.color });
    pos = m.end;
  }
  if (pos < text.length) {
    segments.push({ text: text.slice(pos), highlight: false });
  }

  return (
    <Typography variant="body2" component="div" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <Box
            key={i}
            component="span"
            sx={{
              backgroundColor: seg.color + '33',
              borderBottom: `2px solid ${seg.color}`,
              px: 0.3,
              borderRadius: 0.5,
              fontWeight: 600,
            }}
          >
            {seg.text}
          </Box>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </Typography>
  );
};

export default TextHighlighter;
