// ===== iJAM MUSIC PLAYER - MAIN SCRIPT =====

// ===== GITHUB PAGES PATH UTILITIES =====

// Dynamic base path utility for GitHub Pages compatibility
function getBasePath() {
  const isProduction = location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
  return isProduction && location.pathname !== '/' 
    ? location.pathname.replace(/\/$/, '') 
    : '';
}

function getAlbumsPath(path = '') {
  const basePath = getBasePath();
  const albumsPath = `${basePath}/Albums/${path}`.replace(/\/+/g, '/');
  return albumsPath.startsWith('/') ? albumsPath : '/' + albumsPath;
}

console.log('🌐 Base path:', getBasePath());
console.log('🎵 Albums path:', getAlbumsPath());

// ===== 1. CORE CLASSES =====

class Album {
  constructor(id, title, artist, coverUrl) {
    this.id = id;
    this.title = title;
    this.artist = artist;
    this.coverUrl = coverUrl;
    this.songs = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();

    // Additional metadata
    this.year = "";
    this.genre = "";
    this.description = "";
    this.rating = 0;
    this.totalTracks = 0;
    this.directory = "";
  }

  setMetadata({ year, genre, description, rating, totalTracks, directory }) {
    this.year = year || "";
    this.genre = genre || "";
    this.description = description || "";
    this.rating = rating || 0;
    this.totalTracks = totalTracks || 0;
    this.directory = directory || "";
    this.updatedAt = new Date();
  }

  addSong(song) {
    this.songs.push(song);
    this.updatedAt = new Date();
  }

  removeSong(songId) {
    this.songs = this.songs.filter((song) => song.id !== songId);
    this.updatedAt = new Date();
  }
}

class Song {
  constructor(id, title, artist, duration, albumId) {
    this.id = id;
    this.title = title;
    this.artist = artist;
    this.duration = duration;
    this.albumId = albumId;
    this.createdAt = new Date();

    // Additional metadata
    this.filePath = "";
    this.explicit = false;
    this.playCount = 0;
    this.lastPlayed = null;
  }

  setMetadata({ filePath, explicit }) {
    this.filePath = filePath || "";
    this.explicit = explicit || false;
    this.updatedAt = new Date();
  }

  incrementPlayCount() {
    this.playCount++;
    this.lastPlayed = new Date();
  }
}

class CustomCarousel {
  constructor(element) {
    if (!element) {
      console.error("Carousel element not provided");
      return;
    }

    this.carousel = element;
    this.container = element.querySelector(".carousel-container");
    this.track = element.querySelector(".carousel-track");
    this.cells = element.querySelectorAll(".gallery-cell");

    if (!this.container || !this.track) {
      console.error("Required carousel container or track missing");
      return;
    }

    this.cells = this.cells || [];

    if (!this.cells.length) {
      this.track.innerHTML =
        '<div class="gallery-cell placeholder"><div class="loading-spinner"></div></div>';
      this.cells = this.track.querySelectorAll(".gallery-cell");
    }

    const autoplayAttr = element.dataset.autoplay;
    this.autoplaySpeed = autoplayAttr
      ? Math.max(1000, parseInt(autoplayAttr))
      : 3000;
    this.autoplayInterval = null;

    this.currentIndex = 0;
    this.isPlaying = false;
    this.isTransitioning = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    this.init();
  }

  handleCellClick(cell) {
    const albumId = cell.dataset.albumId;
    if (albumId) {
      navigateToAlbum(albumId);
    }
  }

  addCells(albums) {
    this.track.innerHTML = albums
      .map(
        (album) => `
      <div class="gallery-cell" data-album-id="${album.id}">
        <img src="${album.coverUrl || album.cover}" alt="${album.title}" />
        <div class="album-info">
          <h3>${album.title}</h3>
          <p>${album.artist}</p>
        </div>
      </div>
    `
      )
      .join("");

    this.cells = this.track.querySelectorAll(".gallery-cell");
    this.cells.forEach((cell) => {
      cell.addEventListener("click", () => this.handleCellClick(cell));
    });
  }

  init() {
    if (!this.container) {
      console.error("Carousel container not found");
      return;
    }

    this.container.style.cssText = `
      overflow: hidden;
      position: relative;
      cursor: grab;
      user-select: none;
    `;

    this.track.style.cssText = `
      display: flex;
      transition: transform 0.3s ease;
      will-change: transform;
    `;

    this.cells.forEach((cell, index) => {
      cell.style.cssText = `
        flex: 0 0 auto;
        margin-right: 20px;
        cursor: pointer;
        transition: transform 0.2s ease;
      `;

      cell.addEventListener("mouseenter", () => {
        cell.style.transform = "scale(1.05)";
      });

      cell.addEventListener("mouseleave", () => {
        cell.style.transform = "scale(1)";
      });
    });

    this.container.addEventListener("mousedown", this.handleMouseDown);
    this.container.addEventListener("keydown", this.handleKeyDown);
    this.container.addEventListener("touchstart", this.handleTouchStart, {
      passive: false,
    });
    this.container.setAttribute("tabindex", "0");
  }

  cleanup() {
    // Clean up any dangling event listeners
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
    
    // Reset states
    this.isMouseDown = false;
    this.isTouching = false;
    document.body.style.cursor = "";
    
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  handleKeyDown(e) {
    if (e.key === "ArrowLeft") {
      this.previousSlide();
    } else if (e.key === "ArrowRight") {
      this.nextSlide();
    }
  }

  handleMouseDown(e) {
    this.isMouseDown = true;
    this.startX = e.clientX;
    this.container.style.cursor = "grabbing";

    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);
    
    // Prevent drag and select
    e.preventDefault();
  }

  handleMouseMove(e) {
    if (!this.isMouseDown) return;

    const deltaX = e.clientX - this.startX;
    if (Math.abs(deltaX) > 5) {
      e.preventDefault();
      this.track.style.transform = `translateX(${
        -this.currentIndex * 220 + deltaX
      }px)`;
    }
  }

  handleMouseUp(e) {
    if (!this.isMouseDown) return;

    this.isMouseDown = false;
    this.container.style.cursor = "grab";

    const deltaX = e.clientX - this.startX;

    if (deltaX > 50) {
      this.previousSlide();
    } else if (deltaX < -50) {
      this.nextSlide();
    } else {
      this.updateSlidePosition();
    }

    // Clean up event listeners
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
    
    // Reset cursor for all elements
    document.body.style.cursor = "";
  }

  handleTouchStart(e) {
    this.isTouching = true;
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;

    document.addEventListener("touchmove", this.handleTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", this.handleTouchEnd);
  }

  handleTouchMove(e) {
    if (!this.isTouching) return;

    const deltaX = e.touches[0].clientX - this.startX;
    const deltaY = e.touches[0].clientY - this.startY;

    // Only handle horizontal swipes, ignore vertical scrolls
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
      this.track.style.transform = `translateX(${
        -this.currentIndex * 220 + deltaX
      }px)`;
    }
  }

  handleTouchEnd(e) {
    if (!this.isTouching) return;

    this.isTouching = false;

    const deltaX = e.changedTouches[0].clientX - this.startX;

    if (deltaX > 50) {
      this.previousSlide();
    } else if (deltaX < -50) {
      this.nextSlide();
    } else {
      this.updateSlidePosition();
    }

    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
  }

  nextSlide() {
    if (this.currentIndex < this.cells.length - 1) {
      this.currentIndex++;
      this.updateSlidePosition();
    }
  }

  previousSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateSlidePosition();
    }
  }

  updateSlidePosition() {
    const translateX = -this.currentIndex * 220;
    this.track.style.transform = `translateX(${translateX}px)`;
  }
}

// ===== 2. APP STATE MANAGEMENT =====

