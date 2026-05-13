import React, { createContext, useContext, useState, useCallback } from 'react';
import { analyzeMessageV2 as apiAnalyzeV2 } from '../services/api';
import { createWorker } from 'tesseract.js';

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
  const [ocrProgress, setOcrProgress] = useState(null);

  const analyzeMessage = useCallback(async (message, senderInfo, messageType) => {
    setLoading(true);
    setError(null);
    setOcrResult(null);
    setOcrProgress(null);
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
    setOcrProgress('Extracting text from image...');
    try {
      // Step 1: OCR in the browser using Tesseract.js
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(`Extracting text... ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const { data } = await worker.recognize(file);
      await worker.terminate();

      const extractedText = data.text?.trim();
      if (!extractedText || extractedText.length < 3) {
        throw new Error('Could not extract readable text from the image. Please try a clearer screenshot.');
      }

      const ocr = {
        extracted_text: extractedText,
        confidence: Math.round(data.confidence),
        word_count: extractedText.split(/\s+/).length,
      };
      setOcrResult(ocr);
      setOcrProgress('Analyzing extracted text...');

      // Step 2: Send extracted text to backend for analysis
      const analysisData = await apiAnalyzeV2(extractedText, null, 'sms');
      setResult(analysisData);

      return { ocr_result: ocr, analysis: analysisData };
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.detail || 'Failed to analyze screenshot. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      setOcrProgress(null);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
    setOcrResult(null);
    setOcrProgress(null);
  }, []);

  return (
    <AnalysisContext.Provider value={{ result, loading, error, ocrResult, ocrProgress, analyzeMessage, analyzeScreenshot, clearResult }}>
      {children}
    </AnalysisContext.Provider>
  );
};
