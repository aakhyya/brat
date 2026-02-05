const mongoose=require("mongoose");
const Content=require("../models/content");
const Interaction=require("../models/interaction");

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

async function updateContent(req,res) {
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

async function deleteContent(req,res){
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

async function searchContent(req,res){ //combine text score + popularity
    const {q} = req.query; //Pulling query from URL
    if(!q){
        return res.status(400).json({
            success: false,
            message: "Search query is required",
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

module.exports={createContent,getAllContent,getContentById,updateContent,deleteContent,searchContent};