class AppState {
  constructor() {
    this.albums = [];
    this.currentAlbum = null;
    this.currentSong = null;
    this.currentPlaylist = null;
    this.queue = [];
    this.playlists = [];
    this.favorites = new Set();
    this.recentlyPlayed = [];
    this.searchHistory = [];
    this.theme = "light";
    this.volume = 75;
    this.eventListeners = {};
    this.loadFavorites();
  }

  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  async discoverAlbums() {
    console.log('🔍 Starting dynamic album discovery...');
    
    try {
      // First, try to load the albums.json file that lists all available albums
      const albumsListResponse = await fetch(getAlbumsPath('albums.json'));
      if (albumsListResponse.ok) {
        const albumsList = await albumsListResponse.json();
        console.log('📋 Found albums.json file:', albumsList);
        
        // Validate that the albums.json contains an albums array
        if (albumsList && Array.isArray(albumsList.albums)) {
          console.log('✅ Using albums.json for discovery');
          return albumsList.albums;
        } else if (Array.isArray(albumsList)) {
          console.log('✅ Using albums.json array for discovery');
          return albumsList;
        } else {
          console.warn('⚠️ albums.json format invalid, expected array or {albums: []}');
        }
      }
    } catch (error) {
      console.log('📋 No albums.json found, using fallback discovery');
    }
    
    // Fallback: Try to discover albums dynamically
    const validAlbums = [];
    
    try {
      // Try directory listing approach
      const response = await fetch(getAlbumsPath());
      if (response.ok) {
        const html = await response.text();
        
        // Check if this looks like a directory listing
        if (html.includes('Index of') || html.includes('<pre>') || html.includes('Directory listing')) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const links = doc.querySelectorAll('a[href]');
          
          for (const link of links) {
            const href = link.getAttribute('href');
            if (href && href.endsWith('/') && href !== '../' && !href.startsWith('http')) {
              const dirName = decodeURIComponent(href.slice(0, -1));
              
              // Verify this is a valid album directory
              try {
                const albumResponse = await fetch(getAlbumsPath(`${dirName}/album.json`));
                if (albumResponse.ok) {
                  const data = await albumResponse.json();
                  if (data && data.id && data.title && data.artist) {
                    validAlbums.push(dirName);
                    console.log(`✅ Discovered album: ${dirName}`);
                  }
                }
              } catch (e) {
                // Not a valid album directory
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Directory listing not available:', error);
    }
    
    // If still no albums found, log warning
    if (validAlbums.length === 0) {
      console.warn('⚠️ No albums found through any discovery method');
    }
    
    console.log('🎵 Final discovered albums:', validAlbums);
    return validAlbums;
  }
  




  async loadLocalAlbums() {
    try {
      console.log("🎵 Starting album loading process...");
      const albumDirs = await this.discoverAlbums();
      this.albums = [];
      console.log("📂 Album directories to load:", albumDirs);

      for (const albumDir of albumDirs) {
        try {
          // Try different JSON file naming patterns
          const possibleJsonFiles = [
            `${albumDir}.json`, // Exact match first
            `${albumDir.toLowerCase().replace(/\s+/g, "_")}.json`, // Lowercase with underscores
            `${albumDir.toLowerCase().replace(/[^a-z0-9]/g, "_")}.json`, // Replace all non-alphanumeric
            `album.json`,
          ];

          let albumResponse = null;
          let albumData = null;

          for (const jsonFile of possibleJsonFiles) {
            try {
              albumResponse = await fetch(getAlbumsPath(`${albumDir}/${jsonFile}`));
              if (albumResponse.ok) {
                albumData = await albumResponse.json();
                console.log(`  ✅ Successfully loaded: ${jsonFile}`);
                break;
              }
            } catch (e) {
              continue;
            }
          }

          if (!albumData || !albumData.id) {
            console.warn(`No valid album JSON found in ${albumDir}`);
            continue;
          }

          // Handle different cover image formats
          let coverPath = albumData.cover;
          if (!coverPath.startsWith("/")) {
            // Try different common cover image formats
            // Try multiple cover image formats dynamically
            const coverFormats = [
              "cover.webp",
              "cover.jpg", 
              "cover.png",
              "front.jpg",
              "album.jpg",
            ];
            
            // Try to find the actual cover file that exists
            coverPath = await this.findCoverImage(albumDir, coverFormats) || getAlbumsPath(`${albumDir}/${coverFormats[1]}`);
          }

          const album = new Album(
            albumData.id,
            albumData.title,
            albumData.artist,
            coverPath
          );

          album.setMetadata({
            year: albumData.year,
            genre: albumData.genre,
            description: albumData.description,
            rating: albumData.rating,
            totalTracks: albumData.totalTracks,
            directory: albumDir,
          });

          if (Array.isArray(albumData.songs)) {
            albumData.songs.forEach((songData) => {
              const song = new Song(
                songData.id,
                songData.title,
                songData.artist,
                songData.duration,
                album.id
              );

              // Generate multiple possible file patterns for better compatibility
              const cleanTitle = songData.title.replace(/[<>:"/\\|?*]/g, "");
              const normalizedTitle = songData.title
                .replace(/[^a-zA-Z0-9\s]/g, "")
                .trim();
              const songIndex = String(songData.id).padStart(2, "0");

              // Store song metadata with explicit file path from JSON
              song.setMetadata({
                explicit: songData.explicit || false,
                filePath: songData.file ? getAlbumsPath(`${albumDir}/${songData.file}`) : null,
              });
              album.addSong(song);
            });
          }

          this.albums.push(album);
          this.emit("albumLoaded", album);
          console.log(`✅ Loaded album: ${album.title}`);
        } catch (albumError) {
          console.warn(`Error loading album ${albumDir}:`, albumError);
        }
      }

      console.log(`✅ Total albums loaded: ${this.albums.length}`);
      console.log(
        "📤 Emitting albumsLoaded event with albums:",
        this.albums.map((a) => a.title)
      );
      this.emit("albumsLoaded", this.albums);
    } catch (error) {
      console.error("❌ Error loading local albums:", error);
      console.error("Error details:", error.stack);
      this.emit("error", { type: "albumLoading", message: error.message });
      // Ensure something is emitted even on error
      this.emit("albumsLoaded", []);
    }
  }

  async loadAlbumsFromLocalStorage() {
    return await this.loadLocalAlbums();
  }

  setTheme(theme) {
    this.theme = theme;
    this.emit("themeChanged", { newTheme: theme });
  }

  loadFavorites() {
    try {
      const saved = localStorage.getItem('ijam-favorites');
      if (saved) {
        this.favorites = new Set(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favorites = new Set();
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem('ijam-favorites', JSON.stringify([...this.favorites]));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  addToFavorites(songId) {
    this.favorites.add(songId);
    this.saveFavorites();
    this.emit('favoritesChanged', { songId, action: 'add' });
  }

  removeFromFavorites(songId) {
    this.favorites.delete(songId);
    this.saveFavorites();
    this.emit('favoritesChanged', { songId, action: 'remove' });
  }

  isFavorite(songId) {
    return this.favorites.has(songId);
  }
}

// ===== 3. AUDIO PLAYER MANAGER =====

class AudioPlayerManager {
  constructor() {
    this.audioPlayer = document.getElementById("audioPlayer");
    this.playerBar = document.getElementById("playerBar");
    this.currentSong = null;
    this.isPlaying = false;
    this.isShuffle = false;
    this.repeatMode = "none";
    this.volume = 0.7;
    this.currentTime = 0;
    this.duration = 0;
    this.isDraggingSeek = false;
    
    // Queue management
    this.queue = [];
    this.currentQueueIndex = -1;
    this.shuffleMode = false;
    this.originalQueue = [];
    
    // Session persistence
    this.sessionKey = 'ijam_session';
    this.sessionTimeout = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

    this.init();
    this.setupTabVisibilityHandling();
    this.restoreSession();
  }

  init() {
    if (!this.audioPlayer) return;

    this.audioPlayer.volume = this.volume;

    this.audioPlayer.addEventListener("loadedmetadata", () => {
      this.duration = this.audioPlayer.duration;
      this.updateTimeDisplay();
    });

    this.audioPlayer.addEventListener("timeupdate", () => {
      this.currentTime = this.audioPlayer.currentTime;
      this.updateProgress();
      this.updateTimeDisplay();
      
      // Save session every 10 seconds during playback
      if (this.currentTime % 10 < 1) {
        this.saveSession();
      }
    });

    this.audioPlayer.addEventListener("ended", () => {
      this.handleTrackEnd();
    });

    this.audioPlayer.addEventListener("play", () => {
      this.isPlaying = true;
      this.updatePlayButton();
    });

    this.audioPlayer.addEventListener("pause", () => {
      this.isPlaying = false;
      this.updatePlayButton();
    });

    // Add seekbar drag functionality
    this.setupSeekbarDrag();
  }

  setupSeekbarDrag() {
    const progressBar = document.getElementById("progressBar");
    const progressHandle = document.getElementById("progressHandle");
    
    if (!progressBar || !progressHandle) return;

    let isDragging = false;

    const handleMouseDown = (e) => {
      isDragging = true;
      this.isDraggingSeek = true;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      e.preventDefault();
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const rect = progressBar.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = percentage * this.duration;
      
      // Update visual position immediately while dragging
      const progressFill = document.getElementById("progressFill");
      if (progressFill) {
        progressFill.style.width = `${percentage * 100}%`;
      }
      progressHandle.style.left = `${percentage * 100}%`;
      
      // Update time display
      const currentTimeEl = document.getElementById("currentTime");
      if (currentTimeEl) {
        currentTimeEl.textContent = this.formatTime(newTime);
      }
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;
      
      isDragging = false;
      this.isDraggingSeek = false;
      
      const rect = progressBar.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = percentage * this.duration;
      
      // Actually seek the audio
      this.audioPlayer.currentTime = newTime;
      
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    // Add event listeners
    progressBar.addEventListener("mousedown", handleMouseDown);
    progressHandle.addEventListener("mousedown", handleMouseDown);
  }

  async loadSong(song, albumCover) {
    console.log('🎵 Loading song:', song.title);
    this.currentSong = song;
    this.currentSong.albumCover = albumCover; // Store album cover with song
    const filePath = await this.getAudioFilePath(song);
    console.log('🎵 File path:', filePath);

    if (filePath) {
      // Reset audio element and wait for it to be ready
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
      this.audioPlayer.src = filePath;
      console.log('🎵 Audio src set to:', this.audioPlayer.src);
      
      // Wait for audio to load
      await new Promise((resolve) => {
        const onCanPlay = () => {
          this.audioPlayer.removeEventListener('canplay', onCanPlay);
          this.audioPlayer.removeEventListener('error', onError);
          resolve();
        };
        const onError = () => {
          this.audioPlayer.removeEventListener('canplay', onCanPlay);
          this.audioPlayer.removeEventListener('error', onError);
          resolve(); // Still resolve to continue
        };
        this.audioPlayer.addEventListener('canplay', onCanPlay);
        this.audioPlayer.addEventListener('error', onError);
        this.audioPlayer.load();
      });
      
      this.updatePlayerInfo(song, albumCover);
      this.showPlayerBar();
      this.updateQueueDisplay(); // Use new queue display instead of sidebar queue
      this.updateLikeButton(song);
      this.saveSession(); // Save session when song loads
    } else {
      console.error('❌ No file path found for song:', song.title);
      window.showNotification(`Could not find audio file for ${song.title}`, 'error');
    }
  }

  updateSidebarQueue(song, albumCover) {
    const queueList = document.getElementById('queue-list');
    if (!queueList) return;

    queueList.innerHTML = `
      <li class="queue-item active">
        <img src="${albumCover || '/default-cover.jpg'}" alt="${song.title}" class="queue-item-cover">
        <div class="queue-item-info">
          <div class="queue-item-title">${song.title}</div>
          <div class="queue-item-artist">${song.artist}</div>
        </div>
        <button class="queue-item-remove" onclick="window.removeFromQueue(0)">
          <i class="fas fa-times"></i>
        </button>
      </li>
    `;
  }

  updateLikeButton(song) {
    const likeBtn = document.getElementById('likeBtn');
    if (!likeBtn || !song) return;

    const isFavorite = window.appState.isFavorite(song.id);
    const icon = likeBtn.querySelector('i');
    
    if (isFavorite) {
      likeBtn.classList.add('active');
      icon.className = 'fas fa-heart';
      likeBtn.title = 'Remove from Favorites';
    } else {
      likeBtn.classList.remove('active');
      icon.className = 'far fa-heart';
      likeBtn.title = 'Add to Favorites';
    }
  }

  async getAudioFilePath(song) {
    // First check if it's a local file upload
    if (song.localFile) {
      return song.fileUrl;
    }

    // Check for explicit file path from JSON metadata
    if (song.filePath) {
      console.log('🎵 Using explicit file path:', song.filePath);
      return song.filePath;
    }

    // Check album song metadata for explicit file path
    if (window.appState && window.appState.albums) {
      const album = window.appState.albums.find(a => a.id === song.albumId);
      if (album && album.directory) {
        const albumSong = album.songs.find(s => s.id === song.id);
        if (albumSong && albumSong.filePath) {
          console.log('🎵 Using album song file path:', albumSong.filePath);
          return albumSong.filePath;
        }

        // Fallback: Generate dynamic file paths using pattern matching
        console.log('🎵 No explicit path found, using dynamic discovery for:', song.title);
        return this.findAudioFile(album.directory, song);
      }
    }

    console.warn('Could not determine audio file path for song:', song);
    return null;
  }

  async findAudioFile(albumDirectory, song) {
    const cleanTitle = song.title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const paddedId = String(song.id).padStart(2, '0');
    const normalizedTitle = song.title.replace(/[^\w\s]/g, '').trim();
    
    // Create variations of the song title to handle different naming patterns
    const titleVariations = [
      song.title,
      cleanTitle,
      normalizedTitle,
      // Handle common variations
      `${cleanTitle} (Film Version)`,
      `${song.title} (Film Version)`,
      `${cleanTitle} - ${albumDirectory}`,
      `${song.title} - ${albumDirectory}`
    ];
    
    // HTML5 Audio supported formats (prioritized by browser support)
    const audioFormats = [
      'mp3',    // Universal support
      'wav',    // Universal support  
      'm4a',    // MP4 audio - widely supported
      'aac',    // Advanced Audio Codec - widely supported
      'ogg',    // Ogg Vorbis - good support (Firefox, Chrome)
      'oga',    // Ogg audio alternative extension
      'webm',   // WebM audio - modern browsers
      'opus',   // Opus codec - high quality, good support
      'flac',   // FLAC - limited support but growing
      'weba'    // WebM audio alternative extension
    ];
    
    // Quality suffixes commonly used
    const qualitySuffixes = [
      '',
      ' - 320Kbps-(Mr-Jat.in)',
      ' - 320kbps',
      ' - 128kbps',
      ' - HQ',
      ` - ${albumDirectory} - 320Kbps-(Mr-Jat.in)`,
      ' (Film Version) - 320Kbps-(Mr-Jat.in)'
    ];
    
    // Base naming patterns (without extensions and quality suffixes)
    const basePatterns = [];
    
    // Generate patterns for each title variation
    for (const titleVar of titleVariations) {
      for (const suffix of qualitySuffixes) {
        // Pattern 1: "01 - Song Title"
        basePatterns.push(`${paddedId} - ${titleVar}${suffix}`);
        
        // Pattern 2: "1. Song Title"
        basePatterns.push(`${song.id}. ${titleVar}${suffix}`);
        
        // Pattern 3: "Song Title"
        basePatterns.push(`${titleVar}${suffix}`);
        
        // Pattern 4: "Track 01"
        if (suffix === '') {
          basePatterns.push(`Track ${paddedId}`);
          basePatterns.push(`${paddedId}`);
          basePatterns.push(`${song.id}`);
        }
        
        // Pattern 5: Alternative separators
        basePatterns.push(`${paddedId}_${titleVar}${suffix}`);
        basePatterns.push(`${paddedId}.${titleVar}${suffix}`);
        basePatterns.push(`${song.id}_${titleVar}${suffix}`);
      }
    }
    
    // Generate all combinations of patterns and formats
    const patterns = [];
    for (const basePattern of basePatterns) {
      for (const format of audioFormats) {
        patterns.push(`${basePattern}.${format}`);
      }
    }
    
    // Try each pattern by attempting to fetch the file
    for (const pattern of patterns) {
      const filePath = getAlbumsPath(`${albumDirectory}/${pattern}`);
      try {
        const response = await fetch(filePath, { method: 'HEAD' });
        if (response.ok) {
          console.log('🎵 Found audio file:', filePath);
          return filePath;
        }
      } catch (error) {
        // File doesn't exist, continue to next pattern
      }
    }
    
    // If no file found, return the most likely pattern as fallback
    const fallbackPath = getAlbumsPath(`${albumDirectory}/${paddedId} - ${song.title}.mp3`);
    console.warn('🎵 No audio file found, using fallback:', fallbackPath);
    return fallbackPath;
  }

  async findCoverImage(albumDirectory, formats) {
    for (const format of formats) {
      const imagePath = getAlbumsPath(`${albumDirectory}/${format}`);
      try {
        const response = await fetch(imagePath, { method: 'HEAD' });
        if (response.ok) {
          console.log('🖼️ Found cover image:', imagePath);
          return imagePath;
        }
      } catch (error) {
        // Image doesn't exist, continue to next format
      }
    }
    return null;
  }

  updatePlayerInfo(song, albumCover) {
    document.getElementById("playerTrackTitle").textContent = song.title;
    document.getElementById("playerTrackArtist").textContent = song.artist;

    const albumArt = document.getElementById("playerAlbumArt");
    albumArt.src = albumCover || getAlbumsPath("default-cover.jpg");
    albumArt.alt = `${song.title} - ${song.artist}`;
  }

  showPlayerBar() {
    this.playerBar.classList.add("active");
  }

  hidePlayerBar() {
    this.playerBar.classList.remove("active");
  }

  play() {
    console.log('▶️ Attempting to play:', this.audioPlayer.src);
    if (this.audioPlayer.src) {
      this.audioPlayer
        .play()
        .then(() => {
          console.log('✅ Playback started successfully');
        })
        .catch((e) => {
          console.error("❌ Playback failed:", e);
          window.showNotification('Playback failed: ' + e.message, 'error');
        });
    } else {
      console.error('❌ No audio source set');
      window.showNotification('No audio file loaded', 'error');
    }
  }

  pause() {
    this.audioPlayer.pause();
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  updatePlayButton() {
    const playBtn = document.getElementById("playPauseBtn");
    if (playBtn) {
      const icon = playBtn.querySelector("i");
      icon.className = this.isPlaying ? "fas fa-pause" : "fas fa-play";
    }
  }

  updateProgress() {
    // Don't update progress bar while user is dragging
    if (this.isDraggingSeek) return;
    
    if (this.duration > 0) {
      const progress = (this.currentTime / this.duration) * 100;
      const progressFill = document.getElementById("progressFill");
      const progressHandle = document.getElementById("progressHandle");

      if (progressFill) progressFill.style.width = `${progress}%`;
      if (progressHandle) progressHandle.style.left = `${progress}%`;
    }
  }

  updateTimeDisplay() {
    const currentTimeEl = document.getElementById("currentTime");
    const totalTimeEl = document.getElementById("totalTime");

    if (currentTimeEl)
      currentTimeEl.textContent = this.formatTime(this.currentTime);
    if (totalTimeEl) totalTimeEl.textContent = this.formatTime(this.duration);
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  seekTo(event) {
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
      const rect = progressBar.getBoundingClientRect();
      const percentage = (event.clientX - rect.left) / rect.width;
      const newTime = percentage * this.duration;
      this.audioPlayer.currentTime = newTime;
    }
  }

  setVolume(volume) {
    this.volume = volume / 100;
    this.audioPlayer.volume = this.volume;
    this.updateVolumeIcon();
    this.updateVolumeDisplay(volume);
  }

  updateVolumeDisplay(volume) {
    const volumeDisplay = document.getElementById("volumeDisplay");
    if (volumeDisplay) {
      volumeDisplay.textContent = Math.round(volume);
    }
  }

  updateVolumeIcon() {
    const volumeBtn = document.getElementById("volumeBtn");
    if (volumeBtn) {
      const icon = volumeBtn.querySelector("i");

      if (this.volume === 0) {
        icon.className = "fas fa-volume-mute";
      } else if (this.volume < 0.5) {
        icon.className = "fas fa-volume-down";
      } else {
        icon.className = "fas fa-volume-up";
      }
    }
  }

  toggleMute() {
    if (this.volume > 0) {
      this.previousVolume = this.volume;
      this.setVolume(0);
      const slider = document.getElementById("volumeSlider");
      if (slider) slider.value = 0;
      this.updateVolumeDisplay(0);
    } else {
      const restoreVolume = (this.previousVolume || 0.7) * 100;
      this.setVolume(restoreVolume);
      const slider = document.getElementById("volumeSlider");
      if (slider) slider.value = restoreVolume;
      this.updateVolumeDisplay(restoreVolume);
    }
  }

  handleTrackEnd() {
    if (this.repeatMode === "one") {
      this.audioPlayer.currentTime = 0;
      this.play();
    } else if (this.repeatMode === "all") {
      this.nextTrack();
    } else {
      this.nextTrack();
    }
  }

  async nextTrack() {
    console.log('🎵 Next track called. Queue length:', this.queue.length, 'Current index:', this.currentQueueIndex);
    
    if (this.currentQueueIndex < this.queue.length - 1) {
      this.currentQueueIndex++;
      const nextSong = this.queue[this.currentQueueIndex];
      console.log('🎵 Playing next song:', nextSong.song.title);
      await this.loadSong(nextSong.song, nextSong.albumCover);
      this.play();
      this.updateQueueDisplay();
      this.saveSession();
    } else if (this.repeatMode === "all" && this.queue.length > 0) {
      this.currentQueueIndex = 0;
      const nextSong = this.queue[this.currentQueueIndex];
      console.log('🎵 Repeating to first song:', nextSong.song.title);
      await this.loadSong(nextSong.song, nextSong.albumCover);
      this.play();
      this.updateQueueDisplay();
      this.saveSession();
    } else {
      console.log('🎵 No next track available');
      window.showNotification('No more songs in queue', 'info');
    }
  }

  async previousTrack() {
    console.log('🎵 Previous track called. Queue length:', this.queue.length, 'Current index:', this.currentQueueIndex);
    
    if (this.currentQueueIndex > 0) {
      this.currentQueueIndex--;
      const prevSong = this.queue[this.currentQueueIndex];
      console.log('🎵 Playing previous song:', prevSong.song.title);
      await this.loadSong(prevSong.song, prevSong.albumCover);
      this.play();
      this.updateQueueDisplay();
      this.saveSession();
    } else if (this.repeatMode === "all" && this.queue.length > 0) {
      this.currentQueueIndex = this.queue.length - 1;
      const prevSong = this.queue[this.currentQueueIndex];
      console.log('🎵 Repeating to last song:', prevSong.song.title);
      await this.loadSong(prevSong.song, prevSong.albumCover);
      this.play();
      this.updateQueueDisplay();
      this.saveSession();
    } else {
      console.log('🎵 No previous track available');
      window.showNotification('Already at first song', 'info');
    }
  }

  // Queue Management
  addToQueue(song, albumCover) {
    const queueItem = { song, albumCover };
    this.queue.push(queueItem);
    this.saveSession();
  }

  clearQueue(showNotification = true) {
    this.queue = [];
    this.currentQueueIndex = -1;
    this.originalQueue = [];
    this.updateQueueDisplay();
    this.saveSession();
    if (showNotification) {
      window.showNotification('Queue cleared', 'success');
    }
  }

  shuffleQueue() {
    if (this.queue.length <= 1) return;
    
    this.shuffleMode = !this.shuffleMode;
    
    if (this.shuffleMode) {
      // Save original order
      this.originalQueue = [...this.queue];
      
      // Shuffle the queue (keep current song at current position)
      const currentSong = this.queue[this.currentQueueIndex];
      const otherSongs = this.queue.filter((_, index) => index !== this.currentQueueIndex);
      
      // Fisher-Yates shuffle
      for (let i = otherSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
      }
      
      // Rebuild queue with current song first, then shuffled songs
      this.queue = [currentSong, ...otherSongs];
      this.currentQueueIndex = 0;
      
      window.showNotification('Shuffle enabled', 'success');
    } else {
      // Restore original order
      this.queue = [...this.originalQueue];
      this.currentQueueIndex = this.queue.findIndex(item => 
        item.song.id === this.currentSong?.id
      );
      window.showNotification('Shuffle disabled', 'success');
    }
    
    this.updateQueueDisplay();
    this.updateShuffleButton();
    this.saveSession();
  }

  updateQueueDisplay() {
    const queueList = document.getElementById('queue-list');
    if (!queueList) {
      console.warn('🎵 Queue list element not found');
      return;
    }

    console.log('🎵 Updating queue display. Queue length:', this.queue.length, 'Current index:', this.currentQueueIndex);

    if (this.queue.length === 0) {
      queueList.innerHTML = '<li class="empty-queue">Queue is empty</li>';
      return;
    }

    queueList.innerHTML = this.queue.map((item, index) => `
      <li class="queue-item ${index === this.currentQueueIndex ? 'active' : ''}" data-index="${index}" onclick="window.audioPlayerManager.playFromQueue(${index})">
        <img src="${item.albumCover || '/default-cover.jpg'}" alt="${item.song.title}" class="queue-item-cover">
        <div class="queue-item-info">
          <div class="queue-item-title">${item.song.title}</div>
          <div class="queue-item-artist">${item.song.artist}</div>
        </div>
        <button class="queue-item-remove" onclick="event.stopPropagation(); window.audioPlayerManager.removeFromQueue(${index})">
          <i class="fas fa-times"></i>
        </button>
      </li>
    `).join('');
    
    console.log('🎵 Queue display updated with', this.queue.length, 'songs');
  }

  async playFromQueue(index) {
    if (index < 0 || index >= this.queue.length) return;
    
    console.log('🎵 Playing from queue at index:', index);
    this.currentQueueIndex = index;
    const queueItem = this.queue[index];
    
    await this.loadSong(queueItem.song, queueItem.albumCover);
    this.play();
    this.updateQueueDisplay();
    this.saveSession();
  }

  removeFromQueue(index) {
    if (index < 0 || index >= this.queue.length) return;
    
    // Adjust current index if necessary
    if (index < this.currentQueueIndex) {
      this.currentQueueIndex--;
    } else if (index === this.currentQueueIndex) {
      // If removing current song, don't adjust index (next song will move up)
      if (this.currentQueueIndex >= this.queue.length - 1) {
        this.currentQueueIndex = this.queue.length - 2; // Move to previous song
      }
    }
    
    this.queue.splice(index, 1);
    this.updateQueueDisplay();
    this.saveSession();
  }

  updateShuffleButton() {
    const shuffleBtn = document.querySelector('.shuffle-btn');
    if (shuffleBtn) {
      shuffleBtn.classList.toggle('active', this.shuffleMode);
    }
  }

  // Session Persistence
  saveSession() {
    const sessionData = {
      currentSong: this.currentSong,
      currentTime: this.audioPlayer.currentTime,
      queue: this.queue,
      currentQueueIndex: this.currentQueueIndex,
      shuffleMode: this.shuffleMode,
      originalQueue: this.originalQueue,
      volume: this.volume,
      timestamp: Date.now()
    };
    
    localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
  }

  restoreSession() {
    try {
      const savedSession = localStorage.getItem(this.sessionKey);
      if (!savedSession) return;

      const sessionData = JSON.parse(savedSession);
      const timeDiff = Date.now() - sessionData.timestamp;
      
      // Only restore if session is less than 3 hours old
      if (timeDiff > this.sessionTimeout) {
        localStorage.removeItem(this.sessionKey);
        return;
      }

      // Restore session data
      if (sessionData.currentSong) {
        this.currentSong = sessionData.currentSong;
        this.queue = sessionData.queue || [];
        this.currentQueueIndex = sessionData.currentQueueIndex || -1;
        this.shuffleMode = sessionData.shuffleMode || false;
        this.originalQueue = sessionData.originalQueue || [];
        this.volume = sessionData.volume || 0.7;
        
        // Restore audio player
        this.audioPlayer.volume = this.volume;
        if (sessionData.currentSong.filePath || sessionData.currentSong.localFile) {
          this.loadSong(sessionData.currentSong, sessionData.currentSong.albumCover);
          this.audioPlayer.currentTime = sessionData.currentTime || 0;
        }
        
        this.updateQueueDisplay();
        this.updateShuffleButton();
        
        console.log('🔄 Session restored:', sessionData.currentSong.title);
        window.showNotification(`Restored: ${sessionData.currentSong.title}`, 'success');
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      localStorage.removeItem(this.sessionKey);
    }
  }

  // Tab Visibility and Lifecycle Management
  setupTabVisibilityHandling() {
    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab became hidden - save current state
        this.saveSession();
      } else {
        // Tab became visible - could restore or continue playing
        if (this.currentSong && !this.isPlaying) {
          console.log('Tab became visible, ready to resume');
        }
      }
    });

    // Handle page unload/close
    window.addEventListener('beforeunload', (e) => {
      this.saveSession();
      
      // If music is playing, show warning
      if (this.isPlaying) {
        const message = 'Music is currently playing. Are you sure you want to leave?';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    });

    // Handle page focus/blur for additional control
    window.addEventListener('focus', () => {
      console.log('Window gained focus');
    });

    window.addEventListener('blur', () => {
      console.log('Window lost focus - saving session');
      this.saveSession();
    });
  }
}

// ===== 4. AUTHENTICATION MANAGER =====

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    const savedUser = loadFromStorage(STORAGE_KEYS.USER_SESSION);
    if (savedUser) {
      this.currentUser = savedUser;
      this.updateUIForLoggedInUser();
    }

    this.setupFormListeners();
  }

  setupFormListeners() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    if (signupForm) {
      signupForm.addEventListener("submit", (e) => this.handleSignup(e));
    }
  }

  async handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const userData = await this.simulateLogin(email, password);

      this.currentUser = userData;
      saveToStorage(STORAGE_KEYS.USER_SESSION, userData);

      this.updateUIForLoggedInUser();
      window.closeAuthModal();
      window.showNotification("Welcome back!", "success");
    } catch (error) {
      window.showNotification("Login failed. Please try again.", "error");
      console.error("Login error:", error);
    }
  }

  async handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      window.showNotification("Passwords do not match", "error");
      return;
    }

    try {
      const userData = await this.simulateSignup(name, email, password);

      this.currentUser = userData;
      saveToStorage(STORAGE_KEYS.USER_SESSION, userData);

      this.updateUIForLoggedInUser();
      window.closeAuthModal();
      window.showNotification("Account created successfully!", "success");
    } catch (error) {
      window.showNotification("Signup failed. Please try again.", "error");
      console.error("Signup error:", error);
    }
  }

  async simulateLogin(email, password) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      id: Date.now(),
      name: email.split("@")[0],
      email: email,
      avatar: null,
      createdAt: new Date().toISOString(),
    };
  }

  async simulateSignup(name, email, password) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      id: Date.now(),
      name: name,
      email: email,
      avatar: null,
      createdAt: new Date().toISOString(),
    };
  }

