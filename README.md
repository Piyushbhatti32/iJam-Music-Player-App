# 🎵 iJam Music Player

> A modern, feature-rich music player application built with vanilla HTML, CSS, and JavaScript. Experience seamless music streaming with advanced queue management, session persistence, and dynamic file discovery.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

## ✨ Features

### 🎶 **Advanced Music Player**
- **Universal Audio Format Support**: MP3, WAV, M4A, AAC, OGG, FLAC, WebM, Opus
- **Dynamic File Discovery**: Automatically detects and plays audio files with any naming convention
- **Background Playback**: Music continues playing while navigating the app
- **Seamless Controls**: Play, pause, skip, previous, seek, volume control

### 🎯 **Smart Queue Management**
- **Intelligent Queue System**: Displays all upcoming songs with visual indicators
- **Shuffle Mode**: Fisher-Yates algorithm with original order preservation
- **Queue Controls**: Add, remove, clear, and reorder songs
- **Auto-Advance**: Automatically plays next song when current finishes
- **Album Integration**: Playing from an album adds all songs to queue

### 💾 **Session Persistence**
- **3-Hour Session Storage**: Remembers your music session for up to 3 hours
- **Auto-Save**: Saves playback position every 10 seconds
- **Tab Lifecycle Management**: Handles tab visibility and window focus changes
- **Graceful Recovery**: Restores last played song and position on app reload

### 🎨 **Modern Interface**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Themes**: Toggle between beautiful light and dark modes
- **Smooth Animations**: CSS transitions and hover effects
- **Clean Typography**: Modern, readable font choices

### 📱 **User Experience**
- **Drag & Drop**: Upload music files directly to the player
- **Search Functionality**: Find songs and albums quickly
- **Playlist Management**: Create, edit, and manage custom playlists
- **Favorites System**: Mark and access your favorite tracks
- **Real-time Notifications**: Toast notifications for user actions

### 🔧 **Developer Features**
- **Modular Architecture**: Clean, maintainable ES6 class structure
- **Dynamic Discovery**: No hardcoded file paths or album lists
- **Error Handling**: Robust error management with user-friendly messages
- **Event-Driven**: Efficient event system for component communication

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (recommended) or direct file access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/iJam-Music-Player-App.git
   cd iJam-Music-Player-App
   ```

2. **Set up your music library**
   ```
   Albums/
   ├── albums.json          # List of album directories
   ├── Album1/
   │   ├── album.json       # Album metadata
   │   ├── cover.jpg        # Album artwork
   │   ├── 01 - Song1.mp3   # Audio files
   │   └── 02 - Song2.mp3
   └── Album2/
       ├── album.json
       ├── cover.jpg
       └── *.mp3
   ```

3. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 3000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:3000
   
   # Using npm (if package.json exists)
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
iJam-Music-Player-App/
├── 📄 index.html           # Main application HTML
├── 🎨 style.css            # Core styling and themes
├── 🔧 utility.css          # Utility classes and helpers
├── ⚡ script.js            # Application logic and functionality
├── 🖼️ favicon.ico          # Application icon
├── 📋 AGENT.md             # Development assistant guide
├── 📖 README.md            # This file
├── 📦 package.json         # Node.js dependencies (for dev server)
├── ⚙️ vite.config.js       # Vite development server configuration
└── 🎵 Albums/              # Music library directory
    ├── 📋 albums.json      # Album directory listing
    ├── 📁 Album1/          # Individual album folders
    │   ├── 📋 album.json   # Album metadata
    │   ├── 🖼️ cover.jpg    # Album artwork
    │   └── 🎵 *.mp3        # Audio files
    └── 📁 Album2/
        └── ...
```

## ⚙️ Configuration

### Album Setup

1. **Create albums.json**
   ```json
   [
     "Divide",
     "Kabir Singh",
     "Your Album Name"
   ]
   ```

2. **Create album metadata (album.json)**
   ```json
   {
     "id": 1,
     "title": "Album Title",
     "artist": "Artist Name",
     "year": "2023",
     "genre": "Pop",
     "cover": "/Albums/AlbumName/cover.jpg",
     "description": "Album description",
     "rating": 4.5,
     "totalTracks": 12,
     "songs": [
       {
         "id": 1,
         "title": "Song Title",
         "artist": "Artist Name",
         "duration": "3:45",
         "explicit": false,
         "file": "01 - Song Title.mp3"
       }
     ]
   }
   ```

