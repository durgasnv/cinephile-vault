// js/api.js
// TMDB API Integration Module

const API_KEY = '2c5c2370c268da5c75811fee33896c2b'; // Replace with your actual key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Fetch trending movies
async function getTrendingMovies() {
    try {
        const response = await fetch(
            `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch trending movies');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        return [];
    }
}

// Search movies by query
async function searchMovies(query) {
    try {
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`
        );
        
        if (!response.ok) {
            throw new Error('Failed to search movies');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error searching movies:', error);
        return [];
    }
}

// Discover movies with filters
async function discoverMovies(filters = {}) {
    try {
        let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}`;
        
        // Add genre filter
        if (filters.genre) {
            url += `&with_genres=${filters.genre}`;
        }
        
        // Add year filter
        if (filters.year) {
            url += `&primary_release_year=${filters.year}`;
        }
        
        // Add sort filter
        if (filters.sort) {
            url += `&sort_by=${filters.sort}`;
        } else {
            url += `&sort_by=popularity.desc`; // Default sort
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to discover movies');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error discovering movies:', error);
        return [];
    }
}

// Get movie details by ID
async function getMovieDetails(movieId) {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits,watch/providers`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch movie details');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

// Get movie watch providers (OTT platforms)
async function getWatchProviders(movieId) {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch watch providers');
        }
        
        const data = await response.json();
        
        // Return providers for India (IN) or US if IN not available
        return data.results.IN || data.results.US || null;
    } catch (error) {
        console.error('Error fetching watch providers:', error);
        return null;
    }
}

// Get popular movies
async function getPopularMovies() {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch popular movies');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        return [];
    }
}

// Get top rated movies
async function getTopRatedMovies() {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=1`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch top rated movies');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching top rated movies:', error);
        return [];
    }
}

// Export functions (if using modules)
// For now, these functions are available globally