  updateUIForLoggedInUser() {
    const regElement = document.querySelector(".reg");
    if (regElement && this.currentUser) {
      regElement.innerHTML = `
        <div class="user-profile" onclick="toggleUserMenu()">
          <i class="fas fa-user-circle"></i>
          <span>${this.currentUser.name}</span>
          <div class="user-menu" id="userMenu">
            <a href="#" onclick="showProfile()">Profile</a>
            <a href="#" onclick="showSettings()">Settings</a>
            <a href="#" onclick="window.authManager.logout()">Logout</a>
          </div>
        </div>
      `;
    }
  }

  logout() {
    this.currentUser = null;
    removeFromStorage(STORAGE_KEYS.USER_SESSION);

    const regElement = document.querySelector(".reg");
    if (regElement) {
      regElement.innerHTML = `
        <span onclick="window.openLoginModal()"><i class="fa fa-user"></i> Log in</span>
        <span onclick="window.openSignupModal()"><i class="fa fa-user-plus"></i> Sign up</span>
      `;
    }

    window.showNotification("Logged out successfully", "info");
  }
}

// ===== 5. FILE UPLOAD MANAGER =====

class FileUploadManager {
  constructor() {
    this.uploadedSongs = loadFromStorage(STORAGE_KEYS.UPLOADED_TRACKS) || [];
    this.init();
  }

