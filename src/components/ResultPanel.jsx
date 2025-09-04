import React, { useEffect, useState } from 'react';
import { formatFileSize, cleanupObjectUrl } from '../lib/utils';
import './ResultPanel.css';

export function ResultPanel({ result, onClose }) {
  const [downloadUrl, setDownloadUrl] = useState(result?.downloadUrl);

  useEffect(() => {
    setDownloadUrl(result?.downloadUrl);
    
    // Cleanup function
    return () => {
      if (downloadUrl) {
        cleanupObjectUrl(downloadUrl);
      }
    };
  }, [result?.downloadUrl]);

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = result.filename || 'converted.aiff';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleClose = () => {
    if (downloadUrl) {
      cleanupObjectUrl(downloadUrl);
    }
    onClose();
  };

  if (!result) return null;

  return (
    <div className="result-panel" role="dialog" aria-labelledby="result-title">
      <div className="result-header">
        <h3 id="result-title">Conversion Complete!</h3>
        <button 
          onClick={handleClose}
          className="close-button"
          aria-label="Close result panel"
        >
          ×
        </button>
      </div>

      <div className="result-content">
        <div className="success-icon">✅</div>
        
        <div className="result-details">
          <div className="result-item">
            <span className="result-label">Output Format:</span>
            <span className="result-value">AIFF (44.1 kHz, 16-bit, Stereo)</span>
          </div>
          
          <div className="result-item">
            <span className="result-label">File Size:</span>
            <span className="result-value">{formatFileSize(result.size)}</span>
          </div>
          
          <div className="result-item">
            <span className="result-label">Filename:</span>
            <span className="result-value">{result.filename}</span>
          </div>
          
          {result.originalUrl && (
            <div className="result-item">
              <span className="result-label">Source:</span>
              <span className="result-value">
                <a 
                  href={result.originalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="source-link"
                >
                  {result.originalUrl}
                </a>
              </span>
            </div>
          )}
          
          {result.originalFile && (
            <div className="result-item">
              <span className="result-label">Source:</span>
              <span className="result-value">{result.originalFile.name}</span>
            </div>
          )}
        </div>

        <div className="result-actions">
          <button 
            onClick={handleDownload}
            className="download-button"
          >
            Download AIFF File
          </button>
          
          <button 
            onClick={handleClose}
            className="secondary-button"
          >
            Convert Another File
          </button>
        </div>

        <div className="result-note">
          <strong>Note:</strong> The converted file is ready for download. 
          AIFF files are compatible with most audio software and devices.
        </div>
      </div>
    </div>
  );
}
