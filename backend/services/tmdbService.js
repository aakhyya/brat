const axios=require("axios");

class TMDBService{
    constructor(){
        this.apiKey=process.env.TMDB_API_KEY
        this.baseURL=process.env.TMDB_BASE_URL

        this.client=axios.create({
            baseURL:this.baseURL,
            headers:{
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            timeout:5000,
        });
    }

    async searchMovies(query, page=1) { //user searches movie by title -> Goes to TMDB API
        try{
            if (!query || query.trim().length < 2) {
                throw new Error('Query too short');
            }

            const res=await this.client.get("/search/movie",{
                params:{
                    query:query.trim(),
                    page,
                }
            });

            return res.data.results.map(movie=>({
                tmdbId: movie.id,
                title: movie.title,
                releaseDate: movie.release_date || null,
                overview: movie.overview || '',
                posterPath: movie.poster_path || null
            }));
        }
        catch(err){
            //API down or rate limit
            console.error('TMDB searchMovies error:', err.message);
            return [];
        }
    }

    async getMovieDetails(tmdbId) { //Gets movie details by tmdbId
        try{
            if(!tmdbId){
                throw new Error("TMDB Id is required!");
            }

            const movieResponse=await this.client.get(`/movie/${tmdbId}`);
            const credits=await this.getMovieCredits(tmdbId);

            return this.normalizeMovieData(movieResponse.data, credits);
        }
        catch(err){
            console.error('TMDB getMovieDetails error:', err.message);
            throw err;
        }
    }

    async getMovieCredits(tmdbId) { //gets movie credits(cast & crew)
        try{
            const res = await this.client.get(`/movie/${tmdbId}/credits`);
            return res.data;
        }
        catch(err){
            console.error('TMDB getMovieCredits error:', err.message);
            return {cast:[], crew:[]};
        }
    }

    normalizeMovieData(tmdbMovie, credits) { //normalizes TMDB movie + credits to Content schema
        return{
            type: 'movie',
            title: tmdbMovie.title,
            description: tmdbMovie.overview || '',
            releaseDate: tmdbMovie.release_date
                ? new Date(tmdbMovie.release_date)
                : null,

            creators: [
                // Directors
                ...credits.crew
                .filter(person => person.job === 'Director')
                .map(director => ({
                    name: director.name,
                    role: 'director',
                    externalId: director.id
                })),

                // Main actors (top 5)
                ...credits.cast.slice(0, 5).map(actor => ({
                    name: actor.name,
                    role: 'actor',
                    externalId: actor.id
                }))
            ],

            metadata: {
                runtime: tmdbMovie.runtime || null,
                budget: tmdbMovie.budget || null,
                revenue: tmdbMovie.revenue || null,
                genres: tmdbMovie.genres?.map(g => g.name) || []
            },

            externalIds: {
                tmdb: tmdbMovie.id.toString(),
                imdb: tmdbMovie.imdb_id || null
            },

            images: {
                poster: tmdbMovie.poster_path
                ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
                : null,
                backdrop: tmdbMovie.backdrop_path
                ? `https://image.tmdb.org/t/p/original${tmdbMovie.backdrop_path}`
                : null
            }
        };
    }
}

module.exports=new TMDBService();