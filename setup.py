#!/usr/bin/env python3
"""
Setup script for Music Converter
"""

import os
import sys
import subprocess
import platform

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("Error: Python 3.7 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✓ Python version: {sys.version.split()[0]}")
    return True

def install_requirements():
    """Install Python requirements"""
    try:
        print("Installing Python dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Python dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install dependencies: {e}")
        return False

def check_ffmpeg():
    """Check if FFmpeg is installed"""
    try:
        result = subprocess.run(["ffmpeg", "-version"], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✓ FFmpeg is installed")
            return True
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    print("✗ FFmpeg not found")
    print_ffmpeg_instructions()
    return False

def print_ffmpeg_instructions():
    """Print FFmpeg installation instructions"""
    system = platform.system().lower()
    
    print("\nFFmpeg installation instructions:")
    print("=" * 40)
    
    if system == "windows":
        print("Windows:")
        print("1. Download FFmpeg from: https://ffmpeg.org/download.html")
        print("2. Extract to C:\\ffmpeg")
        print("3. Add C:\\ffmpeg\\bin to your PATH environment variable")
        print("4. Restart your command prompt")
        
    elif system == "darwin":  # macOS
        print("macOS:")
        print("Using Homebrew:")
        print("  brew install ffmpeg")
        print("\nOr download from: https://ffmpeg.org/download.html")
        
    elif system == "linux":
        print("Linux:")
        print("Ubuntu/Debian:")
        print("  sudo apt update")
        print("  sudo apt install ffmpeg")
        print("\nCentOS/RHEL:")
        print("  sudo yum install ffmpeg")
        print("\nOr download from: https://ffmpeg.org/download.html")
    
    print("\nAfter installation, restart your terminal and run this setup again.")

def create_directories():
    """Create necessary directories"""
    directories = ["downloads", "logs"]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Created directory: {directory}")

def main():
    """Main setup function"""
    print("Music Converter Setup")
    print("=" * 20)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Install requirements
    if not install_requirements():
        return False
    
    # Check FFmpeg
    ffmpeg_ok = check_ffmpeg()
    
    # Create directories
    create_directories()
    
    print("\nSetup Summary:")
    print("=" * 15)
    print("✓ Python dependencies installed")
    if ffmpeg_ok:
        print("✓ FFmpeg is ready")
    else:
        print("✗ FFmpeg needs to be installed")
    print("✓ Directories created")
    
    if ffmpeg_ok:
        print("\n🎉 Setup complete! You can now run:")
        print("  python music_converter.py    # GUI version")
        print("  python cli_converter.py --help    # CLI version")
    else:
        print("\n⚠️  Setup partially complete. Please install FFmpeg and run setup again.")
    
    return ffmpeg_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
