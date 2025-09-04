/**
 * Netlify function for streaming service conversion
 * Note: This is a placeholder that explains limitations
 */

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
    const { url, service } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL is required' }),
      };
    }

    // Blocked services
    const blockedServices = ['spotify', 'apple-music', 'soundcloud', 'youtube'];
    
    if (blockedServices.includes(service)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          error: 'Direct conversion from this streaming service is not supported',
          reason: 'Copyright protection and platform restrictions',
          alternatives: [
            'Use the desktop version of this app',
            'Use official platform download features',
            'Use third-party tools like yt-dlp',
            'Convert from direct audio file URLs instead'
          ]
        }),
      };
    }

    // For non-blocked services, provide guidance
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Streaming service conversion not available',
        reason: 'Legal and technical restrictions prevent direct conversion',
        suggestions: [
          'Try the desktop version for more features',
          'Use direct audio file URLs',
          'Upload files you own',
          'Use official platform download features'
        ]
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
