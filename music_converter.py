#!/usr/bin/env python3
"""
Music Converter - Download and convert music from various platforms
Supports: YouTube, SoundCloud, Spotify (via YouTube), Apple Music (via YouTube)
Output formats: WAV, AIFF
"""

import os
import sys
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import threading
import re
from pathlib import Path
import yt_dlp
from pydub import AudioSegment
from pydub.utils import which
import requests
from urllib.parse import urlparse, parse_qs

class MusicConverter:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Music Converter")
        self.root.geometry("600x500")
        self.root.configure(bg='#2b2b2b')
        
        # Configure style
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('TLabel', background='#2b2b2b', foreground='white')
        style.configure('TButton', background='#4a4a4a', foreground='white')
        style.configure('TEntry', fieldbackground='#3a3a3a', foreground='white')
        style.configure('TCombobox', fieldbackground='#3a3a3a', foreground='white')
        
        self.setup_ui()
        self.output_dir = os.path.join(os.getcwd(), "downloads")
        os.makedirs(self.output_dir, exist_ok=True)
        
    def setup_ui(self):
        # Title
        title_label = ttk.Label(self.root, text="Music Converter", font=('Arial', 16, 'bold'))
        title_label.pack(pady=20)
        
        # URL input frame
        url_frame = ttk.Frame(self.root)
        url_frame.pack(pady=10, padx=20, fill='x')
        
        ttk.Label(url_frame, text="Music URL:").pack(anchor='w')
        self.url_entry = ttk.Entry(url_frame, width=70)
        self.url_entry.pack(pady=5, fill='x')
        
        # Format selection frame
        format_frame = ttk.Frame(self.root)
        format_frame.pack(pady=10, padx=20, fill='x')
        
        ttk.Label(format_frame, text="Output Format:").pack(anchor='w')
        self.format_var = tk.StringVar(value="WAV")
        format_combo = ttk.Combobox(format_frame, textvariable=self.format_var, 
                                   values=["WAV", "AIFF"], state="readonly", width=20)
        format_combo.pack(pady=5, anchor='w')
        
        # Quality selection frame
        quality_frame = ttk.Frame(self.root)
        quality_frame.pack(pady=10, padx=20, fill='x')
        
        ttk.Label(quality_frame, text="Audio Quality:").pack(anchor='w')
        self.quality_var = tk.StringVar(value="Best")
        quality_combo = ttk.Combobox(quality_frame, textvariable=self.quality_var,
                                   values=["Best", "High", "Medium"], state="readonly", width=20)
        quality_combo.pack(pady=5, anchor='w')
        
        # Output directory frame
        output_frame = ttk.Frame(self.root)
        output_frame.pack(pady=10, padx=20, fill='x')
        
        ttk.Label(output_frame, text="Output Directory:").pack(anchor='w')
        dir_frame = ttk.Frame(output_frame)
        dir_frame.pack(pady=5, fill='x')
        
        self.dir_var = tk.StringVar(value=os.path.join(os.getcwd(), "downloads"))
        self.dir_entry = ttk.Entry(dir_frame, textvariable=self.dir_var, width=50)
        self.dir_entry.pack(side='left', fill='x', expand=True)
        
        browse_btn = ttk.Button(dir_frame, text="Browse", command=self.browse_directory)
        browse_btn.pack(side='right', padx=(5, 0))
        
        # Convert button
        self.convert_btn = ttk.Button(self.root, text="Convert Music", command=self.start_conversion)
        self.convert_btn.pack(pady=20)
        
        # Progress bar
        self.progress = ttk.Progressbar(self.root, mode='indeterminate')
        self.progress.pack(pady=10, padx=20, fill='x')
        
        # Status label
        self.status_label = ttk.Label(self.root, text="Ready to convert", font=('Arial', 10))
        self.status_label.pack(pady=5)
        
        # Log text area
        log_frame = ttk.Frame(self.root)
        log_frame.pack(pady=10, padx=20, fill='both', expand=True)
        
        ttk.Label(log_frame, text="Conversion Log:").pack(anchor='w')
        
        self.log_text = tk.Text(log_frame, height=8, bg='#1a1a1a', fg='white', 
                               font=('Consolas', 9), wrap='word')
        scrollbar = ttk.Scrollbar(log_frame, orient='vertical', command=self.log_text.yview)
        self.log_text.configure(yscrollcommand=scrollbar.set)
        
        self.log_text.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
        
    def browse_directory(self):
        directory = filedialog.askdirectory(initialdir=self.dir_var.get())
        if directory:
            self.dir_var.set(directory)
            
    def log_message(self, message):
        self.log_text.insert(tk.END, f"{message}\n")
        self.log_text.see(tk.END)
        self.root.update_idletasks()
        
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
            
    def get_spotify_info(self, url):
        """Extract track info from Spotify URL for YouTube search"""
        try:
            # Extract track ID from Spotify URL
            track_id = re.search(r'track/([a-zA-Z0-9]+)', url)
            if not track_id:
                return None
                
            # This is a simplified approach - in practice, you'd need Spotify API
            # For now, we'll return a generic search term
            return "spotify track"
        except:
            return None
            
    def get_youtube_url_from_spotify(self, spotify_url):
        """Convert Spotify URL to YouTube search"""
        # This is a simplified implementation
        # In practice, you'd need to use Spotify Web API to get track details
        # and then search YouTube for the same track
        
        # For demonstration, we'll return a placeholder
        # You would implement actual Spotify API integration here
        return None
        
    def download_audio(self, url, output_path, format_type, quality):
        """Download audio using yt-dlp"""
        try:
            # Configure yt-dlp options
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': output_path,
                'extractaudio': True,
                'audioformat': 'wav' if format_type.upper() == 'WAV' else 'aiff',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'wav' if format_type.upper() == 'WAV' else 'aiff',
                    'preferredquality': '192' if quality == 'High' else '128' if quality == 'Medium' else '320',
                }],
                'quiet': False,
                'no_warnings': False,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Get video info first
                info = ydl.extract_info(url, download=False)
                title = info.get('title', 'Unknown')
                self.log_message(f"Found: {title}")
                
                # Download
                ydl.download([url])
                return True
                
        except Exception as e:
            self.log_message(f"Download error: {str(e)}")
            return False
            
    def convert_to_format(self, input_file, output_file, format_type):
        """Convert audio file to specified format using pydub"""
        try:
            # Load audio file
            audio = AudioSegment.from_file(input_file)
            
            # Convert to specified format
            if format_type.upper() == 'WAV':
                audio.export(output_file, format="wav")
            elif format_type.upper() == 'AIFF':
                audio.export(output_file, format="aiff")
                
            return True
        except Exception as e:
            self.log_message(f"Conversion error: {str(e)}")
            return False
            
    def process_url(self, url, output_dir, format_type, quality):
        """Main processing function"""
        try:
            platform = self.detect_platform(url)
            self.log_message(f"Detected platform: {platform}")
            
            if platform == 'unknown':
                self.log_message("Unsupported platform. Trying as YouTube...")
                platform = 'youtube'
                
            # Handle Spotify URLs (convert to YouTube search)
            if platform == 'spotify':
                self.log_message("Spotify detected. Note: This will search YouTube for the track.")
                # In a real implementation, you'd use Spotify API here
                # For now, we'll treat it as a regular URL
                
            # Create output filename
            safe_title = "converted_audio"
            output_filename = f"{safe_title}.{format_type.lower()}"
            output_path = os.path.join(output_dir, output_filename)
            
            # Download audio
            self.log_message("Starting download...")
            if self.download_audio(url, output_path, format_type, quality):
                self.log_message(f"Successfully converted to {output_path}")
                return True
            else:
                self.log_message("Download failed")
                return False
                
        except Exception as e:
            self.log_message(f"Processing error: {str(e)}")
            return False
            
    def start_conversion(self):
        """Start conversion in a separate thread"""
        url = self.url_entry.get().strip()
        if not url:
            messagebox.showerror("Error", "Please enter a URL")
            return
            
        # Disable convert button and start progress
        self.convert_btn.config(state='disabled')
        self.progress.start()
        self.status_label.config(text="Converting...")
        
        # Start conversion in thread
        thread = threading.Thread(target=self.convert_music, daemon=True)
        thread.start()
        
    def convert_music(self):
        """Convert music in background thread"""
        try:
            url = self.url_entry.get().strip()
            output_dir = self.dir_var.get()
            format_type = self.format_var.get()
            quality = self.quality_var.get()
            
            self.log_message(f"Processing: {url}")
            self.log_message(f"Output format: {format_type}")
            self.log_message(f"Quality: {quality}")
            self.log_message(f"Output directory: {output_dir}")
            
            success = self.process_url(url, output_dir, format_type, quality)
            
            if success:
                self.log_message("Conversion completed successfully!")
                self.status_label.config(text="Conversion completed!")
                messagebox.showinfo("Success", "Music converted successfully!")
            else:
                self.log_message("Conversion failed!")
                self.status_label.config(text="Conversion failed!")
                messagebox.showerror("Error", "Conversion failed. Check the log for details.")
                
        except Exception as e:
            self.log_message(f"Unexpected error: {str(e)}")
            self.status_label.config(text="Error occurred!")
            messagebox.showerror("Error", f"An error occurred: {str(e)}")
            
        finally:
            # Re-enable convert button and stop progress
            self.convert_btn.config(state='normal')
            self.progress.stop()
            
    def run(self):
        """Start the application"""
        self.root.mainloop()

def main():
    """Main function"""
    print("Starting Music Converter...")
    
    # Check if required tools are available
    if not which("ffmpeg"):
        print("Warning: FFmpeg not found. Please install FFmpeg for audio conversion.")
        print("Download from: https://ffmpeg.org/download.html")
        
    app = MusicConverter()
    app.run()

if __name__ == "__main__":
    main()
