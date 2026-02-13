class RecommendationService{
    //User loves action; Content is heavy action → Score close to 1
    calculateSimilarity(userVector, contentVector){
        if (!Array.isArray(userVector) || !Array.isArray(contentVector) || 
            userVector.length !== contentVector.length || userVector.length === 0) {
            return 0;
        }
        let dotProduct = 0;
        let magnitudeUser = 0;
        let magnitudeContent = 0;
        
        for(let i=0;i<userVector.length;i++){
            const u=userVector[i];
            const c=contentVector[i];
            dotProduct+=u*c;
            magnitudeContent+=c*c;
            magnitudeUser+=u*u;
        }
        
        magnitudeContent=Math.sqrt(magnitudeContent);
        magnitudeUser=Math.sqrt(magnitudeUser);

        if(magnitudeContent===0 || magnitudeUser===0){
            return 0;
        }

        const similarity=dotProduct/(magnitudeContent*magnitudeUser);
        return similarity;
    }
    // rank everything unseen by vibe match and return top content
    getRecommendations(user, allContent, limit = 10){ //user obj., content taste vector array, limit of contents 
        if (!user || !Array.isArray(user.tasteVector)) {
            return [];
        }

        const interactedContentIds = new Set( //Set has O(1) operation
            (user.interactions || []).map((item) => //storing interactions that's already seen
                item.contentId?.toString()
            )
        );

        const recommendations = [];
        for(const content of allContent){
            if (!Array.isArray(content.featureVector) || content.featureVector.length === 0) {
                continue; //ignore invalid/empty vectors
            }
            if (interactedContentIds.has(content._id?.toString())) {
                continue;
            }
            const score = this.calculateSimilarity(user.tasteVector,content.featureVector);
            recommendations.push({ content, score });
        }
        recommendations.sort((a, b) => b.score - a.score);

        return recommendations.slice(0, limit);
    }
}

module.exports=new RecommendationService();