const mongoose=require("mongoose");
const Content=require("../models/content");
const Interaction=require("../models/interaction");
const tmdbService = require('../services/tmdbService');
const itunesService = require('../services/itunesService');
const googleBooksService = require('../services/googleBooksService');

//Manual
async function createContent(req,res){
    try{
        const {type,title,description,releaseDate,creators,metadata,images,externalIds} = req.body;
        if(!type || !title){
            return res.status(400).json({
                success:false,
                message:"Type and title are required!",
            });
        }

        const existing=await Content.findOne({type,title});
        if(existing){
            return res.status(409).json({
                success: false,
                message: "Content already exists",
            });
        }

        const content=await Content.create({
            type,
            title,
            description,
            releaseDate,
            creators,
            metadata,
            images,
            externalIds,
        });
        
        res.status(201).json({
            success: true,
            message: "Content created successfully",
            data: {content},
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: "Server error while creating content",
        });
    }
}

async function getAllContent(req,res) {
    try{
        const {
            type,
            search,
            page = 1,
            limit = 20, //default items per page
            sort = "-createdAt", //newest first
        }=req.query; //Pulls everything for URL: api/content?type=movie&search=batman&page=2&limit=10

        const query={}; //empty dynamic mongodb query
        if (type) {
            query.type = type; //add type to query
        }
        if(search){
            query.$text={$search:search}; //searching for tokenized text thru indexing
        }

        const skip = (Number(page) - 1) * Number(limit); //Pagination: page 1, limit 20 → skip 0
        
        const [content, totalItems] = await Promise.all([ //running query parallely
            Content.find(query) //using indexing
                    .sort(sort) //newest first by default
                    .skip(skip) //skip the items
                    .limit(Number(limit)), //limit items
            Content.countDocuments(query), //total items
        ]);

        res.json({
            success: true,
            data: {
                content, 
                pagination:{ //for frontend
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalItems / limit),
                    totalItems,
                    itemsPerPage: Number(limit),
                },
            },
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: "Failed to fetch content",
        });
    }
}

async function getContentById(req,res) {
    try{
        const {id}=req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid content ID format",
            });
        }

        const content=await Content.findById(id);
        if(!content){
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        res.json({
            success: true,
            data: { content },
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: "Server error while getting content by id",
        });
    }
}

async function updateContent(req,res) {
    try{
        const {id}=req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid content ID format",
            });
        }

        const updates={...req.body};
        //Can't update the following
        delete updates.type;
        delete updates._id;
        delete updates.createdAt;

        const content = await Content.findByIdAndUpdate(
            id, //id
            updates, //change updates
            { new: true, //returns new updates
            runValidators: true } //enforces schema rules on updates
        );
        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        res.json({
            success: true,
            message: "Content updated successfully",
            data: { content },
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: "Server error while updating content",
        });
    }
}

async function deleteContent(req,res){
    try{
        const {id}=req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid content ID format",
            });
        }

        const content = await Content.findByIdAndDelete(id);
        if (!content) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        await Interaction.deleteMany({ contentId: id }); //delete all interactions related to the content
        res.json({
            success: true,
            message: "Content and related interactions deleted",
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: "Server error while deleting content",
        });
    }
}

async function searchContent(req,res){ //combine text score + popularity
    try{
        const {q} = req.query; //Pulling query from URL
        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                message: "Search query must be at least 2 characters"
            });
        }

        const results=await Content.find(
            { $text: { $search: q } }, //Search indexed text fields for the words in q
            { score: { $meta: "textScore" } } //tells mongo to calculate, return a relevance score for each document
        ).sort({ score: { $meta: "textScore" } }); //highest score on top

        res.json({
            success: true, 
            data: { results }
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: "Server error while searching content",
        });
    }
}

