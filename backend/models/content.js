const mongoose=require("mongoose"); 

const creatorSchema=new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String, //director, author, artist, actor, etc.
            trim: true,
        },
        externalId: {
            type: String, //optional reference to TMDB/Spotify person IDs -> to find related content
        },
    },
    { 
        _id: false, //Object Ids not required here, we're not searching for the artists -> no Document bloating 
    }
);

const contentSchema=new mongoose.Schema(
    {
        //Common for all types
        type:{
            type: String,
            required: [true, "Content type is required!"],
            enum: {
                values: ["movie", "book", "song"],
                message: "{VALUE} is not a valid content type",
            },
            index: true,
        },
        title:{
            type:String,
            required:[true, "Title is required!"],
            trim:true,
        },
        description:{
            type:String,
            default:"",
            trim:true,
        },
        releaseDate:{
            type:Date,
        },
        creators:{
            type:[creatorSchema],
            default:[],
        },
        images:{
            poster: String,
            backdrop: String,
            cover: String,
        },
        //Flexible Data Types(content-specific)
        metadata:{
            type:Map, //Dynamic Schema
            of:mongoose.Schema.Types.Mixed, //Can be of any data type
            default:()=>new Map(),
        },
        //External API Ids
        externalIds:{
            tmdb: String,
            spotify: String,
            googleBooks: String,
            imdb: String,
            isbn: String,
        },
        //AI processing and lifecycle
        processingStatus:{
            attributesExtracted:{
                type:Boolean,
                default: false,
            },
            lastProcessed:Date,
            processingVersion:String,
        },
    },
    {
        timestamps:true,
    }
);

//Indexes
contentSchema.index({title:"text"}); //Used for search bars, Mongo tokenizes words, faster search
contentSchema.index({type:1}); //Ascending Order of movies
contentSchema.index({releaseDate:-1}); //Newest movies first

const Content=mongoose.model("Content",contentSchema);
module.exports=Content;