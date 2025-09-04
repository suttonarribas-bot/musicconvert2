# Audio Converter - Client-Side AIFF Conversion

A sophisticated single-page web application that converts audio files to AIFF format directly in your browser using ffmpeg.wasm. No server uploads required - everything happens client-side for maximum privacy and security.

## 🎵 Features

- **Client-Side Conversion**: All processing happens in your browser using WebAssembly
- **Multiple Input Methods**: Convert from direct audio URLs or upload files
- **AIFF Output**: High-quality 44.1 kHz, 16-bit PCM, stereo output
- **Streaming Service Metadata**: View track information from Spotify, YouTube, SoundCloud, Apple Music (display only)
- **CORS Handling**: Smart detection and user guidance for cross-origin issues
- **Progress Tracking**: Real-time conversion progress with visual feedback
- **Mobile Support**: Responsive design works on all devices
- **PWA Ready**: Installable as a Progressive Web App

## 🚀 Live Demo

Visit the live application at: [https://relaxed-gingersnap-bc1078.netlify.app](https://relaxed-gingersnap-bc1078.netlify.app)

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Audio Processing**: ffmpeg.wasm (WebAssembly)
- **Styling**: Vanilla CSS with modern features
- **Deployment**: Netlify (static hosting)
- **PWA**: Service Worker + Web App Manifest

## 📋 Supported Formats

### Input Formats
- MP3, WAV, FLAC, M4A, OGG, OPUS, AAC, WMA

### Output Format
- AIFF (44.1 kHz, 16-bit PCM, Stereo)

## 🔒 Security & Privacy

- **No Server Uploads**: Files never leave your device
- **CORS Compliant**: Respects cross-origin policies
- **Streaming Service Protection**: Blocks downloads from Spotify, YouTube, SoundCloud, Apple Music
- **File Size Limits**: 200 MB maximum to prevent memory issues
- **Client-Side Only**: No backend server required

## 🚫 Blocked Domains

The application blocks conversion from these streaming services:
- `open.spotify.com`, `spotify.link`
- `music.apple.com`, `itunes.apple.com`
- `youtube.com`, `www.youtube.com`, `m.youtube.com`, `youtu.be`
- `soundcloud.com`, `m.soundcloud.com`, `api.soundcloud.com`

## 🏃‍♂️ Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/suttonarribas-bot/musicconvert2.git
   cd musicconvert2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── UrlConvert.jsx   # URL-based conversion
│   ├── UploadConvert.jsx # File upload conversion
│   ├── MetadataPanel.jsx # Streaming service metadata
│   ├── ProgressBar.jsx  # Progress indicators
│   └── ResultPanel.jsx  # Conversion results
├── lib/                 # Utility libraries
│   ├── ffmpegClient.js  # FFmpeg.wasm wrapper
│   └── utils.js         # Helper functions
├── styles/              # Component styles
├── App.jsx              # Main application
└── main.jsx             # Entry point

public/
├── manifest.json        # PWA manifest
└── vite.svg            # App icon

netlify.toml            # Netlify configuration
```

## 🔧 Configuration

### FFmpeg.wasm Assets

The application uses CDN-hosted ffmpeg.wasm assets from unpkg.com:
- Core: `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js`
- WASM: `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm`

### Environment Variables

No environment variables required - the application is fully client-side.

## 🌐 Browser Compatibility

### Required Features
- WebAssembly support
- SharedArrayBuffer (for ffmpeg.wasm)
- Fetch API
- FileReader API
- Modern ES6+ support

### Supported Browsers
- Chrome 67+
- Firefox 79+
- Safari 15+
- Edge 79+

### Mobile Support
- iOS Safari 15+
- Chrome Mobile 67+
- Firefox Mobile 79+

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Ready**: Basic offline functionality
- **App-like Experience**: Standalone display mode
- **Fast Loading**: Optimized bundle with code splitting

## 🚨 Known Limitations

### CORS Restrictions
- Some audio URLs may not allow cross-origin requests
- Users are guided to use the upload option instead
- No server-side proxy is provided (by design)

### File Size Limits
- Maximum 200 MB per file
- Larger files may cause memory issues
- Progress tracking helps monitor large conversions

### Browser Requirements
- Requires modern browser with WebAssembly support
- SharedArrayBuffer must be enabled
- Some corporate networks may block WebAssembly

## 🔍 Troubleshooting

### Common Issues

1. **"WebAssembly not supported"**
   - Update your browser to the latest version
   - Enable JavaScript and WebAssembly

2. **"CORS blocked"**
   - Use the Upload File option instead
   - Try a different audio URL that allows CORS

3. **"File too large"**
   - Reduce file size to under 200 MB
   - Use audio compression before conversion

4. **"Conversion failed"**
   - Check if the file is a valid audio format
   - Try a different input file
   - Refresh the page and try again

### Debug Mode

Open browser developer tools to see detailed ffmpeg.wasm logs and error messages.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚖️ Legal Notice

This tool is for personal use only. Users are responsible for:
- Only converting audio files they own or have rights to
- Respecting copyright laws and terms of service
- Not using the tool for commercial purposes without permission

The authors are not responsible for any misuse of this software.

## 🙏 Acknowledgments

- [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) - WebAssembly port of FFmpeg
- [Vite](https://vitejs.dev/) - Fast build tool and dev server
- [React](https://reactjs.org/) - UI library
- [Netlify](https://netlify.com/) - Static site hosting

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/suttonarribas-bot/musicconvert2/issues)
- **Discussions**: [GitHub Discussions](https://github.com/suttonarribas-bot/musicconvert2/discussions)
- **Email**: [Contact via GitHub](https://github.com/suttonarribas-bot)

---

**Built with ❤️ for the audio community**