async function getUserLibrary(req,res){
    try{
        const userId=req.user._id;
        const {type, sort = "createdAt", page = 1, limit = 20} = req.query;

        const pageNumber=Math.max(parseInt(page),1);
        const pageSize=Math.min(parseInt(limit),20);
        const skip=(pageNumber-1)*pageSize;

        const matchStage={
            userId: new mongoose.Types.ObjectId(userId),
            type: 'rate' 
        };

        const pipeline=[
            {$match: matchStage}, //Only look for this user's docs
            {
                $lookup:{ //Joins equivalent
                    from:"contents", //Mongo Table name
                    localField:"contentId", //Interaction.contentId=Content._id
                    foreignField:"_id",
                    as:"content",//returns new array 'content' of joined values
                },
            },
            {$unwind:"$content"}, //converts the array to plain object, removes broken joins
        ];

        if (type && type !== 'all') {
            pipeline.push({
                $match: { 'content.type': type } //type
            });
        }

        //Sorting
        if(sort==="rating"){
            pipeline.push({$sort:{rating:-1}}); //highest rating
        }
        else if(sort==="title"){
            pipeline.push({$sort:{'content.title': 1}}); //A-Z
        }
        else{
            pipeline.push({$sort:{createdAt:-1}}); //Latest Interactions
        }

        //Pagination
        pipeline.push(
            {$skip:skip},
            {$limit:pageSize},
        );

        //Final response
        pipeline.push({
            $project:{
                _id: 0,
                rating: '$value',  // map value to rating for frontend
                isFavorite: false,   // check if type is 'like'
                createdAt: 1,
                content:{
                    _id: 1,
                    type: 1,
                    title: 1,
                    images: 1,
                    releaseDate: 1,
                    metadata: 1,
                    creators:1,
                },
            },
        });

        const totalCount = await Interaction.countDocuments(matchStage);

        //Aggregation
        const library=await Interaction.aggregate(pipeline); 
        if (library.length === 0 && pageNumber === 1) {
            return res.status(200).json({
                success: true,
                message: "Your library is empty. Start by searching for content!",
                data: [],
            });
        }

        res.status(200).json({
            success: true,
            page: pageNumber,
            totalPages: Math.ceil(totalCount / pageSize),
            totalItems: totalCount,
            itemsPerPage: pageSize,
            data: library,
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({
        success: false,
        message: "Failed to fetch user library",
        });
    }
}

async function rateContent(req,res){
    try{
        const userId=req.user._id;

        const {contentId}=req.params;
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid content ID",
            });
        }

        const {rating}=req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        const contentExists=await Content.findById(contentId);
        if(!contentExists){
            return res.status(404).json({
                success:false,
                message:"Content not found",
            });
        }
        
         // Upsert interaction
        const interaction = await Interaction.findOneAndUpdate(
            { //filter: find the docs
                userId,
                contentId,
                type:"rate"
            },
            { //update: set -> only update rating, everything else remains
                $set: {
                    type: 'rate',
                    value: rating
                },
            },
            { 
                new: true, //By default, Mongo returns old, we return new
                upsert: true, //If document exists → update it, NOT exist → insert a new one
                setDefaultsOnInsert: true, //only for new docs -> ensures schema rules apply
            }  
        );

        res.status(200).json({
            success: true,
            message: "Rating saved",
            data: interaction,
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to rate content",
        });
    }
}

async function toggleFavorite (req,res){
    try{
        const userId=req.user._id;

        const {contentId}=req.params;
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid content ID",
            });
        }

        const contentExists = await Content.findById(contentId);
        if (!contentExists) {
            return res.status(404).json({
                success: false,
                message: "Content not found",
            });
        }

        let interaction = await Interaction.findOne({ userId, contentId , type:"like"});
        let isFavorite;

        if (!interaction) {
        // No interaction → create with favorite = true
            interaction = await Interaction.create({
                userId,
                contentId,
                type: 'like',
                value: 1,
            });
            isFavorite=true;
        } else {
            // Remove like (delete the interaction)
            await Interaction.deleteOne({ _id: interaction._id });
            isFavorite=false;
        }
        
        res.status(200).json({
            success: true,
            message: isFavorite ? "Added to favorites" : "Removed from favorites",
            data: { isFavorite },
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to toggle favorite",
        });
    }
}

