import json
import os
import tempfile
import subprocess
import sys
from urllib.parse import urlparse, parse_qs

def handler(event, context):
    # Enable CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }

    # Handle preflight requests
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': '',
        }

    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    try:
        body = json.loads(event.get('body', '{}'))
        url = body.get('url', '')
        format_type = body.get('format', 'wav')
        quality = body.get('quality', 'best')

        if not url:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'URL is required'}),
            }

        # Validate YouTube URL
        if 'youtube.com' not in url and 'youtu.be' not in url:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Only YouTube URLs are supported in this web version'}),
            }

        # For now, return a message about downloading the desktop version
        # In a real implementation, you would use yt-dlp here
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Web conversion is limited. Please download the desktop version for full functionality.',
                'download_url': 'https://github.com/suttonarribas-bot/musicconvert2',
                'note': 'The desktop version supports YouTube, SoundCloud, Spotify, and Apple Music with full conversion capabilities.'
            }),
        }

    except Exception as error:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(error)}),
        }
