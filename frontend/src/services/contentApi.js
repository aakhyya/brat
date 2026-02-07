import api from "./api";

function handleApiError(error, fallbackMessage = "Something went wrong") { //Centralized error handling
    // Network / offline error
    if (!error.response) {
        console.error("Network Error:", error);
        throw new Error("NETWORK_ERROR");
    }

    const { status, data } = error.response;

    // Unauthorized → force re-auth
    if (status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
    }

    // Rate limiting
    if (status === 429) {
        throw new Error("RATE_LIMITED");
    }

    // Backend-defined error
    if (data?.message) {
        throw new Error(data.message);
    }

    // Unknown error
    throw new Error(fallbackMessage);
}

function validateQuery(query) { //Validating query
    return query && query.trim().length >= 2;
}

export const contentApi = { //One single object, no duplication of fetch
    // UI components -> dumb; Services -> smart, defensive
    //Search
    searchMovies: async (query) => {
        if (!validateQuery(query)) return [];
        try {
            const res = await api.get(`/api/content/enrich/movie/search`,
                { params: { q: query } }
            );

            return res.data?.data?.results || [];
        }
        catch (err) {
            handleApiError(err, "Failed to search movies");
            return [];
        }
    },
    searchSongs: async (query) => {
        if (!validateQuery(query)) return [];
        try {
            const res = await api.get(`/api/content/enrich/song/search`,
                { params: { q: query } }
            );

            return res.data?.data?.results || [];
        }
        catch (err) {
            handleApiError(err, "Failed to search songs");
            return [];
        }
    },
    searchBooks: async (query) => {
        if (!validateQuery(query)) return [];
        try {
            const res = await api.get(`/api/content/enrich/book/search`,
                { params: { q: query } }
            );

            return res.data?.data?.results || [];
        }
        catch (err) {
            handleApiError(err, "Failed to search books");
            return [];
        }
    },
    //Enrich
    enrichMovie: async (tmdbId) => {
        try {
            const res = await api.post(`/api/content/enrich/movie/${tmdbId}`);
            return res.data?.data;
        }
        catch (err) {
            handleApiError(err, "Failed to enrich movie");
            throw err;
        }
    },
    enrichSong: async (itunesId) => {
        try {
            const res = await api.post(`/api/content/enrich/song/${itunesId}`);
            return res.data?.data;
        }
        catch (err) {
            handleApiError(err, "Failed to enrich song");
            throw err;
        }
    },
    enrichBook: async (googleBooksId) => {
        try {
            const res = await api.post(`/api/content/enrich/book/${googleBooksId}`);
            return res.data?.data;
        }
        catch (err) {
            handleApiError(err, "Failed to enrich book");
            throw err;
        }
    },
};