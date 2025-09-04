# Music Converter

A Python application that downloads and converts music from various platforms (YouTube, SoundCloud, Spotify, Apple Music) to high-quality WAV or AIFF format.

## Features

- **Multi-platform support**: YouTube, SoundCloud, Spotify, Apple Music
- **High-quality output**: WAV and AIFF formats
- **User-friendly GUI**: Easy-to-use graphical interface
- **Command-line interface**: For advanced users and batch processing
- **Quality options**: Best, High, Medium quality settings
- **Batch processing**: Convert multiple tracks at once

## Installation

### Prerequisites

1. **Python 3.7+** - Download from [python.org](https://python.org)
2. **FFmpeg** - Required for audio conversion
   - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
   - macOS: `brew install ffmpeg`
   - Linux: `sudo apt install ffmpeg` (Ubuntu/Debian)

### Setup

1. Clone or download this repository
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Graphical Interface

Run the GUI version:
```bash
python music_converter.py
```

**How to use:**
1. Paste a music URL in the input field
2. Select output format (WAV or AIFF)
3. Choose audio quality
4. Select output directory
5. Click "Convert Music"

### Command Line Interface

For single URL:
```bash
python cli_converter.py "https://www.youtube.com/watch?v=VIDEO_ID"
```

With options:
```bash
python cli_converter.py "URL" -f aiff -q best -o /path/to/output
```

Batch processing:
```bash
# Create a text file with URLs (one per line)
echo "https://www.youtube.com/watch?v=VIDEO1" > urls.txt
echo "https://soundcloud.com/user/track" >> urls.txt

# Process all URLs
python cli_converter.py urls.txt --batch
```

### Command Line Options

- `-f, --format`: Output format (wav, aiff) - default: wav
- `-q, --quality`: Audio quality (best, high, medium) - default: best
- `-o, --output`: Output directory - default: ./downloads
- `-n, --name`: Custom filename (without extension)
- `--batch`: Process multiple URLs from a text file

## Supported Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| YouTube | ✅ Full support | Direct download |
| SoundCloud | ✅ Full support | Direct download |
| Spotify | ⚠️ Limited | Searches YouTube for tracks |
| Apple Music | ⚠️ Limited | Searches YouTube for tracks |

## Output Formats

- **WAV**: Uncompressed, highest quality
- **AIFF**: Apple's uncompressed format, highest quality

## Quality Settings

- **Best**: 320 kbps (highest quality)
- **High**: 192 kbps (good quality)
- **Medium**: 128 kbps (standard quality)

## File Structure

```
Musicconvert2/
├── music_converter.py    # GUI application
├── cli_converter.py      # Command-line interface
├── requirements.txt      # Python dependencies
├── README.md            # This file
└── downloads/           # Default output directory
```

## Troubleshooting

### Common Issues

1. **FFmpeg not found**
   - Install FFmpeg and ensure it's in your system PATH
   - Restart your terminal/command prompt after installation

2. **Download fails**
   - Check your internet connection
   - Verify the URL is correct and accessible
   - Some videos may be region-restricted

3. **Permission errors**
   - Ensure you have write permissions to the output directory
   - Try running as administrator (Windows) or with sudo (Linux/macOS)

4. **Audio quality issues**
   - Use "Best" quality setting for highest quality
   - Some source videos may have limited audio quality

### Platform-Specific Notes

- **Spotify/Apple Music**: These platforms don't allow direct downloads. The tool searches YouTube for the same tracks.
- **Private/Unlisted videos**: May not be downloadable
- **Copyright-protected content**: Some content may be restricted

## Legal Notice

This tool is for personal use only. Please respect copyright laws and terms of service of the platforms you're downloading from. The authors are not responsible for any misuse of this software.

## Dependencies

- `yt-dlp`: YouTube and general video downloading
- `pydub`: Audio processing and format conversion
- `requests`: HTTP requests
- `tkinter`: GUI framework (included with Python)
- `Pillow`: Image processing for GUI

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is for educational and personal use only.
