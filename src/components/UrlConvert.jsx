import React, { useState, useCallback } from 'react';
import { 
  isValidAudioUrl, 
  isBlockedDomain, 
  isSupportedAudioType, 
  formatFileSize, 
  validateFileSize,
  debounce 
} from '../lib/utils';
import { convertUrlToAIFF } from '../lib/ffmpegClient';
import { ProgressBar, LoadingSpinner } from './ProgressBar';
import './UrlConvert.css';

export function UrlConvert({ onResult }) {
  const [url, setUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Debounced URL validation
  const validateUrl = useCallback(
    debounce(async (inputUrl) => {
      if (!inputUrl.trim()) {
        setFileInfo(null);
        setValidationError(null);
        return;
      }

      setIsValidating(true);
      setValidationError(null);

      try {
        // Check if URL is blocked
        if (isBlockedDomain(inputUrl)) {
          setValidationError('Downloading audio from this service isn\'t allowed. Use a direct downloadable audio file URL or upload a file you own.');
          setFileInfo(null);
          return;
        }

        // Check if URL is valid
        if (!isValidAudioUrl(inputUrl)) {
          setValidationError('Please enter a valid URL');
          setFileInfo(null);
          return;
        }

        // Try to get file info with HEAD request
        try {
          const response = await fetch(inputUrl, { 
            method: 'HEAD',
            mode: 'cors'
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const contentType = response.headers.get('content-type');
          const contentLength = response.headers.get('content-length');

          // Check content type
          if (!isSupportedAudioType(contentType)) {
            setValidationError(`Unsupported file type: ${contentType || 'unknown'}. Please use a direct audio file URL.`);
            setFileInfo(null);
            return;
          }

          // Check file size
          if (contentLength) {
            const size = parseInt(contentLength);
            try {
              validateFileSize(size);
            } catch (sizeError) {
              setValidationError(sizeError.message);
              setFileInfo(null);
              return;
            }
          }

          setFileInfo({
            contentType,
            size: contentLength ? parseInt(contentLength) : null,
            url: inputUrl
          });

        } catch (fetchError) {
          if (fetchError.name === 'TypeError' && fetchError.message.includes('CORS')) {
            setValidationError('CORS blocked: This URL doesn\'t allow cross-origin requests. Try uploading the file instead.');
          } else {
            setValidationError(`Could not access file: ${fetchError.message}`);
          }
          setFileInfo(null);
        }

      } catch (error) {
        setValidationError(`Validation error: ${error.message}`);
        setFileInfo(null);
      } finally {
        setIsValidating(false);
      }
    }, 500),
    []
  );

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setError(null);
    validateUrl(newUrl);
  };

  const handleConvert = async () => {
    if (!url.trim() || !fileInfo || validationError) {
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setError(null);

    try {
      const outputData = await convertUrlToAIFF(url, (progressValue) => {
        setProgress(progressValue);
      });

      // Create blob and download URL
      const blob = new Blob([outputData], { type: 'audio/aiff' });
      const downloadUrl = URL.createObjectURL(blob);

      onResult({
        success: true,
        downloadUrl,
        filename: 'converted.aiff',
        size: blob.size,
        originalUrl: url
      });

    } catch (error) {
      setError(`Conversion failed: ${error.message}`);
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  const canConvert = url.trim() && fileInfo && !validationError && !isConverting;

  return (
    <div className="url-convert">
      <div className="input-group">
        <label htmlFor="audio-url" className="input-label">
          Audio File URL
        </label>
        <input
          id="audio-url"
          type="url"
          value={url}
          onChange={handleUrlChange}
          placeholder="https://example.com/audio.mp3"
          className={`url-input ${validationError ? 'error' : ''}`}
          disabled={isConverting}
          aria-describedby={validationError ? 'url-error' : fileInfo ? 'file-info' : undefined}
        />
        
        {isValidating && (
          <div className="validation-status">
            <LoadingSpinner message="Validating URL..." />
          </div>
        )}

        {validationError && (
          <div id="url-error" className="error-message" role="alert">
            {validationError}
          </div>
        )}

        {fileInfo && !validationError && (
          <div id="file-info" className="file-info">
            <div className="file-details">
              <div className="file-type">
                Type: {fileInfo.contentType || 'Unknown'}
              </div>
              {fileInfo.size && (
                <div className="file-size">
                  Size: {formatFileSize(fileInfo.size)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isConverting && (
        <div className="conversion-progress">
          <ProgressBar 
            progress={progress} 
            label="Converting to AIFF..." 
          />
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!canConvert}
        className="convert-button"
        aria-describedby={!canConvert ? 'convert-help' : undefined}
      >
        {isConverting ? 'Converting...' : 'Convert to AIFF'}
      </button>

      {!canConvert && !isConverting && (
        <div id="convert-help" className="help-text">
          Enter a valid audio file URL to begin conversion
        </div>
      )}
    </div>
  );
}
