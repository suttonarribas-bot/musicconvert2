import React, { useState, useEffect } from 'react';
import { UrlConvert } from './components/UrlConvert';
import { UploadConvert } from './components/UploadConvert';
import { StreamingConverter } from './components/StreamingConverter';
import { MetadataPanel } from './components/MetadataPanel';
import { ResultPanel } from './components/ResultPanel';
import { checkBrowserSupport } from './lib/utils';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('streaming');
  const [result, setResult] = useState(null);
  const [browserSupport, setBrowserSupport] = useState({ supported: true, issues: [] });

  useEffect(() => {
    const support = checkBrowserSupport();
    setBrowserSupport(support);
  }, []);

  const handleResult = (conversionResult) => {
    setResult(conversionResult);
  };

  const handleCloseResult = () => {
    setResult(null);
  };

  if (!browserSupport.supported) {
    return (
      <div className="app">
        <div className="container">
          <header className="app-header">
            <h1>🎵 Audio Converter</h1>
            <p>Convert audio files to AIFF format in your browser</p>
          </header>
          
          <div className="browser-warning">
            <h2>Browser Compatibility Issue</h2>
            <p>Your browser doesn't support all required features for audio conversion:</p>
            <ul>
              {browserSupport.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
            
            {browserSupport.issues.some(issue => issue.includes('SharedArrayBuffer')) && (
              <div className="sab-solution">
                <h3>Solution for SharedArrayBuffer Issue:</h3>
                <p>This is a security feature in modern browsers. The site needs to be served with special headers:</p>
                <ol>
                  <li>Try refreshing the page (headers may have been updated)</li>
                  <li>Use Chrome/Edge with the <code>--disable-web-security</code> flag for testing</li>
                  <li>Access the site via HTTPS (required for SharedArrayBuffer)</li>
                  <li>Try a different browser or incognito mode</li>
                </ol>
                <p><strong>Note:</strong> The site administrator needs to configure proper CORS headers for full functionality.</p>
              </div>
            )}
            
            <p>
              Please use a modern browser like Chrome, Firefox, Safari, or Edge 
              with the latest updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <h1>🎵 Audio Converter</h1>
          <p>Convert audio files to AIFF format in your browser using ffmpeg.wasm</p>
        </header>

        <div className="legal-notice">
          <strong>Legal Notice:</strong> This tool is for personal use only. 
          Only convert audio files you own or have rights to. Respect copyright laws 
          and terms of service of audio platforms.
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'streaming' ? 'active' : ''}`}
            onClick={() => setActiveTab('streaming')}
            aria-selected={activeTab === 'streaming'}
            role="tab"
          >
            Streaming Services
          </button>
          <button
            className={`tab ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
            aria-selected={activeTab === 'url'}
            role="tab"
          >
            Direct URL
          </button>
          <button
            className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
            aria-selected={activeTab === 'upload'}
            role="tab"
          >
            Upload File
          </button>
          <button
            className={`tab ${activeTab === 'metadata' ? 'active' : ''}`}
            onClick={() => setActiveTab('metadata')}
            aria-selected={activeTab === 'metadata'}
            role="tab"
          >
            Track Info
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'streaming' && (
            <div role="tabpanel" aria-labelledby="streaming-tab">
              <StreamingConverter onResult={handleResult} />
            </div>
          )}
          
          {activeTab === 'url' && (
            <div role="tabpanel" aria-labelledby="url-tab">
              <UrlConvert onResult={handleResult} />
            </div>
          )}
          
          {activeTab === 'upload' && (
            <div role="tabpanel" aria-labelledby="upload-tab">
              <UploadConvert onResult={handleResult} />
            </div>
          )}
          
          {activeTab === 'metadata' && (
            <div role="tabpanel" aria-labelledby="metadata-tab">
              <MetadataPanel />
            </div>
          )}
        </div>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Supported Formats</h4>
              <p>Input: MP3, WAV, FLAC, M4A, OGG, OPUS, AAC</p>
              <p>Output: AIFF (44.1 kHz, 16-bit, Stereo)</p>
            </div>
            
            <div className="footer-section">
              <h4>Features</h4>
              <p>• Client-side conversion</p>
              <p>• No server uploads</p>
              <p>• Privacy-focused</p>
            </div>
            
            <div className="footer-section">
              <h4>Limitations</h4>
              <p>• Max file size: 200 MB</p>
              <p>• Requires modern browser</p>
              <p>• CORS restrictions apply</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>
              Built with <a href="https://github.com/ffmpegwasm/ffmpeg.wasm" target="_blank" rel="noopener noreferrer">ffmpeg.wasm</a> • 
              <a href="https://github.com/suttonarribas-bot/musicconvert2" target="_blank" rel="noopener noreferrer"> View Source</a>
            </p>
          </div>
        </footer>
      </div>

      {result && (
        <ResultPanel result={result} onClose={handleCloseResult} />
      )}
    </div>
  );
}

export default App;
