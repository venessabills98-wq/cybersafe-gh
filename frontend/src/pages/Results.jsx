import React from 'react';
import { Container, Box, Grid, Button, Alert, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../context/AnalysisContext';
import RiskScoreGauge from '../components/risk/RiskScoreGauge';
import RiskLevelBadge from '../components/risk/RiskLevelBadge';
import ScamCategoryCard from '../components/risk/ScamCategoryCard';
import IndicatorList from '../components/risk/IndicatorList';
import ExplanationCard from '../components/risk/ExplanationCard';
import AdviceCard from '../components/risk/AdviceCard';
import MessagePreview from '../components/risk/MessagePreview';
import ConfidenceIndicator from '../components/risk/ConfidenceIndicator';
import SenderAnalysis from '../components/risk/SenderAnalysis';
import GhanaPatterns from '../components/risk/GhanaPatterns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Results = () => {
  const { result, ocrResult } = useAnalysis();
  const navigate = useNavigate();

  if (!result) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          No analysis result available. Please analyze a message first.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Analyzer
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        Analyze Another Message
      </Button>

      {/* OCR extracted text */}
      {ocrResult && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Extracted Text from Screenshot</Typography>
            <Typography variant="body2" sx={{ mt: 1, p: 1.5, backgroundColor: 'action.hover', borderRadius: 1, fontFamily: 'monospace' }}>
              {ocrResult.extracted_text}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              OCR Confidence: {ocrResult.confidence}% | Words: {ocrResult.word_count}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Message Preview */}
      {result.message_text && (
        <MessagePreview
          message={result.message_text}
          messageType={result.message_type}
          senderInfo={result.sender_analysis?.known_entity}
          indicators={result.indicators}
        />
      )}

      {/* Risk Score + Confidence */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <RiskScoreGauge score={result.risk_score ?? 0} level={result.risk_level ?? 'Low'} />
          {result.confidence !== undefined && (
            <ConfidenceIndicator confidence={result.confidence} label={result.confidence_label} />
          )}
        </Box>
        <Box sx={{ mt: 2 }}>
          <RiskLevelBadge level={result.risk_level ?? 'Low'} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={12}>
          <ScamCategoryCard category={result.scam_category} confidence={result.confidence} />
        </Grid>

        {/* Sender Analysis */}
        {result.sender_analysis && result.sender_analysis.sender_type !== 'unknown' && (
          <Grid size={12}>
            <SenderAnalysis senderAnalysis={result.sender_analysis} />
          </Grid>
        )}

        {/* Ghana Patterns */}
        {result.ghana_patterns && result.ghana_patterns.length > 0 && (
          <Grid size={12}>
            <GhanaPatterns patterns={result.ghana_patterns} />
          </Grid>
        )}

        <Grid size={12}>
          <ExplanationCard explanation={result.explanation} />
        </Grid>
        <Grid size={12}>
          <IndicatorList indicators={result.indicators ?? []} />
        </Grid>
        <Grid size={12}>
          <AdviceCard advice={result.advice ?? []} riskLevel={result.risk_level ?? 'Low'} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Results;