//TMDB: Movies
async function searchMovies(req,res){
    try{
        const {q}=req.query;
        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const results=await tmdbService.searchMovies(q);
        return res.json({
            success: true,
            data: {
                results: results.map(movie => ({
                externalId: movie.tmdbId,
                title: movie.title,
                subtitle: movie.releaseDate?.split('-')[0] || 'Unknown Year',
                year: movie.releaseDate?.split('-')[0] || null,
                thumbnail: movie.posterPath
                    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` 
                    : null
                }))
            }
        });
    }
    catch(err){
        console.error('Movie search error:', err.message);
        //503 communicates dependency failure, while 500 indicates internal server failure.
        res.status(503).json({
            success: false,
            message: 'Movie search service unavailable'
        });
    }
}

async function enrichMovie(req,res) {
    try{
        const {tmdbId}=req.params;

        const existing=await Content.findOne({
            'externalIds.tmdb':tmdbId
        });
        if (existing) {
            return res.json({
                success: true,
                data: { content: existing }
            });
        }

        const movie=await tmdbService.getMovieDetails(tmdbId);
        const content=await Content.create(movie);

        return res.status(201).json({
            success: true,
            data: { content }
        });
    }
    catch(err){
        console.error('Movie enrichment error:', err.message);
        res.status(503).json({
            success: false,
            message: 'Movie enrichment failed'
        });
    }
}

//iTunes: Songs
async function searchSongs (req,res) {
    try{
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const results = await itunesService.searchSongs(q);

        return res.json({
            success: true,
            data: {
                results: results.map(song => ({
                externalId: song.itunesId,
                title: song.title,
                subtitle: song.artist,
                thumbnail: song.artwork
                }))
            }
        });
    }
    catch(err){
        console.error('Song search error:', err.message);
        res.status(503).json({
            success: false,
            message: 'Song search service unavailable'
        });
    }
}

async function enrichSong(req,res){
    try {
        const { itunesId } = req.params;

        const existing = await Content.findOne({
            'externalIds.itunes': itunesId
        });

        if (existing) {
            return res.json({
                success: true,
                data: { content: existing }
            });
        }

        const song = await itunesService.getSongDetails(itunesId);
        const content = await Content.create(song);

        return res.status(201).json({
            success: true,
            data: { content }
        });
    } 
    catch (err) {
        console.error('Song enrichment error:', err.message);
        res.status(503).json({
            success: false,
            message: 'Song enrichment failed'
        });
    }
}

//GoogleBooks: Books
async function searchBooks(req,res){
    try{
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const results = await googleBooksService.searchBooks(q);

        return res.json({
            success: true,
            data: {
                results: results.map(book => ({
                    externalId: book.googleBooksId,
                    title: book.title,
                    subtitle: book.authors?.join(', ') || null,
                    thumbnail: book.thumbnail
                }))
            }
        });
    }
    catch(err){
        console.error('Book search error:', err.message);
        res.status(503).json({
            success: false,
            message: 'Book search service unavailable'
        });
    }
}

async function enrichBook(req,res){
    try{
        const { googleBooksId } = req.params;

        const existing = await Content.findOne({
            'externalIds.googleBooks': googleBooksId
        });

        if (existing) {
            return res.json({
                success: true,
                data: { content: existing }
            });
        }

        const book = await googleBooksService.getBookDetails(googleBooksId);
        const content = await Content.create(book);

        return res.status(201).json({
            success: true,
            data: { content }
        });
    }
    catch(err){
        console.error('Book enrichment error:', err.message);
        res.status(503).json({
            success: false,
            message: 'Book enrichment failed'
        });
    }
}


module.exports={
    createContent,getAllContent,getContentById,updateContent,deleteContent,searchContent,
    getUserLibrary, rateContent,toggleFavorite ,
    searchMovies,enrichMovie,searchSongs,enrichSong,searchBooks,enrichBook
};