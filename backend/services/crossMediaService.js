const Content = require("../models/content");

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

const DIMENSION_GROUPS = {
  genre: { start: 0, end: 9, label: "Genre" },
  mood: { start: 10, end: 15, label: "Mood" },
  theme: { start: 16, end: 21, label: "Theme" },
  era: { start: 22, end: 25, label: "Temporal" },
  complexity: { start: 26, end: 29, label: "Style" }
};

class CrossMediaService {
    calculateSimilarity(vector1, vector2) {
        if (!Array.isArray(vector1)||!Array.isArray(vector2)||vector1.length !== vector2.length||vector1.length === 0) {
            return 0;
        }

        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;

        for (let i = 0; i < vector1.length; i++) {
            const v1 = vector1[i];
            const v2 = vector2[i];
            dotProduct += v1 * v2;
            magnitude1 += v1 * v1;
            magnitude2 += v2 * v2;
        }

        magnitude1 = Math.sqrt(magnitude1);
        magnitude2 = Math.sqrt(magnitude2);

        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        }

        return dotProduct / (magnitude1 * magnitude2);
    }

    determineConnectionType(sourceVector, targetVector){ //which dimension matches the most
        if (!Array.isArray(sourceVector) || !Array.isArray(targetVector)) {
            return { type: "Theme", contribution: 0 };
        }

        const groupContributions=[];
        for(const [groupName,group] of Object.entries(DIMENSION_GROUPS)){
            let contribution=0;
            for(let i=group.start;i<=group.end;i++){
                if(i<sourceVector.length && i<targetVector.length){
                    contribution+=sourceVector[i]*targetVector[i];
                }
            }

            groupContributions[groupName]={
                label:group.label,
                contribution:contribution,
            };
        }

        let maxContribution=0;
        let connectionType="Theme";
        for (const group of Object.values(groupContributions)) {
            if (group.contribution > maxContribution) {
                maxContribution = group.contribution;
                connectionType = group.label;
            }
        }

        return {type:connectionType, contribution:maxContribution};
    }

    generateExplanation(sourceVector,targetVector,connectionType){
        if (!Array.isArray(sourceVector) || !Array.isArray(targetVector)) {
            return "Similar content";
        }

        const dimensionContributions = [];
        for (let i = 0; i < Math.min(sourceVector.length, targetVector.length); i++) {
            const contribution = sourceVector[i] * targetVector[i];
            if (contribution > 0) {
                dimensionContributions.push({
                    dimension: DIMENSION_LABELS[i],
                    contribution: contribution  
                });
            }
        }

        dimensionContributions.sort((a,b)=>b.contribution-a.contribution);
        const topDimension=dimensionContributions
                            .slice(0,3)
                            .map(item=>item.dimension);
        
        if(topDimension.length===0){
            return `Similar ${connectionType}`;
        }

        return `${topDimension.join(", ")}`;
    }

    async findCrossMediaMatches(sourceContent, allContent, targetMediaType, limit = 10) {
        if (!sourceContent || !Array.isArray(sourceContent.featureVector) || sourceContent.featureVector.length === 0) {
            return [];
        }

        const matches=[];
        for(const content of allContent){
            if(content.type !== targetMediaType) continue; //skip if not media type
            if(content._id.toString() === sourceContent._id.toString()) continue; //skip if same content
            if(!Array.isArray(content.featureVector) || content.featureVector.length === 0) continue; //skip if no feature vector
            
            const score = this.calculateSimilarity(sourceContent.featureVector,content.featureVector);
            if (score <= 0.1) continue; //skip low-quality content
            const { type: connectionType } = this.determineConnectionType( // Determine connection type
                sourceContent.featureVector,
                content.featureVector
            );
            const explanation = this.generateExplanation( // Generate explanation
                sourceContent.featureVector,
                content.featureVector,
                connectionType
            );

            matches.push({content,score,connectionType,explanation});
        }

        matches.sort((a,b)=> b.score-a.score);
        return matches.slice(0,limit);
    }
}

module.exports = new CrossMediaService();