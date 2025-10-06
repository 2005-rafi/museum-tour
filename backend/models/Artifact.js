const mongoose = require('mongoose');

const artifactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    origin: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    museum: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Museum',
        required: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Artifact', artifactSchema);
