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
      const service = getServiceFromUrl(url);
      
      // Handle different services
      if (service === 'youtube') {
        await handleYouTubeConversion(url);
      } else if (service === 'spotify') {
        await handleSpotifyConversion(url);
      } else if (service === 'soundcloud') {
        await handleSoundCloudConversion(url);
      } else if (service === 'apple-music') {
        await handleAppleMusicConversion(url);
      } else {
        setError('Unsupported service. Please use YouTube, Spotify, SoundCloud, or Apple Music URLs.');
      }
      
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleYouTubeConversion = async (url) => {
    try {
      // Extract video ID
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }

      if (!videoId) {
        throw new Error('Could not extract video ID from YouTube URL');
      }

      // Use a public YouTube to MP3 service
      const conversionUrl = `https://www.yt-download.org/en/download/mp3/${videoId}`;
      
      // Open in new tab for download
      window.open(conversionUrl, '_blank');
      
      setError('YouTube conversion opened in new tab. Please follow the download process there.');
      
    } catch (error) {
      throw new Error(`YouTube conversion failed: ${error.message}`);
    }
  };

  const handleSpotifyConversion = async (url) => {
    try {
      // For Spotify, we'll search YouTube for the same track
      const trackId = url.split('track/')[1]?.split('?')[0];
      
      if (!trackId) {
        throw new Error('Could not extract track ID from Spotify URL');
      }

      // Get track info first
      await fetchMetadata();
      
      if (metadata) {
        // Search YouTube for the track
        const searchQuery = encodeURIComponent(`${metadata.title} ${metadata.author}`);
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
        
        window.open(youtubeSearchUrl, '_blank');
        setError('Spotify track found! A YouTube search has been opened. Find the track and use the YouTube conversion method.');
      } else {
        setError('Could not get track information. Please try getting track info first.');
      }
      
    } catch (error) {
      throw new Error(`Spotify conversion failed: ${error.message}`);
    }
  };

  const handleSoundCloudConversion = async (url) => {
    try {
      // For SoundCloud, try to get the track info and provide download options
      await fetchMetadata();
      
      if (metadata) {
        // Use a SoundCloud downloader service
        const downloadUrl = `https://www.soundcloud-downloader.com/?url=${encodeURIComponent(url)}`;
        window.open(downloadUrl, '_blank');
        setError('SoundCloud conversion opened in new tab. Please follow the download process there.');
      } else {
        setError('Could not get track information. Please try getting track info first.');
      }
      
    } catch (error) {
      throw new Error(`SoundCloud conversion failed: ${error.message}`);
    }
  };

  const handleAppleMusicConversion = async (url) => {
    try {
      // For Apple Music, search for the track on other platforms
      await fetchMetadata();
      
      if (metadata) {
        // Search YouTube for the track
        const searchQuery = encodeURIComponent(`${metadata.title} ${metadata.author}`);
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
        
        window.open(youtubeSearchUrl, '_blank');
        setError('Apple Music track found! A YouTube search has been opened. Find the track and use the YouTube conversion method.');
      } else {
        setError('Could not get track information. Please try getting track info first.');
      }
      
    } catch (error) {
      throw new Error(`Apple Music conversion failed: ${error.message}`);
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
          Convert to Audio
        </button>
      </div>

      <div className="conversion-info">
        <h4>How it works:</h4>
        <ul>
          <li><strong>YouTube:</strong> Opens a download page in a new tab</li>
          <li><strong>Spotify:</strong> Searches YouTube for the same track</li>
          <li><strong>SoundCloud:</strong> Opens a SoundCloud downloader</li>
          <li><strong>Apple Music:</strong> Searches YouTube for the same track</li>
        </ul>
        <p><em>Note: This opens external services in new tabs. Follow their download process to get your audio file.</em></p>
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
