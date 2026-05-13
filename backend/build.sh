#!/bin/bash
# Install Tesseract OCR for serverless environment
yum install -y tesseract 2>/dev/null || apt-get install -y tesseract-ocr 2>/dev/null || true
pip install -r requirements.txt
