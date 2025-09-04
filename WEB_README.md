# Music Converter - Web Deployment

This repository contains both desktop and web versions of the Music Converter application.

## For Web Deployment (Netlify/Vercel/etc.)

The web deployment uses static files:
- `index.html` - Main landing page with project information
- `static_converter.html` - Alternative static page
- `netlify.toml` - Netlify configuration
- `build.sh` - Simple build script

## For Desktop Use

Download and run the desktop application:
- `music_converter.py` - GUI application
- `cli_converter.py` - Command-line interface
- `batch_processor.py` - Batch processing
- `requirements.txt` - Python dependencies

## Quick Start (Desktop)

```bash
# Install dependencies
pip install -r requirements.txt

# Run GUI version
python music_converter.py

# Or use command line
python cli_converter.py "https://www.youtube.com/watch?v=VIDEO_ID"
```

## Web Version Limitations

The web version is a static information page. For actual music conversion, please download the desktop application from the GitHub repository.
