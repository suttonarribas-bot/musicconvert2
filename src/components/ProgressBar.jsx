import React from 'react';
import './ProgressBar.css';

export function ProgressBar({ progress, label, showPercentage = true }) {
  return (
    <div className="progress-container" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="progress-percentage">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}

export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-spinner">
      <div className="spinner" aria-hidden="true" />
      <div className="loading-message">{message}</div>
    </div>
  );
}
