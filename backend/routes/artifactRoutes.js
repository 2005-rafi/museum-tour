const express = require('express');
const router = express.Router();
const Artifact = require('../models/Artifact');

// Get all artifacts or filter by museum
router.get('/api/v1/artifacts', async (req, res) => {
    try {
        console.log('Fetching artifacts...');
        // Get all artifacts without filtering by museum
        const artifacts = await Artifact.find({});
        
        console.log('Found artifacts:', artifacts);

        if (!artifacts || artifacts.length === 0) {
            return res.status(404).json({ success: false, message: 'No artifacts found' });
        }

        // Format the response
        const formattedArtifacts = artifacts.map(artifact => ({
            _id: artifact._id,
            name: artifact.name,
            description: artifact.description,
            origin: artifact.origin || 'Unknown',
            category: artifact.category || 'Uncategorized',
            imageUrl: artifact.imageUrl || artifact.image || '',  // handle both possible field names
        }));

        res.status(200).json({ 
            success: true, 
            count: formattedArtifacts.length,
            data: formattedArtifacts 
        });
    } catch (error) {
        console.error('Error fetching artifacts:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Get single artifact
router.get('/api/v1/artifacts/:id', async (req, res) => {
    try {
        const artifact = await Artifact.findById(req.params.id);
        if (!artifact) {
            return res.status(404).json({ success: false, message: 'Artifact not found' });
        }
        res.status(200).json({ 
            success: true, 
            data: {
                _id: artifact._id,
                name: artifact.name,
                description: artifact.description,
                origin: artifact.origin || 'Unknown',
                category: artifact.category || 'Uncategorized',
                imageUrl: artifact.imageUrl || artifact.image || '',
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Create artifact
router.post('/api/v1/artifacts', async (req, res) => {
    try {
        const { name, description, origin, category, museum, images } = req.body;
        if (!name || !description || !origin || !category || !museum) {
            return res.status(400).json({ success: false, message: 'Name, description, origin, category, and museum are required fields' });
        }
        const newArtifact = await Artifact.create({
            name,
            description,
            origin,
            category,
            museum,
            images: images.map(img => ({ url: img.url, caption: img.caption }))
        });
        res.status(201).json({ success: true, data: newArtifact });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid data', error: error.message });
    }
});

// Update artifact
router.patch('/api/v1/artifacts/:id', async (req, res) => {
    try {
        const { name, description, origin, category, museum, images } = req.body;
        if (!name || !description || !origin || !category || !museum) {
            return res.status(400).json({ success: false, message: 'Name, description, origin, category, and museum are required fields' });
        }
        const artifact = await Artifact.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                origin,
                category,
                museum,
                images: images.map(img => ({ url: img.url, caption: img.caption }))
            },
            { new: true, runValidators: true }
        );
        if (!artifact) {
            return res.status(404).json({ success: false, message: 'Artifact not found' });
        }
        res.status(200).json({ success: true, data: artifact });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid data', error: error.message });
    }
});

// Delete artifact
router.delete('/api/v1/artifacts/:id', async (req, res) => {
    try {
        const artifact = await Artifact.findByIdAndDelete(req.params.id);
        if (!artifact) {
            return res.status(404).json({ success: false, message: 'Artifact not found' });
        }
        res.status(200).json({ success: true, message: 'Artifact deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
