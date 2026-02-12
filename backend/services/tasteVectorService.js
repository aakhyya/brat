class TasteVectorService{
    constructor(){
        this.DIMENSIONS=30;
        this.learningRate=0.3; //one rating doesn't completely change someone's taste
    }

    updateTasteVector(user,content,rating){
        if (!content.featureVector || content.featureVector.length !== this.DIMENSIONS) {
            return user.tasteVector;
        }

        if (!user.tasteVector || user.tasteVector.length !== this.DIMENSIONS) { //intialize user vector if empty
            user.tasteVector = new Array(this.DIMENSIONS).fill(0);
        }
        const userVector = [...user.tasteVector];
        const contentVector = content.featureVector; 
        //convert rating to influence

        const influence=(rating-3)*0.2;
        for(let i=0;i<this.DIMENSIONS;i++){
            userVector[i]=userVector[i]+contentVector[i]*influence*this.learningRate;
            userVector[i]=Math.max(-1,Math.min(1,userVector[i]));// b/w -1 & 1
        }
        return userVector;
    }
}

module.exports=new TasteVectorService();