// const mongoose = require("mongoose");
import mongoose from 'mongoose'
const { Schema } = mongoose;

const repositorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    description: {
        type: String,
        default: ""
    },

    content: {
        type: String,
        default: ""
    },

    visibility: {
        type: Boolean,
        default: true
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    issues: [
        {
            type: Schema.Types.ObjectId,
            ref: "Issue"
        }
    ]
});

const Repository = mongoose.model("Repository", repositorySchema);

export default Repository;