import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

const ResultsSkeleton = () => (
  <Box>
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Skeleton variant="circular" width={160} height={160} sx={{ mx: 'auto', mb: 2 }} />
      <Skeleton variant="rounded" width={100} height={32} sx={{ mx: 'auto' }} />
    </Box>
    {[1, 2, 3].map((i) => (
      <Card key={i} sx={{ mb: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="30%" height={24} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </CardContent>
      </Card>
    ))}
  </Box>
);

const DashboardSkeleton = () => (
  <Box>
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2, 3].map((i) => (
        <Grid size={{ xs: 12, sm: 4 }} key={i}>
          <Card><CardContent><Skeleton variant="text" height={60} /><Skeleton variant="text" width="60%" /></CardContent></Card>
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3}>
      {[1, 2].map((i) => (
        <Grid size={{ xs: 12, md: 6 }} key={i}>
          <Card><CardContent><Skeleton variant="rectangular" height={250} /></CardContent></Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const CommunitySkeleton = () => (
  <Box>
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Skeleton variant="rounded" width={80} height={24} />
            <Skeleton variant="rounded" width={60} height={24} />
          </Box>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="40%" />
        </CardContent>
      </Card>
    ))}
  </Box>
);

const ReportCardSkeleton = () => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Skeleton variant="text" width="50%" height={24} />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="30%" />
    </CardContent>
  </Card>
);

const LoadingSkeleton = ({ variant = 'results' }) => {
  switch (variant) {
    case 'dashboard': return <DashboardSkeleton />;
    case 'community': return <CommunitySkeleton />;
    case 'report-card': return <ReportCardSkeleton />;
    default: return <ResultsSkeleton />;
  }
};

export default LoadingSkeleton;
