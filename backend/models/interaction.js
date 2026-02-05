//Content Model: what exists?
//Interaction Model: what do users do with it, how often, in what context, and when?
const mongoose=require("mongoose");

const interactionSchema=new mongoose.Schema(
    {
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        contentId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Content",
            required: true,
            index: true,
        },
        type:{
            type:String,
            required:true,
            enum:["view","like","dislike","rate","share","save","skip","detailed_view","time_spent"],//to avoid typos
        },
        value:{ //Eg.: rate: 5 -> avg(value) WHERE type = "rate"
            type:Number,
            required:true,
        },
        context: {//under what conditions an interaction happened
            source:{
                type: String,
                enum: ["recommendation", "search", "browse", "social"],
            },
            sessionId: String, //group interactions that happened together -> recommendation sequencing
            timestamp: {//createdAt → when Mongo saved the document
                type: Date,// context.timestamp → when the event actually happened
                default: Date.now,
            },
            deviceType: String, //phone, laptop etc.
        },
    },
    {
        timestamps:true,
    },
);

//Compound Indexes(for multifield query): Indexes consume memory -> too many indexes slow writes
interactionSchema.index({userId:1 , contentId:1});//Did user X interact with content Y?
interactionSchema.index({userId:1 ,type:1});//All likes by user X
interactionSchema.index({contentId:1 ,type:1});//All ratings for this content
interactionSchema.index({"context.timestamp":-1});//Recent interactions

const Interaction=mongoose.model("Interaction",interactionSchema);
module.exports=Interaction;