  init() {
    const uploadArea = document.getElementById("uploadArea");
    const fileInput = document.getElementById("fileInput");

    if (uploadArea) {
      uploadArea.addEventListener("dragover", (e) => this.handleDragOver(e));
      uploadArea.addEventListener("dragleave", (e) => this.handleDragLeave(e));
      uploadArea.addEventListener("drop", (e) => this.handleDrop(e));
    }

    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
    }
  }

  handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add("dragover");
  }

  handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove("dragover");
  }

  handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove("dragover");

    const files = Array.from(event.dataTransfer.files);
    this.processFiles(files);
  }

  handleFileSelect(event) {
    const files = Array.from(event.target.files);
    this.processFiles(files);
  }

  async processFiles(files) {
    const audioFiles = files.filter(
      (file) =>
        file.type.startsWith("audio/") ||
        [".mp3", ".wav", ".ogg"].some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        )
    );

    if (audioFiles.length === 0) {
      window.showNotification("No valid audio files selected", "error");
      return;
    }

    this.showUploadProgress();

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      try {
        await this.processAudioFile(file, i + 1, audioFiles.length);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        window.showNotification(`Failed to process ${file.name}`, "error");
      }
    }

    this.hideUploadProgress();
    window.closeUploadModal();
    window.showNotification(
      `Successfully uploaded ${audioFiles.length} songs!`,
      "success"
    );
  }

  async processAudioFile(file, index, total) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const audioUrl = e.target.result;
        const metadata = this.extractMetadata(file);

        const song = new Song(
          Date.now() + index,
          metadata.title,
          metadata.artist,
          metadata.duration,
          "local-uploads"
        );

        song.localFile = true;
        song.fileUrl = audioUrl;
        song.fileName = file.name;
        song.fileSize = file.size;

        this.uploadedSongs.push(song);
        this.updateProgress(index, total);

        resolve(song);
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  extractMetadata(file) {
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    const parts = fileName.split(" - ");

    if (parts.length >= 2) {
      return {
        artist: parts[0].trim(),
        title: parts.slice(1).join(" - ").trim(),
        duration: "Unknown",
      };
    } else {
      return {
        artist: "Unknown Artist",
        title: fileName.trim(),
        duration: "Unknown",
      };
    }
  }

  showUploadProgress() {
    const uploadProgress = document.getElementById("uploadProgress");
    if (uploadProgress) {
      uploadProgress.style.display = "block";
    }
  }

  hideUploadProgress() {
    const uploadProgress = document.getElementById("uploadProgress");
    if (uploadProgress) {
      uploadProgress.style.display = "none";
    }
  }

  updateProgress(current, total) {
    const progress = (current / total) * 100;
    const progressFill = document.getElementById("uploadProgressFill");
    const progressText = document.getElementById("uploadProgressText");

    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }

    if (progressText) {
      progressText.textContent = `Uploading ${current}/${total} files...`;
    }
  }

  saveUploadedSongs() {
    saveToStorage(STORAGE_KEYS.UPLOADED_TRACKS, this.uploadedSongs);
  }
}

