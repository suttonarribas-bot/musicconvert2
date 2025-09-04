import React, { useState, useCallback } from 'react';
import { getOEmbedUrl, getiTunesSearchUrl, debounce } from '../lib/utils';
import './MetadataPanel.css';

export function MetadataPanel() {
  const [url, setUrl] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetadata = useCallback(
    debounce(async (inputUrl) => {
      if (!inputUrl.trim()) {
        setMetadata(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Try oEmbed first
        const oEmbedUrl = getOEmbedUrl(inputUrl);
        if (oEmbedUrl) {
          try {
            const response = await fetch(oEmbedUrl);
            if (response.ok) {
              const data = await response.json();
              setMetadata({
                type: 'oembed',
                title: data.title,
                author: data.author_name,
                thumbnail: data.thumbnail_url,
                provider: data.provider_name,
                url: data.url || inputUrl
              });
              setLoading(false);
              return;
            }
          } catch (oEmbedError) {
            console.warn('oEmbed failed:', oEmbedError);
          }
        }

        // Try iTunes Search for Apple Music
        const iTunesUrl = getiTunesSearchUrl(inputUrl);
        if (iTunesUrl) {
          try {
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
          } catch (iTunesError) {
            console.warn('iTunes search failed:', iTunesError);
          }
        }

        // No metadata found
        setMetadata(null);
        setError('No metadata found for this URL');

      } catch (error) {
        setError(`Failed to fetch metadata: ${error.message}`);
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    fetchMetadata(newUrl);
  };

  return (
    <div className="metadata-panel">
      <h3>Track Information</h3>
      <p className="metadata-description">
        Paste a Spotify, YouTube, SoundCloud, or Apple Music link to see track information
      </p>
      
      <div className="input-group">
        <input
          type="url"
          value={url}
          onChange={handleUrlChange}
          placeholder="https://open.spotify.com/track/..."
          className="metadata-input"
        />
      </div>

      {loading && (
        <div className="metadata-loading">
          <div className="loading-spinner" />
          <span>Loading metadata...</span>
        </div>
      )}

      {error && (
        <div className="metadata-error" role="alert">
          {error}
        </div>
      )}

      {metadata && (
        <div className="metadata-result">
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
              {metadata.url && (
                <a 
                  href={metadata.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="track-link"
                >
                  View on {metadata.provider}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="metadata-note">
        <strong>Note:</strong> This is for display only. To convert audio, use a direct audio file URL or upload a file you own.
      </div>
    </div>
  );
}
