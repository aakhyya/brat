class FeatureExtractor {
    constructor() {
        this.DIMENSIONS = 30;
    }

    extractFeatures(content) {
        const vector = new Array(this.DIMENSIONS).fill(0);
        const genres = content.metadata?.genres || [];
        const description = content.description?.toLowerCase() || "";
        const releaseYear = content.releaseDate
            ? new Date(content.releaseDate).getFullYear()
            : null;
        //Dimensions: index order must never change!!
        //Genres (0–9) 
        if (genres.includes("Action")) vector[0] = 0.8;
        if (genres.includes("Comedy")) vector[1] = 0.8;
        if (genres.includes("Drama")) vector[2] = 0.8;
        if (genres.includes("Horror")) vector[3] = 0.8;
        if (genres.includes("Romance")) vector[4] = 0.8;
        if (genres.includes("Science Fiction") || genres.includes("Sci-Fi")) vector[5] = 0.8;
        if (genres.includes("Thriller")) vector[6] = 0.8;
        if (genres.includes("Fantasy")) vector[7] = 0.8;
        if (genres.includes("Documentary")) vector[8] = 0.8;
        if (genres.includes("Mystery")) vector[9] = 0.8;

        //Mood (10–15)
        if (description.includes("uplifting") || description.includes("inspiring")) vector[10] = 0.7;
        if (description.includes("dark") || description.includes("grim")) vector[11] = 0.7;
        if (description.includes("intense") || description.includes("gripping")) vector[12] = 0.7;
        if (description.includes("calm") || description.includes("peaceful")) vector[13] = 0.7;
        if (description.includes("energetic") || description.includes("fast-paced")) vector[14] = 0.7;
        if (description.includes("emotional") || description.includes("heartfelt")) vector[15] = 0.7;

        //Themes (16–21)
        if (description.includes("love") || description.includes("romantic")) vector[16] = 0.6;
        if (description.includes("revenge") || description.includes("vengeance")) vector[17] = 0.6;
        if (description.includes("coming of age")) vector[18] = 0.6;
        if (description.includes("survival") || description.includes("survive")) vector[19] = 0.6;
        if (description.includes("power") || description.includes("corruption")) vector[20] = 0.6;
        if (description.includes("identity") || description.includes("self-discovery")) vector[21] = 0.6;

        //Era (22–25)
        if (releaseYear) {
            if (releaseYear < 1980) vector[22] = 0.7; //Classic
            else if (releaseYear >= 1980 && releaseYear < 2000) vector[23] = 0.7; //Modern
            else if (releaseYear >= 2000 && releaseYear < 2020) vector[24] = 0.7; //Contemporary
            else if (releaseYear >= 2020) vector[25] = 0.7; //Recent/Future leaning
        }
        if (genres.includes("Science Fiction") && description.includes("future")) vector[25] = 0.8; //Futuristic

        //Complexity (26–29)
        if (description.includes("simple") || description.includes("lighthearted")) vector[26] = 0.6;
        if (description.includes("layered") || description.includes("complex")) vector[27] = 0.7;
        if (description.includes("experimental") || description.includes("nonlinear")) vector[28] = 0.7;
        if (description.includes("fast-paced") || description.includes("high speed")) vector[29] = 0.7;
        
        return vector;
    }
}

module.exports = new FeatureExtractor();