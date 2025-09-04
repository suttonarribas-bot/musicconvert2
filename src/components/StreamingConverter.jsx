import React, { useState } from 'react';
import { isBlockedDomain, getOEmbedUrl, getiTunesSearchUrl } from '../lib/utils';
import { ProgressBar, LoadingSpinner } from './ProgressBar';
import './StreamingConverter.css';

export function StreamingConverter({ onResult }) {
  const [url, setUrl] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setError(null);
    setMetadata(null);
    setShowAlternatives(false);
  };

  const handleConvert = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if it's a blocked domain
      if (isBlockedDomain(url)) {
        // Try to call the Netlify function for more detailed response
        try {
          const response = await fetch('/.netlify/functions/streaming-convert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              url, 
              service: getServiceFromUrl(url) 
            })
          });

          if (response.ok) {
            const data = await response.json();
            setError(data.message || 'Conversion not available for this service');
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Conversion not available');
          }
        } catch (fetchError) {
          setError('Direct conversion from streaming services is not allowed due to copyright and technical restrictions.');
        }
        
        setShowAlternatives(true);
        return;
      }

      // If it's not a blocked domain, redirect to URL converter
      setError('This appears to be a direct audio file URL. Please use the "Direct URL" tab for direct audio files.');
      
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getServiceFromUrl = (url) => {
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    if (url.includes('music.apple.com')) return 'apple-music';
    return 'unknown';
  };

  const fetchMetadata = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Try oEmbed first
      const oEmbedUrl = getOEmbedUrl(url);
      if (oEmbedUrl) {
        const response = await fetch(oEmbedUrl);
        if (response.ok) {
          const data = await response.json();
          setMetadata({
            type: 'oembed',
            title: data.title,
            author: data.author_name,
            thumbnail: data.thumbnail_url,
            provider: data.provider_name,
            url: data.url || url
          });
          setLoading(false);
          return;
        }
      }

      // Try iTunes Search for Apple Music
      const iTunesUrl = getiTunesSearchUrl(url);
      if (iTunesUrl) {
        const response = await fetch(iTunesUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            setMetadata({
              type: 'itunes',
              title: result.trackName || result.collectionName,
              author: result.artistName,
              thumbnail: result.artworkUrl100,
              provider: 'Apple Music',
              url: result.trackViewUrl || result.collectionViewUrl
            });
            setLoading(false);
            return;
          }
        }
      }

      setError('Could not fetch metadata for this URL');
    } catch (error) {
      setError(`Failed to fetch metadata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const canConvert = url.trim() && !loading;

  return (
    <div className="streaming-converter">
      <div className="converter-header">
        <h3>Streaming Service Converter</h3>
        <p>Convert music from YouTube, Spotify, SoundCloud, and Apple Music</p>
      </div>

      <div className="input-group">
        <label htmlFor="streaming-url" className="input-label">
          Streaming Service URL
        </label>
        <input
          id="streaming-url"
          type="url"
          value={url}
          onChange={handleUrlChange}
          placeholder="https://www.youtube.com/watch?v=... or https://open.spotify.com/track/..."
          className="streaming-input"
          disabled={loading}
        />
      </div>

      {loading && (
        <div className="loading-section">
          <LoadingSpinner message="Processing..." />
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {metadata && (
        <div className="metadata-display">
          <div className="track-card">
            {metadata.thumbnail && (
              <img 
                src={metadata.thumbnail} 
                alt="Track artwork"
                className="track-thumbnail"
                loading="lazy"
              />
            )}
            <div className="track-info">
              <h4 className="track-title">{metadata.title}</h4>
              <p className="track-artist">{metadata.author}</p>
              <p className="track-provider">{metadata.provider}</p>
            </div>
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button
          onClick={fetchMetadata}
          disabled={!url.trim() || loading}
          className="secondary-button"
        >
          Get Track Info
        </button>
        
        <button
          onClick={handleConvert}
          disabled={!canConvert}
          className="convert-button"
        >
          Convert to AIFF
        </button>
      </div>

      {showAlternatives && (
        <div className="alternatives-section">
          <h4>Alternative Solutions:</h4>
          <div className="alternatives-grid">
            <div className="alternative-card">
              <h5>🎵 Desktop App</h5>
              <p>Download our desktop version for full streaming service support</p>
              <a href="https://github.com/suttonarribas-bot/musicconvert2" target="_blank" rel="noopener noreferrer" className="alt-link">
                Download Desktop App
              </a>
            </div>
            
            <div className="alternative-card">
              <h5>📱 Mobile Apps</h5>
              <p>Use official mobile apps with download features</p>
              <ul>
                <li>Spotify Premium (offline downloads)</li>
                <li>YouTube Music Premium</li>
                <li>SoundCloud Go+</li>
              </ul>
            </div>
            
            <div className="alternative-card">
              <h5>🛠️ Third-Party Tools</h5>
              <p>Use specialized tools for streaming downloads</p>
              <ul>
                <li>yt-dlp (command line)</li>
                <li>4K Video Downloader</li>
                <li>JDownloader</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="legal-notice">
        <strong>Important:</strong> This web version cannot download from streaming services due to:
        <ul>
          <li>Copyright protection and DRM</li>
          <li>Technical CORS restrictions</li>
          <li>Platform terms of service</li>
          <li>Legal compliance requirements</li>
        </ul>
        <p>For streaming service downloads, please use the desktop version or official platform features.</p>
      </div>
    </div>
  );
}
