const express = require('express');
const router = express.Router();
const Museum = require('../models/Museum');

// Get single museum by ID
router.get('/api/museums/:id', async (req, res) => {
    try {
        const museum = await Museum.findById(req.params.id).select('name description location images createdAt updatedAt');
        if (!museum) {
            return res.status(404).json({ message: 'Museum not found' });
        }
        res.json({
            success: true,
            data: {
                id: museum._id,
                name: museum.name,
                description: museum.description,
                location: museum.location,
                images: museum.images,
                createdAt: museum.createdAt,
                updatedAt: museum.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Get all museums
router.get('/api/museums', async (req, res) => {
    try {
        const museums = await Museum.find();
        res.json(museums);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new museum
router.post('/api/museums', async (req, res) => {
    const museum = new Museum({
        name: req.body.name,
        description: req.body.description,
        location: {
            address: req.body.location.address,
            city: req.body.location.city,
            state: req.body.location.state,
            country: req.body.location.country,
            zipCode: req.body.location.zipCode
        },
        images: req.body.images.map(image => ({
            url: image.url,
            caption: image.caption
        }))
    });

    try {
        const newMuseum = await museum.save();
        res.status(201).json(newMuseum);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update museum
router.patch('/api/museums/:id', async (req, res) => {
    try {
        const updates = {};
        
        // Only include fields that are present in the request body
        if (req.body.name) updates.name = req.body.name;
        if (req.body.description) updates.description = req.body.description;
        if (req.body.location) {
            updates.location = {};
            if (req.body.location.address) updates.location.address = req.body.location.address;
            if (req.body.location.city) updates.location.city = req.body.location.city;
            if (req.body.location.state) updates.location.state = req.body.location.state;
            if (req.body.location.country) updates.location.country = req.body.location.country;
            if (req.body.location.zipCode) updates.location.zipCode = req.body.location.zipCode;
        }
        if (req.body.images) {
            updates.images = req.body.images.map(image => ({
                url: image.url,
                caption: image.caption
            }));
        }

        const museum = await Museum.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!museum) {
            return res.status(404).json({ 
                success: false,
                message: 'Museum not found' 
            });
        }

        res.json({
            success: true,
            data: museum
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Delete museum
router.delete('/api/museums/:id', async (req, res) => {
    try {
        const museum = await Museum.findById(req.params.id);
        if (!museum) {
            return res.status(404).json({ message: 'Museum not found' });
        }
        await museum.deleteOne(); // Using deleteOne() instead of remove() as it's deprecated
        res.json({ message: 'Museum deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
