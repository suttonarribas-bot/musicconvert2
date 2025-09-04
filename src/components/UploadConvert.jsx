import React, { useState, useRef } from 'react';
import { formatFileSize, validateFileSize } from '../lib/utils';
import { convertFileToAIFF } from '../lib/ffmpegClient';
import { ProgressBar, LoadingSpinner } from './ProgressBar';
import './UploadConvert.css';

export function UploadConvert({ onResult }) {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    try {
      // Validate file size
      validateFileSize(selectedFile.size);
      
      // Check if it's an audio file
      if (!selectedFile.type.startsWith('audio/')) {
        throw new Error('Please select an audio file');
      }

      setFile(selectedFile);
    } catch (err) {
      setError(err.message);
      setFile(null);
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleConvert = async () => {
    if (!file || isConverting) {
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setError(null);

    try {
      const outputData = await convertFileToAIFF(file, (progressValue) => {
        setProgress(progressValue);
      });

      // Create blob and download URL
      const blob = new Blob([outputData], { type: 'audio/aiff' });
      const downloadUrl = URL.createObjectURL(blob);

      onResult({
        success: true,
        downloadUrl,
        filename: file.name.replace(/\.[^/.]+$/, '') + '.aiff',
        size: blob.size,
        originalFile: file
      });

    } catch (error) {
      setError(`Conversion failed: ${error.message}`);
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const canConvert = file && !isConverting;

  return (
    <div className="upload-convert">
      <div className="upload-area">
        <div
          className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={0}
          aria-label="Upload audio file"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBrowseClick();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            disabled={isConverting}
          />
          
          {!file ? (
            <div className="upload-content">
              <div className="upload-icon">🎵</div>
              <div className="upload-text">
                <strong>Click to browse</strong> or drag and drop an audio file
              </div>
              <div className="upload-subtext">
                Supports MP3, WAV, FLAC, M4A, OGG, and more
              </div>
            </div>
          ) : (
            <div className="file-selected">
              <div className="file-icon">🎵</div>
              <div className="file-details">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>
                <div className="file-type">{file.type}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {isConverting && (
        <div className="conversion-progress">
          <ProgressBar 
            progress={progress} 
            label="Converting to AIFF..." 
          />
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!canConvert}
        className="convert-button"
        aria-describedby={!canConvert ? 'upload-help' : undefined}
      >
        {isConverting ? 'Converting...' : 'Convert to AIFF'}
      </button>

      {!canConvert && !isConverting && (
        <div id="upload-help" className="help-text">
          Select an audio file to begin conversion
        </div>
      )}
    </div>
  );
}
