const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        contentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Content",
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: ["view", "like", "dislike", "rate", "share", "save", "skip", "detailed_view", "time_spent"],
        },
        value: {
            type: Number,
        },
        context: {
            source: {
                type: String,
                enum: ["recommendation", "search", "browse", "social"],
            },
            sessionId: String,
            timestamp: {
                type: Date,
                default: Date.now,
            },
            deviceType: String,
        },
    },
    {
        timestamps: true,
    }
);

// Compound Indexes
interactionSchema.index({ userId: 1, contentId: 1 });
interactionSchema.index({ userId: 1, type: 1 });
interactionSchema.index({ contentId: 1, type: 1 });
interactionSchema.index({ "context.timestamp": -1 });

const Interaction = mongoose.model("Interaction", interactionSchema);
module.exports = Interaction;