// ===== 6. STORAGE UTILITIES =====

const STORAGE_KEYS = {
  MAIN_DATA: "iJamMusicPlayer",
  ALBUMS: "iJamAlbums",
  USER_SESSION: "iJamUserSession",
  UPLOADED_TRACKS: "iJamUploadedTracks",
};

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to storage:", error);
  }
}

function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load from storage:", error);
    return null;
  }
}

function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to remove from storage:", error);
  }
}

// ===== 7. GLOBAL FUNCTIONS (For HTML onclick attributes) =====

// Show notification function
window.showNotification = function (message, type = "info") {
  try {
    console.log(`Notification: ${message} (${type})`);

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.setAttribute("role", "alert");
    notification.setAttribute("aria-live", "assertive");

    const colors = {
      success: "#4CAF50",
      info: "#2196F3",
      error: "#f44336",
      warning: "#ff9800",
    };

    const icons = {
      success: "fas fa-check-circle",
      info: "fas fa-info-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
    };

    notification.innerHTML = `
        <i class="${icons[type] || "fas fa-music"}" aria-hidden="true"></i>
        <span>${message}</span>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 25px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 10);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  } catch (error) {
    console.error("Error showing notification:", error);
  }
};

// Modal functions
window.openLoginModal = function () {
  console.log("Opening login modal...");
  const modal = document.getElementById("authModalOverlay");
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");

  if (modal && loginModal && signupModal) {
    signupModal.style.display = "none";
    loginModal.style.display = "block";
    modal.classList.add("active");
    console.log("Login modal opened successfully");
  } else {
    console.error("Modal elements not found:", {
      modal,
      loginModal,
      signupModal,
    });
  }
};

window.openSignupModal = function () {
  console.log("Opening signup modal...");
  const modal = document.getElementById("authModalOverlay");
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");

  if (modal && loginModal && signupModal) {
    loginModal.style.display = "none";
    signupModal.style.display = "block";
    modal.classList.add("active");
    console.log("Signup modal opened successfully");
  } else {
    console.error("Modal elements not found:", {
      modal,
      loginModal,
      signupModal,
    });
  }
};

window.closeAuthModal = function () {
  const modal = document.getElementById("authModalOverlay");
  if (modal) {
    modal.classList.remove("active");
    console.log("Auth modal closed");
  }
};

window.switchToLogin = function () {
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");

  if (loginModal && signupModal) {
    signupModal.style.display = "none";
    loginModal.style.display = "block";
  }
};

window.switchToSignup = function () {
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");

  if (loginModal && signupModal) {
    loginModal.style.display = "none";
    signupModal.style.display = "block";
  }
};

// Upload modal functions
window.openUploadModal = function () {
  console.log("Opening upload modal...");
  const modal = document.getElementById("uploadModalOverlay");
  if (modal) {
    modal.classList.add("active");
    console.log("Upload modal opened successfully");
  } else {
    console.error("Upload modal not found");
  }
};

window.closeUploadModal = function () {
  const modal = document.getElementById("uploadModalOverlay");
  if (modal) {
    modal.classList.remove("active");
  }
};

// Theme toggle function
window.toggleTheme = function () {
  try {
    console.log("Toggling theme...");
    const themeSwitch = document.querySelector(".theme-switch");
    const isDark = document.body.classList.contains("dark-theme");

    if (isDark) {
      document.body.classList.remove("dark-theme");
      if (themeSwitch) themeSwitch.classList.remove("active");
      if (window.appState && window.appState.setTheme) {
        window.appState.setTheme("light");
      }
      console.log("Switched to light theme");
      window.showNotification("Switched to light theme", "info");
    } else {
      document.body.classList.add("dark-theme");
      if (themeSwitch) themeSwitch.classList.add("active");
      if (window.appState && window.appState.setTheme) {
        window.appState.setTheme("dark");
      }
      console.log("Switched to dark theme");
      window.showNotification("Switched to dark theme", "info");
    }

    document.body.style.display = "none";
    document.body.offsetHeight;
    document.body.style.display = "";
  } catch (error) {
    console.error("Error toggling theme:", error);
    window.showNotification("Theme toggle failed", "error");
  }
};

// Sidebar functions
window.toggleSidebar = function () {
  console.log("Toggling sidebar...");
  try {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");

    if (sidebar && mainContent) {
      sidebar.classList.toggle("open");
      mainContent.classList.toggle("sidebar-open");
      console.log("Sidebar toggled");
    }
  } catch (error) {
    console.error("Error toggling sidebar:", error);
  }
};

window.closeSidebar = function () {
  try {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");

    if (sidebar && mainContent) {
      sidebar.classList.remove("open");
      mainContent.classList.remove("sidebar-open");
    }
  } catch (error) {
    console.error("Error closing sidebar:", error);
  }
};

// Navigation functions
window.navigateToHome = function () {
  const homePage = document.getElementById("home-page");
  const albumPage = document.getElementById("album-page");

  if (homePage && albumPage) {
    albumPage.classList.remove("active");
    homePage.classList.add("active");
  }
};

// Navigation to album
window.navigateToAlbum = function (albumId) {
  try {
    const album = window.appState.albums.find((a) => a.id == albumId);
    if (!album) {
      throw new Error("Album not found");
    }

    document.getElementById("home-page").classList.remove("active");

    let albumPage = document.getElementById("album-page");
    if (!albumPage) {
      albumPage = document.createElement("section");
      albumPage.id = "album-page";
      albumPage.className = "page";
      document.getElementById("main-content").appendChild(albumPage);
    }

    albumPage.innerHTML = `
      <div class="album-nav">
        <button class="back-btn" onclick="window.navigateToHome()">
          <i class="fas fa-arrow-left"></i> Back to Home
        </button>
      </div>
      
      <div class="album-header">
        <img src="${album.coverUrl || album.cover}" alt="${
      album.title
    }" class="album-cover" />
        <div class="album-info">
          <h1>${album.title}</h1>
          <h2>${album.artist}</h2>
          <p>${album.description || "No description available"}</p>
          <div class="album-meta">
            <span><i class="fas fa-calendar"></i> ${album.year}</span>
            <span><i class="fas fa-music"></i> ${album.genre}</span>
            <span><i class="fas fa-list"></i> ${album.totalTracks} tracks</span>
            ${
              album.rating
                ? `<span><i class="fas fa-star"></i> ${album.rating}/5</span>`
                : ""
            }
          </div>
          <div class="album-actions">
            <button class="play-album-btn" onclick="window.playFullAlbum('${
              album.id
            }')">
              <i class="fas fa-play"></i> Play Album
            </button>
            <button class="shuffle-album-btn" onclick="window.shuffleAlbum('${
              album.id
            }')">
              <i class="fas fa-random"></i> Shuffle
            </button>
          </div>
        </div>
      </div>
      <div class="song-list">
        ${album.songs
          .map(
            (song, index) => `
          <div class="song-item" data-song-id="${
            song.id
          }" onclick="window.playSongFromAlbum('${song.id}', '${album.id}')">
            <div class="song-info">
              <span class="song-number">${index + 1}</span>
              <span class="song-title">${song.title}</span>
              <span class="song-artist">${song.artist}</span>
            </div>
            <div class="song-actions">
              <span class="song-duration">${song.duration}</span>
              <button class="play-song-btn" onclick="event.stopPropagation(); window.playSongFromAlbum('${
                song.id
              }', '${album.id}')">
                <i class="fas fa-play"></i>
              </button>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    albumPage.classList.add("active");
    window.appState.currentAlbum = album;
  } catch (error) {
    console.error("Error navigating to album:", error);
    window.showNotification("Failed to load album", "error");
  }
};

// Playlist management
window.createNewPlaylist = function () {
  try {
    const modal = document.getElementById("playlistModalOverlay");
    if (modal) {
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("active"), 10);
      
      // Focus on the name input
      const nameInput = document.getElementById("playlistName");
      if (nameInput) {
        nameInput.focus();
      }
    }
  } catch (error) {
    console.error("Error opening playlist modal:", error);
  }
};

window.closePlaylistModal = function () {
  try {
    const modal = document.getElementById("playlistModalOverlay");
    if (modal) {
      modal.classList.remove("active");
      setTimeout(() => {
        modal.style.display = "none";
        // Clear form
        const form = document.getElementById("playlistForm");
        if (form) form.reset();
      }, 300);
    }
  } catch (error) {
    console.error("Error closing playlist modal:", error);
  }
};

window.selectPlaylist = function (playlistId) {
  try {
    console.log("Selected playlist:", playlistId);

    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      window.closeSidebar();
    }

    // Simulate different playlist content
    let playlistContent = [];
    let playlistTitle = "";

    switch (playlistId) {
      case "favorites":
        playlistTitle = "♥ Favorites";
        // Get user's actual favorite songs
        const actualFavorites = [];
        if (window.appState && window.appState.albums && window.appState.favorites) {
          window.appState.albums.forEach((album) => {
            album.songs.forEach((song) => {
              if (window.appState.isFavorite(song.id)) {
                actualFavorites.push({ song, album });
              }
            });
          });
        }
        
        // Show empty state if no favorites, but keep actual count
        if (actualFavorites.length === 0) {
          playlistContent = [{
            song: { 
              id: 'empty', 
              title: 'No favorites yet', 
              artist: 'Add songs to favorites by clicking the heart icon',
              duration: ''
            },
            album: { id: 'empty', title: '', coverUrl: '' }
          }];
          // Store actual count for display
          playlistContent.actualCount = 0;
        } else {
          playlistContent = actualFavorites;
          playlistContent.actualCount = actualFavorites.length;
        }
        break;
      case "recently-played":
        playlistTitle = "🕒 Recently Played";
        // Get recent songs (simulate)
        if (window.appState && window.appState.albums) {
          window.appState.albums.forEach((album) => {
            album.songs.slice(0, 2).forEach((song) => {
              playlistContent.push({ song, album });
            });
          });
        }
        break;
      case "my-mix":
        playlistTitle = "🎲 My Mix";
        // Get random songs
        if (window.appState && window.appState.albums) {
          window.appState.albums.forEach((album) => {
            const randomSongs = album.songs
              .sort(() => 0.5 - Math.random())
              .slice(0, 3);
            randomSongs.forEach((song) => {
              playlistContent.push({ song, album });
            });
          });
        }
        break;
      default:
        playlistTitle = `📜 ${playlistId
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())}`;
        break;
    }

    // Display playlist
    displayPlaylistPage(playlistTitle, playlistContent);
    window.showNotification(`Viewing: ${playlistTitle}`, "info");
  } catch (error) {
    console.error("Error selecting playlist:", error);
    window.showNotification("Error loading playlist", "error");
  }
};

function displayPlaylistPage(title, songs) {
  // Hide home page
  document.getElementById("home-page").classList.remove("active");

  // Hide album page if open
  const albumPage = document.getElementById("album-page");
  if (albumPage) {
    albumPage.classList.remove("active");
  }

  // Create or update playlist page
  let playlistPage = document.getElementById("playlist-page");
  if (!playlistPage) {
    playlistPage = document.createElement("section");
    playlistPage.id = "playlist-page";
    playlistPage.className = "page";

    const mainContent = document.getElementById("main-content");
    const footer = document.getElementsByClassName("footer")[0];

    if (footer && mainContent.contains(footer)) {
      mainContent.insertBefore(playlistPage, footer);
    } else {
      mainContent.appendChild(playlistPage);
    }
  }

  playlistPage.innerHTML = `
    <div class="album-nav">
      <button class="back-btn" onclick="window.navigateToHome()">
        <i class="fas fa-arrow-left"></i> Back to Home
      </button>
    </div>
    
    <div class="playlist-header">
      <div class="playlist-info">
        <h1>${title}</h1>
        <p>${songs.actualCount !== undefined ? songs.actualCount : songs.length} songs</p>
        <div class="playlist-actions">
          <button class="play-album-btn" onclick="window.playPlaylist()">
            <i class="fas fa-play"></i> Play All
          </button>
          <button class="shuffle-album-btn" onclick="window.shufflePlaylist()">
            <i class="fas fa-random"></i> Shuffle
          </button>
        </div>
      </div>
    </div>
    
    <div class="song-list">
      ${songs
        .map(
          (item, index) => `
        <div class="song-item" 
             draggable="true" 
             data-song-id="${item.song.id}" 
             data-album-id="${item.album.id}"
             onclick="window.playSongFromAlbum('${item.song.id}', '${item.album.id}')"
             ondragstart="window.handleSongDragStart(event)"
             ondragend="window.handleSongDragEnd(event)">
          <div class="song-info">
            <span class="song-number">${index + 1}</span>
            <div>
              <div class="song-title">${item.song.title}</div>
              <div class="song-artist">${item.song.artist} • ${
            item.album.title
          }</div>
            </div>
          </div>
          <div class="song-actions">
            <span class="song-duration">${item.song.duration}</span>
            <button class="song-like-btn ${window.appState.isFavorite(item.song.id) ? 'active' : ''}" 
                    onclick="event.stopPropagation(); window.toggleSongFavorite('${item.song.id}')" 
                    title="Add to Favorites">
              <i class="${window.appState.isFavorite(item.song.id) ? 'fas' : 'far'} fa-heart"></i>
            </button>
            <button class="play-song-btn" onclick="event.stopPropagation(); window.playSongFromAlbum('${
              item.song.id
            }', '${item.album.id}')">
              <i class="fas fa-play"></i>
            </button>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  playlistPage.classList.add("active");
}

// Favorites management
window.toggleFavorite = function () {
  try {
    if (!window.audioPlayerManager.currentSong) {
      window.showNotification("No song playing", "error");
      return;
    }

    const song = window.audioPlayerManager.currentSong;
    const isFavorite = window.appState.isFavorite(song.id);

    if (isFavorite) {
      window.appState.removeFromFavorites(song.id);
      window.showNotification("Removed from favorites", "info");
    } else {
      window.appState.addToFavorites(song.id);
      window.showNotification("Added to favorites", "success");
    }

    // Update the like button immediately
    window.audioPlayerManager.updateLikeButton(song);
  } catch (error) {
    console.error("Error toggling favorite:", error);
    window.showNotification("Error updating favorites", "error");
  }
};

window.toggleSongFavorite = function (songId) {
  try {
    const isFavorite = window.appState.isFavorite(songId);

    if (isFavorite) {
      window.appState.removeFromFavorites(songId);
      window.showNotification("Removed from favorites", "info");
    } else {
      window.appState.addToFavorites(songId);
      window.showNotification("Added to favorites", "success");
    }

    // Update all like buttons for this song
    document.querySelectorAll(`[onclick*="${songId}"]`).forEach(btn => {
      if (btn.classList.contains('song-like-btn')) {
        const icon = btn.querySelector('i');
        if (window.appState.isFavorite(songId)) {
          btn.classList.add('active');
          icon.className = 'fas fa-heart';
          btn.title = 'Remove from Favorites';
        } else {
          btn.classList.remove('active');
          icon.className = 'far fa-heart';
          btn.title = 'Add to Favorites';
        }
      }
    });

    // Update playbar like button if this is the current song
    if (window.audioPlayerManager.currentSong && window.audioPlayerManager.currentSong.id === songId) {
      window.audioPlayerManager.updateLikeButton(window.audioPlayerManager.currentSong);
    }
  } catch (error) {
    console.error("Error toggling song favorite:", error);
    window.showNotification("Error updating favorites", "error");
  }
};

// Drag and drop functionality
window.handleSongDragStart = function (event) {
  try {
    const songId = event.target.dataset.songId;
    const albumId = event.target.dataset.albumId;
    
    if (songId && albumId) {
      event.dataTransfer.setData('text/plain', JSON.stringify({ songId, albumId }));
      event.target.classList.add('dragging');
      
      // Show drop zone
      const dropZone = document.getElementById('dropZone');
      if (dropZone) {
        dropZone.classList.add('active');
      }
    }
  } catch (error) {
    console.error("Error starting drag:", error);
  }
};

window.handleSongDragEnd = function (event) {
  try {
    event.target.classList.remove('dragging');
    
    // Hide drop zone
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
      dropZone.classList.remove('active', 'drag-over');
    }
  } catch (error) {
    console.error("Error ending drag:", error);
  }
};

// Language management
window.toggleLanguage = function () {
  try {
    const currentLang = localStorage.getItem('ijam-language') || 'en';
    const newLang = currentLang === 'en' ? 'es' : 'en';
    
    localStorage.setItem('ijam-language', newLang);
    
    const languageText = document.getElementById('languageText');
    if (languageText) {
      languageText.textContent = newLang === 'en' ? 'English' : 'Español';
    }
    
    window.showNotification(`Language changed to ${newLang === 'en' ? 'English' : 'Español'}`, "info");
    
    // In a real app, you would reload the UI with the new language
    console.log(`Language changed to: ${newLang}`);
  } catch (error) {
    console.error("Error toggling language:", error);
    window.showNotification("Error changing language", "error");
  }
};

// Initialize language on load
window.initializeLanguage = function () {
  try {
    const savedLang = localStorage.getItem('ijam-language') || 'en';
    const languageText = document.getElementById('languageText');
    if (languageText) {
      languageText.textContent = savedLang === 'en' ? 'English' : 'Español';
    }
  } catch (error) {
    console.error("Error initializing language:", error);
  }
};

// Queue management
window.clearQueue = function () {
  try {
    console.log("Queue cleared");
    window.showNotification("Queue cleared", "info");
  } catch (error) {
    console.error("Error clearing queue:", error);
  }
};

window.shuffleQueue = function () {
  try {
    console.log("Queue shuffled");
    window.showNotification("Queue shuffled", "info");
  } catch (error) {
    console.error("Error shuffling queue:", error);
  }
};

// Search functionality
window.toggleSearch = function () {
  try {
    const searchBar = document.querySelector(".search-bar");
    const searchInput = document.querySelector(".search-input");

    if (searchBar) {
      searchBar.classList.toggle("expanded");
      if (searchInput && searchBar.classList.contains("expanded")) {
        searchInput.focus();
      }
    }
  } catch (error) {
    console.error("Error toggling search:", error);
  }
};

// Player control functions
window.togglePlayback = function () {
  if (window.audioPlayerManager) {
    window.audioPlayerManager.togglePlayback();
  } else {
    console.warn("Audio player manager not initialized");
  }
};

window.nextTrack = function () {
  if (window.audioPlayerManager) {
    window.audioPlayerManager.nextTrack();
  }
};

window.previousTrack = function () {
  if (window.audioPlayerManager) {
    window.audioPlayerManager.previousTrack();
  }
};

window.updateVolume = function (value) {
  if (window.audioPlayerManager) {
    window.audioPlayerManager.setVolume(value);
  }
  
  // Sync both volume sliders and displays
  const volumeSlider1 = document.getElementById("volumeSlider");
  const volumeSlider2 = document.getElementById("volumeSlider2");
  const volumeDisplay2 = document.getElementById("volumeDisplay2");
  
  if (volumeSlider1) volumeSlider1.value = value;
  if (volumeSlider2) volumeSlider2.value = value;
  if (volumeDisplay2) volumeDisplay2.textContent = Math.round(value);
  
  // Update both volume button icons
  const volumeBtn = document.getElementById("volumeBtn");
  const volumeBtn2 = document.getElementById("volumeBtn2");
  
  [volumeBtn, volumeBtn2].forEach(btn => {
    if (btn) {
      const icon = btn.querySelector("i");
      if (icon) {
        if (value == 0) {
          icon.className = "fas fa-volume-mute";
        } else if (value < 50) {
          icon.className = "fas fa-volume-down";
        } else {
          icon.className = "fas fa-volume-up";
        }
      }
    }
  });
};

window.toggleMute = function () {
  if (window.audioPlayerManager) {
    window.audioPlayerManager.toggleMute();
  }
};

window.seekTo = function (event) {
  if (window.audioPlayerManager) {
    window.audioPlayerManager.seekTo(event);
  }
};

window.toggleShuffle = function () {
  if (window.audioPlayerManager) {
    window.audioPlayerManager.isShuffle = !window.audioPlayerManager.isShuffle;
    const shuffleBtn = document.getElementById("shuffleBtn");
    if (shuffleBtn) {
      shuffleBtn.classList.toggle(
        "active",
        window.audioPlayerManager.isShuffle
      );
    }
    window.showNotification(
      `Shuffle ${window.audioPlayerManager.isShuffle ? "on" : "off"}`,
      "info"
    );
  }
};

window.toggleRepeat = function () {
  if (window.audioPlayerManager) {
    const modes = ["none", "all", "one"];
    const currentIndex = modes.indexOf(window.audioPlayerManager.repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;

    window.audioPlayerManager.repeatMode = modes[nextIndex];

    const repeatBtn = document.getElementById("repeatBtn");
    if (repeatBtn) {
      const icon = repeatBtn.querySelector("i");
      repeatBtn.classList.remove("active");

      switch (window.audioPlayerManager.repeatMode) {
        case "none":
          icon.className = "fas fa-redo";
          window.showNotification("Repeat off", "info");
          break;
        case "all":
          icon.className = "fas fa-redo";
          repeatBtn.classList.add("active");
          window.showNotification("Repeat all", "info");
          break;
        case "one":
          icon.className = "fas fa-redo-alt";
          repeatBtn.classList.add("active");
          window.showNotification("Repeat one", "info");
          break;
      }
    }
  }
};



// Responsive volume control functions
window.toggleVolumePopup = function() {
  const popup = document.getElementById("volumePopup2");
  if (popup) {
    popup.classList.toggle('active');
  }
};



// Close popup when clicking outside
document.addEventListener("click", function (event) {
  const btn = document.getElementById("volumeBtn2");
  const popup = document.getElementById("volumePopup2");
  
  if (btn && popup && !btn.contains(event.target) && !popup.contains(event.target)) {
    popup.classList.remove('active');
  }
});

// Song playing functions
window.playSong = async function (song, albumCover, addToQueue = true) {
  if (window.audioPlayerManager) {
    await window.audioPlayerManager.loadSong(song, albumCover);
    
    if (addToQueue) {
      // Check if song is already in queue at current position
      const currentQueueItem = window.audioPlayerManager.queue[window.audioPlayerManager.currentQueueIndex];
      if (!currentQueueItem || currentQueueItem.song.id !== song.id) {
        // Add to queue and set as current
        window.audioPlayerManager.addToQueue(song, albumCover);
        window.audioPlayerManager.currentQueueIndex = window.audioPlayerManager.queue.length - 1;
      }
      // Update queue display after adding
      window.audioPlayerManager.updateQueueDisplay();
    }
    
    window.audioPlayerManager.play();
  }
};

window.playSongFromAlbum = async function (songId, albumId) {
  try {
    const album = window.appState.albums.find((a) => a.id == albumId);
    if (!album) {
      console.error("Album not found:", albumId);
      window.showNotification("Album not found", "error");
      return;
    }

    const song = album.songs.find((s) => s.id == songId);
    if (!song) {
      console.error("Song not found:", songId);
      window.showNotification("Song not found", "error");
      return;
    }

    console.log("Playing song:", song.title, "from album:", album.title);
    
    // Always clear queue and add entire album
    const albumCover = album.coverUrl || album.cover;
    
    // Clear current queue and add entire album
    window.audioPlayerManager.clearQueue(false);
    
    // Add all songs from album to queue
    album.songs.forEach(albumSong => {
      window.audioPlayerManager.addToQueue(albumSong, albumCover);
    });
    
    // Set current song as the one being played
    window.audioPlayerManager.currentQueueIndex = album.songs.findIndex(s => s.id == songId);
    
    // Update queue display
    window.audioPlayerManager.updateQueueDisplay();
    
    await window.playSong(song, albumCover, false); // Don't add to queue again
    window.showNotification(`Playing: ${song.title}`, "success");
  } catch (error) {
    console.error("Error playing song:", error);
    window.showNotification("Failed to play song", "error");
  }
};

window.playFullAlbum = function (albumId) {
  try {
    const album = window.appState.albums.find((a) => a.id == albumId);
    if (!album || !album.songs.length) {
      window.showNotification("No songs found in album", "error");
      return;
    }

    // Clear existing queue and add all album songs
    window.audioPlayerManager.clearQueue();
    album.songs.forEach(song => {
      window.audioPlayerManager.addToQueue(song, album.coverUrl || album.cover);
    });
    
    // Set to first song and play
    window.audioPlayerManager.currentQueueIndex = 0;
    const firstSong = album.songs[0];
    window.audioPlayerManager.loadSong(firstSong, album.coverUrl || album.cover);
    window.audioPlayerManager.play();
    window.audioPlayerManager.updateQueueDisplay();
    
    window.showNotification(`Playing album: ${album.title}`, "success");
  } catch (error) {
    console.error("Error playing album:", error);
    window.showNotification("Failed to play album", "error");
  }
};

window.shuffleAlbum = function (albumId) {
  try {
    const album = window.appState.albums.find((a) => a.id == albumId);
    if (!album || !album.songs.length) {
      window.showNotification("No songs found in album", "error");
      return;
    }

    const shuffledSongs = [...album.songs].sort(() => Math.random() - 0.5);
    const firstSong = shuffledSongs[0];
    window.playSong(firstSong, album.coverUrl || album.cover);
    window.showNotification(`Shuffling album: ${album.title}`, "success");
  } catch (error) {
    console.error("Error shuffling album:", error);
    window.showNotification("Failed to shuffle album", "error");
  }
};

// ===== 8. APP INITIALIZATION =====

// Global app state and managers
const appState = new AppState();
window.appState = appState;

let audioPlayerManager;
let authManager;
let fileUploadManager;

// Theme initialization
function initializeTheme() {
  try {
    const savedTheme = localStorage.getItem("iJamTheme") || "light";
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
      const themeSwitch = document.querySelector(".theme-switch");
      if (themeSwitch) themeSwitch.classList.add("active");
    }
    appState.setTheme(savedTheme);
  } catch (error) {
    console.error("Error initializing theme:", error);
  }
}

// Event listeners setup
function initializeEventListeners() {
  try {
    // Search functionality
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
          showSearchDropdown(query);
        } else {
          hideSearchDropdown();
          hideSearchResults();
        }
      });

      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const query = e.target.value.trim();
          if (query.length > 0) {
            performSearch(query);
            hideSearchDropdown();
          }
        }
      });

      // Hide dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-bar")) {
          hideSearchDropdown();
        }
      });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      const sidebar = document.getElementById("sidebar");
      const sidebarToggle = document.querySelector(".sidebar-toggle");
      const isInsideSidebar = sidebar && sidebar.contains(e.target);
      const isToggleButton = sidebarToggle && sidebarToggle.contains(e.target);

      if (
        window.innerWidth <= 768 &&
        sidebar &&
        sidebar.classList.contains("open") &&
        !isInsideSidebar &&
        !isToggleButton
      ) {
        window.closeSidebar();
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      const sidebar = document.getElementById("sidebar");

      // Close sidebar with Escape key
      if (e.key === "Escape" && sidebar && sidebar.classList.contains("open")) {
        window.closeSidebar();
      }

      // Toggle sidebar with Ctrl+B
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        window.toggleSidebar();
      }
    });

    // Playlist form submission
    const playlistForm = document.getElementById("playlistForm");
    if (playlistForm) {
      playlistForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById("playlistName");
        const descriptionInput = document.getElementById("playlistDescription");
        
        if (nameInput && nameInput.value.trim()) {
          const playlistName = nameInput.value.trim();
          const description = descriptionInput ? descriptionInput.value.trim() : "";
          
          // Create playlist
          const playlistList = document.getElementById("playlist-list");
          if (playlistList) {
            const playlistItem = document.createElement("li");
            playlistItem.className = "playlist-item";
            playlistItem.innerHTML = `<i class="fa fa-music"></i><span>${playlistName}</span>`;
            playlistItem.onclick = () =>
              window.selectPlaylist(
                playlistName.toLowerCase().replace(/\s+/g, "-")
              );
            playlistList.appendChild(playlistItem);

            console.log(`Created playlist: ${playlistName}`, description ? `with description: ${description}` : "");
            window.showNotification(`Created playlist: ${playlistName}`, "success");
            
            // Close modal
            window.closePlaylistModal();
          }
        }
      });
    }

    // Set up drop zone functionality
    const dropZone = document.getElementById('dropZone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
      
      dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
      });
      
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over', 'active');
        
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data.songId && data.albumId) {
            window.playSongFromAlbum(data.songId, data.albumId);
            window.showNotification("Song added to now playing", "success");
          }
        } catch (error) {
          console.error("Error handling drop:", error);
          window.showNotification("Error playing song", "error");
        }
      });
    }

    // Initialize language
    window.initializeLanguage();
    
    // Initialize volume displays
    const volumeSlider = document.getElementById("volumeSlider");
    const volumeSlider2 = document.getElementById("volumeSlider2");
    const volumeDisplay2 = document.getElementById("volumeDisplay2");
    
    if (volumeSlider && volumeDisplay2) {
      volumeDisplay2.textContent = volumeSlider.value;
    }
    if (volumeSlider && volumeSlider2) {
      volumeSlider2.value = volumeSlider.value;
    }

    console.log("Event listeners setup completed");
  } catch (error) {
    console.error("Error setting up event listeners:", error);
  }
}

// Search functionality
function performSearch(query) {
  try {
    console.log("Searching for:", query);
    
    if (!query || query.trim().length === 0) {
      hideSearchResults();
      return;
    }

    const searchResults = getSearchResults(query);
    console.log("Search results:", searchResults);
    displaySearchResults(searchResults, query);
  } catch (error) {
    console.error("Error performing search:", error);
  }
}

function getSearchResults(query) {
  const searchResults = [];
  const queryLower = query.toLowerCase();

  if (window.appState && window.appState.albums) {
    window.appState.albums.forEach((album) => {
      // Search album title and artist
      if (
        album.title.toLowerCase().includes(queryLower) ||
        album.artist.toLowerCase().includes(queryLower)
      ) {
        searchResults.push({ type: "album", data: album });
      }

      // Search songs in the album
      album.songs.forEach((song) => {
        if (
          song.title.toLowerCase().includes(queryLower) ||
          song.artist.toLowerCase().includes(queryLower)
        ) {
          searchResults.push({ type: "song", data: song, album: album });
        }
      });
    });
  }

  return searchResults;
}

function showSearchDropdown(query) {
  try {
    if (!query || query.trim().length === 0) {
      hideSearchDropdown();
      return;
    }

    const searchResults = getSearchResults(query);
    const limitedResults = searchResults.slice(0, 8); // Show max 8 items in dropdown

    // Create or update dropdown
    let dropdown = document.getElementById("search-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.id = "search-dropdown";
      dropdown.className = "search-dropdown";
      
      const searchBar = document.querySelector(".search-bar");
      searchBar.appendChild(dropdown);
    }

    if (limitedResults.length === 0) {
      dropdown.innerHTML = '<div class="dropdown-item no-results">No results found</div>';
    } else {
      dropdown.innerHTML = limitedResults.map(result => {
        if (result.type === "album") {
          return `
            <div class="dropdown-item" onclick="selectDropdownItem('album', '${result.data.id}', '${query}')">
              <i class="fas fa-compact-disc"></i>
              <div class="dropdown-item-info">
                <div class="dropdown-item-title">${result.data.title}</div>
                <div class="dropdown-item-subtitle">${result.data.artist} • Album</div>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="dropdown-item" onclick="selectDropdownItem('song', '${result.data.id}', '${query}', '${result.album.id}')">
              <i class="fas fa-music"></i>
              <div class="dropdown-item-info">
                <div class="dropdown-item-title">${result.data.title}</div>
                <div class="dropdown-item-subtitle">${result.data.artist} • ${result.album.title}</div>
              </div>
            </div>
          `;
        }
      }).join('');
      
      // Add "View All Results" option
      dropdown.innerHTML += `
        <div class="dropdown-item view-all" onclick="selectDropdownItem('search', null, '${query}')">
          <i class="fas fa-search"></i>
          <div class="dropdown-item-info">
            <div class="dropdown-item-title">View all results for "${query}"</div>
            <div class="dropdown-item-subtitle">${searchResults.length} results found</div>
          </div>
        </div>
      `;
    }

    dropdown.style.display = "block";
  } catch (error) {
    console.error("Error showing search dropdown:", error);
  }
}

function hideSearchDropdown() {
  const dropdown = document.getElementById("search-dropdown");
  if (dropdown) {
    dropdown.style.display = "none";
  }
}

function selectDropdownItem(type, id, query, albumId = null) {
  const searchInput = document.getElementById("searchInput");
  
  if (type === "album") {
    hideSearchDropdown();
    navigateToAlbum(id);
    console.log("Navigating to album:", id);
  } else if (type === "song") {
    hideSearchDropdown();
    console.log("Playing song:", id, "from album:", albumId);
    window.playSongFromAlbum(id, albumId);
    
    // Clear search input after playing song
    if (searchInput) {
      searchInput.value = "";
    }
  } else if (type === "search") {
    hideSearchDropdown();
    if (searchInput) {
      searchInput.value = query;
    }
    console.log("Showing full search results for:", query);
    
    // Ensure search results are shown in main content
    setTimeout(() => {
      performSearch(query);
    }, 100);
  }
}

function displaySearchResults(results, query) {
  console.log("Displaying search results:", results.length, "results for:", query);
  
  // Create or update search results container
  let searchContainer = document.getElementById("search-results");
  if (!searchContainer) {
    searchContainer = document.createElement("div");
    searchContainer.id = "search-results";
    searchContainer.className = "search-results-container";

    const mainContent = document.getElementById("main-content");
    const firstPage = mainContent.querySelector(".page");
    if (firstPage) {
      mainContent.insertBefore(searchContainer, firstPage);
    } else {
      mainContent.appendChild(searchContainer);
    }
    console.log("Created new search container");
  } else {
    console.log("Using existing search container");
  }

  if (results.length === 0) {
    searchContainer.innerHTML = `
      <div class="search-results active">
        <h2>Search Results for "${query}"</h2>
        <p class="no-results">No results found</p>
      </div>
    `;
  } else {
    const albumResults = results.filter((r) => r.type === "album");
    const songResults = results.filter((r) => r.type === "song");

    searchContainer.innerHTML = `
      <div class="search-results active">
        <h2>Search Results for "${query}" (${results.length} found)</h2>
        
        ${
          albumResults.length > 0
            ? `
          <div class="search-section">
            <h3>Albums</h3>
            <div class="album-results">
              ${albumResults
                .map(
                  (result) => `
                <div class="search-album-item" onclick="navigateToAlbum('${result.data.id}')">
                  <img src="${result.data.coverUrl}" alt="${result.data.title}" />
                  <div class="search-item-info">
                    <h4>${result.data.title}</h4>
                    <p>${result.data.artist}</p>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
        
        ${
          songResults.length > 0
            ? `
          <div class="search-section">
            <h3>Songs</h3>
            <div class="song-results">
              ${songResults
                .map(
                  (result) => `
                <div class="search-song-item" onclick="window.playSongFromAlbum('${result.data.id}', '${result.album.id}')">
                  <div class="search-item-info">
                    <h4>${result.data.title}</h4>
                    <p>${result.data.artist} • ${result.album.title}</p>
                  </div>
                  <div class="search-song-actions">
                    <button class="search-like-btn ${window.appState.isFavorite(result.data.id) ? 'active' : ''}" 
                            onclick="event.stopPropagation(); window.toggleSongFavorite('${result.data.id}')" 
                            title="Add to Favorites">
                      <i class="${window.appState.isFavorite(result.data.id) ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <button class="play-btn">
                      <i class="fas fa-play"></i>
                    </button>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
        
        <button class="clear-search-btn" onclick="clearSearch()">
          <i class="fas fa-times"></i> Clear Search
        </button>
      </div>
    `;
  }

  // Hide other pages and show search results
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  
  const searchResultsDiv = searchContainer.querySelector(".search-results");
  if (searchResultsDiv) {
    searchResultsDiv.classList.add("active");
    console.log("Search results now visible in main content");
  } else {
    console.error("Could not find .search-results element");
  }
}

function hideSearchResults() {
  const searchContainer = document.getElementById("search-results");
  if (searchContainer) {
    searchContainer.remove();
  }

  // Show home page
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  const homePage = document.getElementById("home-page");
  if (homePage) {
    homePage.classList.add("active");
  }
}

window.clearSearch = function () {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = "";
  }
  hideSearchResults();
};

// Playlist playback functions
window.playPlaylist = function () {
  window.showNotification("Playing playlist...", "info");
  // TODO: Implement playlist playback
};

window.shufflePlaylist = function () {
  window.showNotification("Shuffling playlist...", "info");
  // TODO: Implement playlist shuffle
};

// Refresh albums - reload and update carousels
window.refreshAlbums = function () {
  console.log("🔄 Refreshing albums...");
  if (window.appState) {
    // Show loading state
    const refreshBtn = document.querySelector(".refresh-btn i");
    if (refreshBtn) {
      refreshBtn.style.animation = "spin 1s linear infinite";
    }

    const currentCount = window.appState.albums.length;
    const currentAlbums = window.appState.albums.map((a) => a.title);

    window.appState
      .loadLocalAlbums()
      .then(() => {
        // Stop loading animation
        if (refreshBtn) {
          refreshBtn.style.animation = "";
        }

        const newCount = window.appState.albums.length;
        const newAlbums = window.appState.albums.map((a) => a.title);
        const addedAlbums = newAlbums.filter(
          (title) => !currentAlbums.includes(title)
        );

        let message = "";
        if (newCount > currentCount && addedAlbums.length > 0) {
          message = `🎉 ${
            addedAlbums.length
          } new album(s) discovered: ${addedAlbums.join(", ")}`;
        } else if (newCount < currentCount) {
          message = `${currentCount - newCount} album(s) removed`;
        } else {
          message = "✅ Albums are up to date";
        }

        window.showNotification(message, "success");
      })
      .catch((error) => {
        // Stop loading animation on error
        if (refreshBtn) {
          refreshBtn.style.animation = "";
        }
        console.error("Error refreshing albums:", error);
        window.showNotification("Failed to refresh albums", "error");
      });
  }
};

// Auto-refresh albums periodically (every 60 seconds)
function startAutoRefresh() {
  setInterval(() => {
    if (window.appState && document.visibilityState === "visible") {
      console.log("🔄 Auto-refreshing albums...");

      // Store current albums count to compare
      const currentCount = window.appState.albums.length;

      window.appState.loadLocalAlbums().then(() => {
        // Only show notification if albums changed
        const newCount = window.appState.albums.length;
        if (newCount !== currentCount) {
          const message =
            newCount > currentCount
              ? `${newCount - currentCount} new album(s) discovered!`
              : "Albums updated";
          window.showNotification(message, "info");
        }
      });
    }
  }, 60000); // 60 seconds
}

// Setup app state listeners
function setupStateListeners() {
  try {
    appState.on("themeChanged", ({ newTheme }) => {
      localStorage.setItem("iJamTheme", newTheme);
    });
  } catch (error) {
    console.error("Error setting up state listeners:", error);
  }
}

// Show loading complete
function showLoadingComplete() {
  console.log("🎉 iJam Music Player loaded successfully!");
}

// Global error handler
window.addEventListener("error", (event) => {
  console.error("Global error caught:", event.error);
  if (window.showNotification) {
    window.showNotification(
      "An error occurred. Please refresh the page.",
      "error"
    );
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  if (window.showNotification) {
    window.showNotification("An error occurred. Please try again.", "error");
  }
});

// Main initialization
document.addEventListener("DOMContentLoaded", function () {
  try {
    console.log("🎵 Initializing iJam Music Player...");
    console.log("📍 Version: 2.0.0 - Enhanced Edition");

    const startTime = performance.now();

    // Initialize core components
    console.log("🔧 Initializing core components...");
    initializeEventListeners();
    initializeTheme();
    setupStateListeners();
    startAutoRefresh();

    // Initialize managers
    console.log("🔧 Initializing managers...");
    audioPlayerManager = new AudioPlayerManager();
    authManager = new AuthManager();
    fileUploadManager = new FileUploadManager();

    // Make managers globally accessible
    window.audioPlayerManager = audioPlayerManager;
    window.authManager = authManager;
    window.fileUploadManager = fileUploadManager;

    // Initialize carousels when albums are loaded
    appState.on("albumsLoaded", (albums) => {
      console.log("🎠 Initializing carousels with albums:", albums.length);

      try {
        const trendingCarouselEl = document.querySelector("#trending-carousel");
        const recentCarouselEl = document.querySelector("#recent-carousel");

        console.log(
          "🎠 Trending carousel element found:",
          !!trendingCarouselEl
        );
        console.log("🎠 Recent carousel element found:", !!recentCarouselEl);

        if (trendingCarouselEl && albums.length > 0) {
          console.log("🎠 Setting up trending carousel");
          const trendingCarousel =
            trendingCarouselEl.closest(".custom-carousel");
          if (trendingCarousel) {
            const trendingInstance = new CustomCarousel(trendingCarousel);
            trendingInstance.addCells(
              albums.slice(0, Math.min(albums.length, 6))
            );
          }
        }

        if (recentCarouselEl && albums.length > 0) {
          console.log("🎠 Setting up recent carousel");
          const recentCarousel = recentCarouselEl.closest(".custom-carousel");
          if (recentCarousel) {
            const recentInstance = new CustomCarousel(recentCarousel);
            // Show different albums in recent carousel
            const recentAlbums =
              albums.length > 3
                ? albums.slice(-3).concat(albums.slice(0, 3))
                : albums;
            recentInstance.addCells(
              recentAlbums.slice(0, Math.min(recentAlbums.length, 6))
            );
          }
        }

        if (albums.length === 0) {
          console.log("⚠️ No albums loaded - carousels will be empty");
        }
      } catch (error) {
        console.error("❌ Error initializing carousels:", error);
      }
    });

    // Load albums
    (async () => {
      try {
        await appState.loadAlbumsFromLocalStorage();
      } catch (error) {
        console.error("❌ Failed to start album loading:", error);
        // Emit empty albums to at least initialize the UI
        setTimeout(() => {
          appState.emit("albumsLoaded", []);
        }, 100);
      }
    })();

    const endTime = performance.now();
    console.log(`✅ App initialized in ${(endTime - startTime).toFixed(2)}ms`);

    showLoadingComplete();
  } catch (error) {
    console.error("❌ Error initializing app:", error.message);
    if (window.showNotification) {
      window.showNotification("Failed to initialize app", "error");
    }
  }
});

// Close modals when clicking outside
setTimeout(() => {
  document.addEventListener("click", function (event) {
    const authModal = document.getElementById("authModalOverlay");
    const uploadModal = document.getElementById("uploadModalOverlay");

    if (event.target === authModal) {
      window.closeAuthModal();
    }

    if (event.target === uploadModal) {
      window.closeUploadModal();
    }
  });
}, 100);

console.log("✅ iJam Music Player script loaded");
