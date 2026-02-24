const Content = require("../models/content");
const tmdbService = require('./tmdbService');
const itunesService = require('./itunesService');
const googleBooksService = require('./googleBooksService');

const DIMENSION_MAP = {
    // 0-9: Genres
    action: 0,
    comedy: 1,
    drama: 2,
    horror: 3,
    romance: 4,
    scifi: 5,
    thriller: 6,
    fantasy: 7,
    documentary: 8,
    mystery: 9,

    // 10-15: Mood
    uplifting: 10,
    darkMood: 11,
    intense: 12,
    calm: 13,
    energetic: 14,
    emotional: 15,

    // 16-21: Themes
    loveTheme: 16,
    revengeTheme: 17,
    comingOfAge: 18,
    survival: 19,
    powerStruggles: 20,
    identity: 21,

    // 22-25: Era
    classicEra: 22,
    modernEra: 23,
    contemporaryEra: 24,
    futuristic: 25,

    // 26-29: Complexity
    simpleStorytelling: 26,
    layeredStorytelling: 27,
    experimentalStyle: 28,
    fastPaced: 29
};

const DIMENSION_LABELS = [
    // 0–9 Genres
    "Action", "Comedy", "Drama", "Horror", "Romance",
    "Sci-Fi", "Thriller", "Fantasy", "Documentary", "Mystery",

    // 10–15 Mood
    "Uplifting", "Dark Mood", "Intense", "Calm",
    "Energetic", "Emotional",

    // 16–21 Themes
    "Love Theme", "Revenge Theme", "Coming-of-Age",
    "Survival", "Power Struggles", "Identity",

    // 22–25 Era
    "Classic Era", "Modern Era",
    "Contemporary Era", "Futuristic",

    // 26–29 Complexity
    "Simple Storytelling", "Layered Storytelling",
    "Experimental Style", "Fast-Paced"
];

class MoodSearchService {
    calculateDimensionMatch(contentVector, dimensionQuery) {
        if (!Array.isArray(contentVector) || contentVector.length !== 30) {
            return 0;
        }

        let dotProduct = 0;
        let queryMagnitude = 0;
        let contentMagnitude = 0;
        let matchCount = 0;

        for (let [dimensionName, dimensionValue] of Object.entries(dimensionQuery)) {
            const dimensionIndex = DIMENSION_MAP[dimensionName];
            if (dimensionIndex !== undefined && dimensionIndex < contentVector.length) {
                const contentValue = contentVector[dimensionIndex];

                dotProduct += contentValue * dimensionValue;
                queryMagnitude += dimensionValue * dimensionValue;
                contentMagnitude += contentValue * contentValue;
                matchCount++;
            }
        }

        if (matchCount === 0 || queryMagnitude === 0 || contentMagnitude === 0) {
            return 0;
        }

        // cosine similarity
        const similarity = dotProduct / (Math.sqrt(queryMagnitude) * Math.sqrt(contentMagnitude));
        return Math.max(0, similarity); // ensures non-negative
    }

    async searchByDimensions(dimensionQuery, mediaTypes = ['movie', 'song', 'book'], limit = 20) {
        const query = {
            featureVector: { $exists: true, $ne: [] }
        };

        if (mediaTypes && mediaTypes.length > 0) {
            query.type = { $in: mediaTypes }; //filter according to specific media type
        }

        const allContent = await Content.find(query).lean();
        if (allContent.length === 0) return [];

        const results = [];
        for (let content of allContent) {
            const score = this.calculateDimensionMatch(content.featureVector, dimensionQuery);
            if (score > 0.05) { // Lower threshold since we're using more dimensions
                results.push({
                    content,
                    dimensionMatch: score,
                    matchPercentage: Math.round(score * 100)
                });
            }
        }

        results.sort((a, b) => b.dimensionMatch - a.dimensionMatch);
        return results.slice(0, limit);
    }

    getAllDimensions() { //single source of truth: instead of hardcoding on frontend
        return {
            genres: [
                { key: 'action', label: 'Action', index: 0 },
                { key: 'comedy', label: 'Comedy', index: 1 },
                { key: 'drama', label: 'Drama', index: 2 },
                { key: 'horror', label: 'Horror', index: 3 },
                { key: 'romance', label: 'Romance', index: 4 },
                { key: 'scifi', label: 'Sci-Fi', index: 5 },
                { key: 'thriller', label: 'Thriller', index: 6 },
                { key: 'fantasy', label: 'Fantasy', index: 7 },
                { key: 'documentary', label: 'Documentary', index: 8 },
                { key: 'mystery', label: 'Mystery', index: 9 }
            ],
            mood: [
                { key: 'uplifting', label: 'Uplifting', index: 10 },
                { key: 'darkMood', label: 'Dark Mood', index: 11 },
                { key: 'intense', label: 'Intense', index: 12 },
                { key: 'calm', label: 'Calm', index: 13 },
                { key: 'energetic', label: 'Energetic', index: 14 },
                { key: 'emotional', label: 'Emotional', index: 15 }
            ],
            themes: [
                { key: 'loveTheme', label: 'Love Theme', index: 16 },
                { key: 'revengeTheme', label: 'Revenge Theme', index: 17 },
                { key: 'comingOfAge', label: 'Coming-of-Age', index: 18 },
                { key: 'survival', label: 'Survival', index: 19 },
                { key: 'powerStruggles', label: 'Power Struggles', index: 20 },
                { key: 'identity', label: 'Identity', index: 21 }
            ],
            era: [
                { key: 'classicEra', label: 'Classic Era', index: 22 },
                { key: 'modernEra', label: 'Modern Era', index: 23 },
                { key: 'contemporaryEra', label: 'Contemporary Era', index: 24 },
                { key: 'futuristic', label: 'Futuristic', index: 25 }
            ],
            complexity: [
                { key: 'simpleStorytelling', label: 'Simple Storytelling', index: 26 },
                { key: 'layeredStorytelling', label: 'Layered Storytelling', index: 27 },
                { key: 'experimentalStyle', label: 'Experimental Style', index: 28 },
                { key: 'fastPaced', label: 'Fast-Paced', index: 29 }
            ]
        };
    }
}

module.exports = new MoodSearchService();