### Supported File Formats

The player supports all major audio formats through HTML5 Audio API:

| Format | Extension | Browser Support |
|--------|-----------|----------------|
| MP3 | `.mp3` | ✅ Universal |
| WAV | `.wav` | ✅ Universal |
| M4A | `.m4a` | ✅ Widely Supported |
| AAC | `.aac` | ✅ Widely Supported |
| OGG | `.ogg`, `.oga` | ✅ Firefox, Chrome |
| WebM | `.webm`, `.weba` | ✅ Modern Browsers |
| Opus | `.opus` | ✅ High Quality |
| FLAC | `.flac` | ⚠️ Limited Support |

## 🛠️ Development

### Architecture Overview

```javascript
// Core Classes
├── AppState              # Global application state management
├── AudioPlayerManager    # Audio playback and queue control
├── AuthManager          # User authentication (future feature)
├── FileUploadManager    # Drag & drop file handling
└── Utility Functions    # Helper functions and storage management
```

### Key Components

#### **AudioPlayerManager**
- Handles all audio playback operations
- Manages queue system and session persistence
- Controls shuffle, repeat, and playback modes

#### **Dynamic File Discovery**
- Tries 200+ filename combinations automatically
- Supports any naming convention or quality suffix
- Falls back gracefully when files aren't found

#### **Session Management**
- Stores playback state in localStorage
- 3-hour timeout for session expiration
- Handles tab visibility and page lifecycle events

### Building & Development

```bash
# Install development dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage Examples

### Playing Music
```javascript
// Play a single song
window.playSong(songObject, albumCover);

// Play from album (adds entire album to queue)
window.playSongFromAlbum(songId, albumId);

// Control playback
window.audioPlayerManager.play();
window.audioPlayerManager.pause();
window.audioPlayerManager.nextTrack();
window.audioPlayerManager.previousTrack();
```

### Queue Management
```javascript
// Add to queue
window.audioPlayerManager.addToQueue(song, albumCover);

// Clear queue
window.audioPlayerManager.clearQueue();

// Shuffle queue
window.audioPlayerManager.shuffleQueue();

// Remove from queue
window.audioPlayerManager.removeFromQueue(index);
```

## 🐛 Troubleshooting

### Common Issues

1. **Songs won't play**
   - Check if files exist in the correct directory
   - Verify album.json has correct file paths
   - Ensure browser supports the audio format

2. **Albums not loading**
   - Verify albums.json exists and is valid JSON
   - Check album.json files in each album directory
   - Look for console errors in browser developer tools

3. **Session not restoring**
   - Check if localStorage is enabled
   - Verify session is less than 3 hours old
   - Clear browser cache and try again

### Debug Mode

Enable debug logging by opening browser console to see detailed logs:
- 🎵 Audio loading and playback events
- 📂 File discovery attempts
- 💾 Session save/restore operations
- ⚠️ Error messages and warnings

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with descriptive messages**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Use ES6+ JavaScript features
- Follow existing code style and patterns
- Add comments for complex logic
- Test across different browsers
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Font Awesome** for beautiful icons
- **HTML5 Audio API** for audio playback capabilities
- **CSS Grid & Flexbox** for responsive layout
- **LocalStorage API** for session persistence

## 🔗 Links

- [Live Demo](https://piyushbhatti32.github.io/iJam-Music-Player-App/)
- [Issues](https://github.com/piyushbhatti32/iJam-Music-Player-App/issues)
- [Discussions](https://github.com/piyushbhatti32/iJam-Music-Player-App/discussions)

---

<div align="center">

**Made with ❤️ by [Piyush]((https://github.com/piyushbhatti32))**

[⭐ Star this repo](https://github.com/piyushbhatti32/iJam-Music-Player-App) • [🐛 Report Bug](https://github.com/piyushbhatti32/iJam-Music-Player-App/issues) • [💡 Request Feature](https://github.com/piyushbhatti32/iJam-Music-Player-App/issues)

</div>
