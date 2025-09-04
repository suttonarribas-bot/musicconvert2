#!/usr/bin/env python3
"""
Web-based Music Converter
A Flask web application for music conversion
Note: This is a simplified version for web deployment
"""

from flask import Flask, render_template, request, jsonify, send_file
import os
import tempfile
import threading
import time
from pathlib import Path
import yt_dlp
from pydub import AudioSegment
import json

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'downloads'
ALLOWED_EXTENSIONS = {'wav', 'aiff'}

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Store conversion status
conversion_status = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_platform(url):
    """Detect the platform from the URL"""
    if 'youtube.com' in url or 'youtu.be' in url:
        return 'youtube'
    elif 'soundcloud.com' in url:
        return 'soundcloud'
    elif 'spotify.com' in url:
        return 'spotify'
    elif 'music.apple.com' in url or 'itunes.apple.com' in url:
        return 'apple_music'
    else:
        return 'unknown'

def download_audio_web(url, output_dir, format_type, quality, job_id):
    """Download audio using yt-dlp for web version"""
    try:
        conversion_status[job_id] = {'status': 'processing', 'progress': 0, 'message': 'Starting download...'}
        
        # Configure yt-dlp options
        quality_map = {
            'best': '320',
            'high': '192', 
            'medium': '128'
        }
        
        bitrate = quality_map.get(quality.lower(), '192')
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(output_dir, f'{job_id}_%(title)s.%(ext)s'),
            'extractaudio': True,
            'audioformat': format_type.lower(),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': format_type.lower(),
                'preferredquality': bitrate,
            }],
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Get video info first
            conversion_status[job_id]['message'] = 'Extracting video information...'
            conversion_status[job_id]['progress'] = 20
            
            info = ydl.extract_info(url, download=False)
            title = info.get('title', 'Unknown')
            duration = info.get('duration', 0)
            
            conversion_status[job_id]['title'] = title
            conversion_status[job_id]['duration'] = duration
            conversion_status[job_id]['message'] = f'Downloading: {title}'
            conversion_status[job_id]['progress'] = 40
            
            # Download
            ydl.download([url])
            conversion_status[job_id]['progress'] = 80
            
            # Find the downloaded file
            downloaded_files = [f for f in os.listdir(output_dir) 
                              if f.startswith(f'{job_id}_') and f.endswith(f'.{format_type.lower()}')]
            
            if downloaded_files:
                final_path = os.path.join(output_dir, downloaded_files[0])
                conversion_status[job_id]['status'] = 'completed'
                conversion_status[job_id]['progress'] = 100
                conversion_status[job_id]['message'] = 'Download completed successfully!'
                conversion_status[job_id]['file_path'] = final_path
                conversion_status[job_id]['filename'] = downloaded_files[0]
            else:
                conversion_status[job_id]['status'] = 'failed'
                conversion_status[job_id]['message'] = 'Download completed but file not found'
                
    except Exception as e:
        conversion_status[job_id]['status'] = 'failed'
        conversion_status[job_id]['message'] = f'Error: {str(e)}'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    data = request.get_json()
    url = data.get('url', '').strip()
    format_type = data.get('format', 'wav')
    quality = data.get('quality', 'best')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    # Generate unique job ID
    job_id = f"job_{int(time.time())}"
    
    # Start conversion in background thread
    thread = threading.Thread(
        target=download_audio_web,
        args=(url, UPLOAD_FOLDER, format_type, quality, job_id)
    )
    thread.daemon = True
    thread.start()
    
    return jsonify({'job_id': job_id, 'message': 'Conversion started'})

@app.route('/status/<job_id>')
def get_status(job_id):
    if job_id not in conversion_status:
        return jsonify({'error': 'Job not found'}), 404
    
    return jsonify(conversion_status[job_id])

@app.route('/download/<job_id>')
def download_file(job_id):
    if job_id not in conversion_status:
        return jsonify({'error': 'Job not found'}), 404
    
    job = conversion_status[job_id]
    if job['status'] != 'completed' or 'file_path' not in job:
        return jsonify({'error': 'File not ready'}), 400
    
    try:
        return send_file(
            job['file_path'],
            as_attachment=True,
            download_name=job['filename']
        )
    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'message': 'Music Converter Web API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
