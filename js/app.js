// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const moviesGrid = document.getElementById('moviesGrid');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const allMoviesBtn = document.getElementById('allMoviesBtn');
const watchlistBtn = document.getElementById('watchlistBtn');
const sectionTitle = document.getElementById('sectionTitle');
const genreFilter = document.getElementById('genreFilter');
const yearFilter = document.getElementById('yearFilter');
const sortFilter = document.getElementById('sortFilter');

// State
let currentView = 'all';
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
let currentMovies = [];

// Initialize
async function init() {
    await loadTrendingMovies();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    allMoviesBtn.addEventListener('click', () => switchView('all'));
    watchlistBtn.addEventListener('click', () => switchView('watchlist'));

    genreFilter.addEventListener('change', handleFilters);
    yearFilter.addEventListener('change', handleFilters);
    sortFilter.addEventListener('change', handleFilters);
}

// Switch between views
function switchView(view) {
    currentView = view;
    
    if (view === 'all') {
        allMoviesBtn.classList.add('active');
        watchlistBtn.classList.remove('active');
        sectionTitle.textContent = 'Trending Movies';
        loadTrendingMovies();
    } else {
        watchlistBtn.classList.add('active');
        allMoviesBtn.classList.remove('active');
        sectionTitle.textContent = 'My Watchlist';
        displayWatchlist();
    }
}

// Load Trending Movies
async function loadTrendingMovies() {
    showLoading();
    const movies = await getTrendingMovies();
    currentMovies = movies;
    displayMovies(movies);
}

// Search Handler
async function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        showLoading();
        const movies = await searchMovies(query);
        currentMovies = movies;
        sectionTitle.textContent = `Search Results for "${query}"`;
        displayMovies(movies);
    }
}

// Filter Handler
async function handleFilters() {
    if (currentView === 'all') {
        showLoading();
        const filters = {
            genre: genreFilter.value,
            year: yearFilter.value,
            sort: sortFilter.value
        };
        const movies = await discoverMovies(filters);
        currentMovies = movies;
        displayMovies(movies);
    }
}

// Display Movies
function displayMovies(movies) {
    hideLoading();
    
    if (!movies || movies.length === 0) {
        showEmptyState();
        return;
    }
    
    moviesGrid.innerHTML = '';
    movies.forEach(movie => {
        const isInWatchlist = watchlist.some(m => m.id === movie.id);
        const card = createMovieCard(movie, isInWatchlist);
        moviesGrid.appendChild(card);
    });
}

// Display Watchlist
function displayWatchlist() {
    if (watchlist.length === 0) {
        showEmptyState();
        return;
    }

    moviesGrid.innerHTML = '';
    emptyState.style.display = 'none';
    
    watchlist.forEach(movie => {
        const card = createMovieCard(movie, true);
        moviesGrid.appendChild(card);
    });
}

// Create Movie Card
function createMovieCard(movie, isInWatchlist) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const posterPath = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : null;
    
    const year = movie.release_date 
        ? new Date(movie.release_date).getFullYear() 
        : 'N/A';
    
    const rating = movie.vote_average 
        ? movie.vote_average.toFixed(1) 
        : 'N/A';

    card.innerHTML = `
        ${posterPath 
            ? `<img src="${posterPath}" alt="${movie.title}" class="movie-poster">` 
            : `<div class="no-poster">🎬</div>`
        }
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-details">
                <span class="rating">⭐ ${rating}</span>
                <span class="year">${year}</span>
            </div>
            <div class="card-actions">
                ${isInWatchlist 
                    ? `<button class="action-btn add-btn" onclick="removeFromWatchlist(${movie.id})">Remove</button>` 
                    : `<button class="action-btn add-btn" onclick="addToWatchlist(${movie.id}, '${movie.title.replace(/'/g, "\\'")}', '${movie.poster_path || ''}', '${movie.release_date || ''}', ${movie.vote_average || 0})">+ Watchlist</button>`
                }
                <button class="action-btn view-btn" onclick="viewDetails(${movie.id})">Details</button>
            </div>
        </div>
    `;

    return card;
}

// Add to Watchlist
function addToWatchlist(id, title, poster_path, release_date, vote_average) {
    const movie = {
        id,
        title,
        poster_path,
        release_date,
        vote_average
    };
    
    if (watchlist.some(m => m.id === id)) {
        alert('This movie is already in your watchlist!');
        return;
    }
    
    watchlist.push(movie);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    
    if (currentView === 'all') {
        displayMovies(currentMovies);
    }
    
    alert(`"${title}" added to your watchlist! 🎉`);
}

// Remove from Watchlist
function removeFromWatchlist(movieId) {
    const movie = watchlist.find(m => m.id === movieId);
    
    if (!movie) return;
    
    watchlist = watchlist.filter(m => m.id !== movieId);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    
    if (currentView === 'watchlist') {
        displayWatchlist();
    } else {
        displayMovies(currentMovies);
    }
    
    alert(`"${movie.title}" removed from watchlist`);
}

// View Details
async function viewDetails(movieId) {
    const details = await getMovieDetails(movieId);
    
    if (!details) {
        alert('Failed to load movie details');
        return;
    }
    
    const providers = await getWatchProviders(movieId);
    
    let ottLinks = 'Not available';
    if (providers && providers.flatrate) {
        ottLinks = providers.flatrate.map(p => p.provider_name).join(', ');
    }
    
    const overview = details.overview || 'No overview available';
    const genres = details.genres ? details.genres.map(g => g.name).join(', ') : 'N/A';
    const runtime = details.runtime ? `${details.runtime} min` : 'N/A';
    
    const message = `
🎬 ${details.title}
⭐ Rating: ${details.vote_average}/10
📅 Release: ${details.release_date}
⏱️ Runtime: ${runtime}
🎭 Genres: ${genres}

📝 Overview:
${overview}

📺 Available on: ${ottLinks}

💡 Click OK to open TMDB page for full details!
    `;
    
    alert(message);
    
    const openPage = confirm('Open this movie on TMDB?');
    if (openPage) {
        window.open(`https://www.themoviedb.org/movie/${movieId}`, '_blank');
    }
}

// UI Helper Functions
function showLoading() {
    loading.style.display = 'block';
    moviesGrid.style.display = 'none';
    emptyState.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
    moviesGrid.style.display = 'grid';
    emptyState.style.display = 'none';
}

function showEmptyState() {
    loading.style.display = 'none';
    moviesGrid.style.display = 'none';
    emptyState.style.display = 'block';
}

// Start the app
init();