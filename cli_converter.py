#!/usr/bin/env python3
"""
Command Line Music Converter
Usage: python cli_converter.py <URL> [options]
"""

import argparse
import os
import sys
import re
from pathlib import Path
import yt_dlp
from pydub import AudioSegment
from pydub.utils import which

class CLIMusicConverter:
    def __init__(self):
        self.supported_platforms = ['youtube', 'soundcloud', 'spotify', 'apple_music']
        
    def detect_platform(self, url):
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
            
    def sanitize_filename(self, filename):
        """Remove invalid characters from filename"""
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        return filename[:100]  # Limit length
        
    def download_audio(self, url, output_dir, format_type, quality, custom_name=None):
        """Download audio using yt-dlp"""
        try:
            print(f"Detecting platform...")
            platform = self.detect_platform(url)
            print(f"Platform: {platform}")
            
            # Configure yt-dlp options
            quality_map = {
                'best': '320',
                'high': '192', 
                'medium': '128'
            }
            
            bitrate = quality_map.get(quality.lower(), '192')
            
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
                'extractaudio': True,
                'audioformat': format_type.lower(),
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': format_type.lower(),
                    'preferredquality': bitrate,
                }],
                'quiet': False,
                'no_warnings': False,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Get video info first
                print("Extracting video information...")
                info = ydl.extract_info(url, download=False)
                title = info.get('title', 'Unknown')
                duration = info.get('duration', 0)
                
                print(f"Title: {title}")
                print(f"Duration: {duration // 60}:{duration % 60:02d}")
                
                # Use custom name if provided
                if custom_name:
                    safe_name = self.sanitize_filename(custom_name)
                    ydl_opts['outtmpl'] = os.path.join(output_dir, f"{safe_name}.%(ext)s")
                    ydl = yt_dlp.YoutubeDL(ydl_opts)
                
                # Download
                print("Starting download...")
                ydl.download([url])
                
                # Find the downloaded file
                downloaded_files = [f for f in os.listdir(output_dir) 
                                  if f.endswith(f'.{format_type.lower()}')]
                
                if downloaded_files:
                    final_path = os.path.join(output_dir, downloaded_files[0])
                    print(f"Successfully downloaded: {final_path}")
                    return final_path
                else:
                    print("Download completed but file not found")
                    return None
                    
        except Exception as e:
            print(f"Download error: {str(e)}")
            return None
            
    def convert_batch(self, urls, output_dir, format_type, quality):
        """Convert multiple URLs"""
        results = []
        for i, url in enumerate(urls, 1):
            print(f"\n--- Processing {i}/{len(urls)} ---")
            result = self.download_audio(url, output_dir, format_type, quality)
            results.append(result)
        return results

def main():
    parser = argparse.ArgumentParser(description='Download and convert music from various platforms')
    parser.add_argument('urls', nargs='+', help='URL(s) to download')
    parser.add_argument('-f', '--format', choices=['wav', 'aiff'], default='wav',
                       help='Output format (default: wav)')
    parser.add_argument('-q', '--quality', choices=['best', 'high', 'medium'], default='best',
                       help='Audio quality (default: best)')
    parser.add_argument('-o', '--output', default='./downloads',
                       help='Output directory (default: ./downloads)')
    parser.add_argument('-n', '--name', help='Custom filename (without extension)')
    parser.add_argument('--batch', action='store_true',
                       help='Process multiple URLs from a text file')
    
    args = parser.parse_args()
    
    # Check if FFmpeg is available
    if not which("ffmpeg"):
        print("Warning: FFmpeg not found. Please install FFmpeg for audio conversion.")
        print("Download from: https://ffmpeg.org/download.html")
        return
    
    # Create output directory
    os.makedirs(args.output, exist_ok=True)
    
    converter = CLIMusicConverter()
    
    # Handle batch processing
    if args.batch and len(args.urls) == 1:
        batch_file = args.urls[0]
        if os.path.exists(batch_file):
            with open(batch_file, 'r') as f:
                urls = [line.strip() for line in f if line.strip()]
            print(f"Processing {len(urls)} URLs from {batch_file}")
            results = converter.convert_batch(urls, args.output, args.format, args.quality)
        else:
            print(f"Batch file not found: {batch_file}")
            return
    else:
        # Single URL processing
        for url in args.urls:
            print(f"Processing: {url}")
            result = converter.download_audio(url, args.output, args.format, args.quality, args.name)
            if result:
                print(f"✓ Success: {result}")
            else:
                print(f"✗ Failed: {url}")

if __name__ == "__main__":
    main()
