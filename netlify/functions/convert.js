const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { url, format = 'wav', quality = 'best' } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    // Validate URL
    if (!ytdl.validateURL(url)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid YouTube URL' }),
      };
    }

    // Get video info
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50);

    // Create temporary file paths
    const tempDir = '/tmp';
    const audioFile = path.join(tempDir, `${sanitizedTitle}.${format}`);

    // Download and convert audio
    return new Promise((resolve, reject) => {
      const stream = ytdl(url, { quality: 'highestaudio' });
      
      ffmpeg(stream)
        .audioCodec(format === 'wav' ? 'pcm_s16le' : 'aac')
        .audioBitrate(quality === 'best' ? '320k' : quality === 'high' ? '192k' : '128k')
        .format(format)
        .on('end', () => {
          // Read the converted file
          const audioBuffer = fs.readFileSync(audioFile);
          
          // Clean up temp file
          fs.unlinkSync(audioFile);

          resolve({
            statusCode: 200,
            headers: {
              ...headers,
              'Content-Type': `audio/${format}`,
              'Content-Disposition': `attachment; filename="${sanitizedTitle}.${format}"`,
              'Content-Length': audioBuffer.length,
            },
            body: audioBuffer.toString('base64'),
            isBase64Encoded: true,
          });
        })
        .on('error', (err) => {
          reject({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: `Conversion failed: ${err.message}` }),
          });
        })
        .save(audioFile);
    });

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
