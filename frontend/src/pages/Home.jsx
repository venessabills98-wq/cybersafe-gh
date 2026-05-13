import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PeopleIcon from '@mui/icons-material/People';
import PlaceIcon from '@mui/icons-material/Place';
import { useNavigate } from 'react-router-dom';
import AnalyzerForm from '../components/analyzer/AnalyzerForm';

const features = [
  {
    icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Scam Detection',
    description: 'Advanced rule-based engine detects phishing, fraud, and impersonation attempts with confidence scoring.',
  },
  {
    icon: <ShieldIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    title: 'Risk Scoring',
    description: 'Get a risk score from 0-100 with detailed breakdown of threat indicators and analysis confidence.',
  },
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    title: 'Safety Advice',
    description: 'Receive actionable safety recommendations tailored to the type of scam detected.',
  },
  {
    icon: <PhotoCameraIcon sx={{ fontSize: 40, color: 'info.main' }} />,
    title: 'Screenshot Analysis',
    description: 'Upload screenshots of suspicious messages for automatic text extraction and analysis via OCR.',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
    title: 'Community Reports',
    description: 'Browse and contribute to community scam reports to protect others in Ghana.',
  },
  {
    icon: <PlaceIcon sx={{ fontSize: 40, color: 'error.main' }} />,
    title: 'Ghana-Specific',
    description: 'Detects MoMo reversal scams, MTN promo fraud, E-Levy refund scams, and other Ghana-specific patterns.',
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', mb: 6, mt: 2 }}>
        <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
          CyberSafe GH
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
          Protect yourself from scams in Ghana. Analyze suspicious messages instantly with our AI-powered detection engine.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" onClick={() => navigate('/community')}>
            Community Reports
          </Button>
          <Button variant="outlined" size="small" onClick={() => navigate('/dashboard')}>
            View Dashboard
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 6 }}>
        <AnalyzerForm />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card elevation={1} sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                {feature.icon}
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
