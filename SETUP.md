# 🚀 Setup Guide for iJam Music Player

This guide will help you set up iJam Music Player on your local machine and deploy it to GitHub Pages.

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **Git** version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Music files** in supported formats (MP3, WAV, M4A, etc.)

## 🔧 Local Development Setup

### 1. Clone the Repository

```bash
# Clone your fork or the main repository
git clone https://github.com/yourusername/ijam-music-player.git
cd ijam-music-player
```

### 2. Install Dependencies

```bash
# Install development dependencies
npm install
```

### 3. Set Up Music Library

#### Option A: Use Sample Albums (Recommended for testing)
The repository includes sample album structures in the `Albums/` directory.

#### Option B: Add Your Own Music
1. Create album folders in `Albums/` directory:
   ```
   Albums/
   ├── albums.json
   ├── Your Album 1/
   │   ├── album.json
   │   ├── cover.jpg
   │   └── *.mp3
   └── Your Album 2/
       ├── album.json
       ├── cover.jpg
       └── *.mp3
   ```

2. Update `Albums/albums.json`:
   ```json
   [
     "Your Album 1",
     "Your Album 2"
   ]
   ```

3. Create album metadata files (`Albums/Your Album 1/album.json`):
   ```json
   {
     "id": 1,
     "title": "Your Album Title",
     "artist": "Artist Name",
     "year": "2023",
     "genre": "Pop",
     "cover": "/Albums/Your Album 1/cover.jpg",
     "description": "Album description",
     "rating": 4.5,
     "totalTracks": 10,
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

### 4. Start Development Server

```bash
# Start Vite development server
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🌐 GitHub Pages Deployment

### Automatic Deployment (Recommended)

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as source

2. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **GitHub Actions will automatically**:
   - Build the project
   - Deploy to GitHub Pages
   - Your site will be available at `https://yourusername.github.io/ijam-music-player`

### Manual Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy using GitHub Pages**:
   ```bash
   # Install gh-pages package
   npm install --save-dev gh-pages

   # Add to package.json scripts:
   "deploy": "gh-pages -d dist"

   # Deploy
   npm run deploy
   ```

## 🎵 Adding Music Content

### File Organization

```
Albums/
├── albums.json                 # Master album list
└── [Album Name]/
    ├── album.json             # Album metadata
    ├── cover.jpg              # Album artwork (optional)
    └── audio files            # Music files
```

### Supported Naming Patterns

The player automatically detects various file naming patterns:

- `01 - Song Title.mp3`
- `1. Song Title - Album - 320Kbps-(Mr-Jat.in).mp3`
- `Song Title.mp3`
- `Track 01.mp3`

### Audio Format Support

| Format | Extension | Recommended |
|--------|-----------|------------|
| MP3 | `.mp3` | ✅ Best compatibility |
| WAV | `.wav` | ✅ High quality |
| M4A | `.m4a` | ✅ Good compression |
| FLAC | `.flac` | ⚠️ Limited browser support |

## 🔐 Environment Configuration

### Development Environment

Create a `.env.local` file (optional):
```env
# Development settings
VITE_DEV_MODE=true
VITE_DEBUG_AUDIO=true
```

### Production Settings

For production deployment, ensure:
- All audio files are properly referenced
- HTTPS is enabled for Web Audio API features
- File paths use forward slashes (`/`)
- No sensitive information in code

## 🐛 Troubleshooting

### Common Issues

1. **Songs not playing**
   ```bash
   # Check console for errors
   # Verify file paths in album.json
   # Test with different audio formats
   ```

2. **Albums not loading**
   ```bash
   # Verify albums.json syntax
   # Check album.json files exist
   # Ensure proper JSON formatting
   ```

3. **Development server issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall dependencies
   rm -rf node_modules
   npm install
   ```

### Debug Mode

Enable debug logging in browser console:
```javascript
// In browser console
localStorage.setItem('ijam_debug', 'true');
location.reload();
```

## 📱 Mobile Testing

Test the application on various devices:

```bash
# Access from mobile device on same network
# Replace YOUR_IP with your computer's IP address
http://YOUR_IP:5173
```

## 🔧 Customization

### Theming

Modify CSS custom properties in `style.css`:
```css
:root {
  --primary-color: #your-color;
  --accent-color: #your-accent;
  --background-color: #your-bg;
}
```

### Features

Add new features by:
1. Extending existing classes in `script.js`
2. Adding UI components in `index.html`
3. Styling in `style.css`
4. Testing across browsers

## 📊 Performance Optimization

### Recommendations

1. **Optimize Images**:
   - Use WebP format for album covers
   - Compress images to <500KB
   - Use appropriate dimensions (500x500px for covers)

2. **Audio Files**:
   - Use 320kbps MP3 for balance of quality/size
   - Consider progressive loading for large libraries

3. **Caching**:
   - Enable browser caching
   - Use service workers (future enhancement)

## 🚀 Deployment Checklist

- [ ] All music files added and tested
- [ ] Album metadata complete and valid
- [ ] No console errors in browser
- [ ] Responsive design tested on mobile
- [ ] Production build successful
- [ ] GitHub Pages deployment working
- [ ] All features functional in production

## 📚 Additional Resources

- [HTML5 Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement)
- [Vite Documentation](https://vitejs.dev/)
- [GitHub Pages Guide](https://pages.github.com/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

Need help? [Open an issue](https://github.com/yourusername/ijam-music-player/issues) or check the [FAQ](README.md#troubleshooting).
