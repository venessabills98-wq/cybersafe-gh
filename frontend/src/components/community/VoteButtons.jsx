import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';

const VoteButtons = ({ upvotes, downvotes, userVote, onVote }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton size="small" onClick={() => onVote('up')} color={userVote === 'up' ? 'primary' : 'default'}>
        {userVote === 'up' ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
      </IconButton>
      <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
        {upvotes || 0}
      </Typography>

      <IconButton size="small" onClick={() => onVote('down')} color={userVote === 'down' ? 'error' : 'default'}>
        {userVote === 'down' ? <ThumbDownIcon fontSize="small" /> : <ThumbDownOutlinedIcon fontSize="small" />}
      </IconButton>
      <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
        {downvotes || 0}
      </Typography>
    </Box>
  );
};

export default VoteButtons;
