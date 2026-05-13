import React, { createContext, useContext, useState, useCallback } from 'react';
import { analyzeMessageV2 as apiAnalyzeV2, analyzeScreenshot as apiAnalyzeScreenshot } from '../services/api';

const AnalysisContext = createContext(null);

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

export const AnalysisProvider = ({ children }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);

  const analyzeMessage = useCallback(async (message, senderInfo, messageType) => {
    setLoading(true);
    setError(null);
    setOcrResult(null);
    try {
      const data = await apiAnalyzeV2(message, senderInfo, messageType);
      setResult(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to analyze message. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeScreenshot = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    setOcrResult(null);
    try {
      const data = await apiAnalyzeScreenshot(file);
      setResult(data.analysis);
      setOcrResult(data.ocr_result);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to analyze screenshot. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    setOcrResult(null);
  }, []);

  return (
    <AnalysisContext.Provider value={{ result, loading, error, ocrResult, analyzeMessage, analyzeScreenshot, clearResult }}>
      {children}
    </AnalysisContext.Provider>
  );
};
