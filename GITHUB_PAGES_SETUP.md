# GitHub Pages Deployment Guide

## Issues with GitHub Pages

GitHub Pages has several limitations that affect this music player:

### 1. Path Issues
- ✅ **FIXED**: Changed absolute paths (`/Albums/`) to relative paths (`./Albums/`)
- GitHub Pages serves from subdirectories like `username.github.io/repo-name/`

### 2. File Size Limitations
- GitHub repositories are limited to 100MB total
- Individual files should be under 25MB
- **MP3 files are often too large for GitHub Pages**

### 3. Dynamic File Discovery
- The app tries to auto-discover music files using `fetch()` HEAD requests
- This may not work reliably on GitHub Pages

## Solutions

### Option 1: Use External File Hosting (Recommended)

1. **Host music files elsewhere:**
   - Use cloud storage (Google Drive, Dropbox, etc.)
   - Use CDN services
   - Use file hosting services

2. **Update album JSON files:**
```json
{
  "id": "album1",
  "title": "My Album",
  "artist": "My Artist",
  "cover": "https://your-cdn.com/covers/album1.jpg",
  "songs": [
    {
      "id": 1,
      "title": "Song 1",
      "artist": "My Artist",
      "duration": "3:45",
      "file": "https://your-cdn.com/music/song1.mp3"
    }
  ]
}
```

### Option 2: Use Small Sample Files

1. **Replace MP3s with small samples (30-60 seconds)**
2. **Keep file sizes under 25MB each**
3. **Ensure total repository size stays under 100MB**

### Option 3: Fork for Demo Purposes

1. **Remove all music files**
2. **Keep only the UI/functionality**
3. **Show upload interface for users to add their own files**

## Current Status

✅ **Fixed path issues** - All absolute paths changed to relative paths
⚠️ **Music files may still not load** due to GitHub Pages limitations
⚠️ **File size limits** may prevent proper hosting

## Testing

After deploying to GitHub Pages:

1. Open browser developer tools
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify file paths are correct

## Alternative Deployment Options

Consider these alternatives to GitHub Pages:

- **Netlify** - Better for static sites with large files
- **Vercel** - Good performance and file handling
- **Firebase Hosting** - Supports larger files
- **Your own web server** - Full control

## For Development

The app will continue to work perfectly in local development with the original music files.
