import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/artifacts.css';

function Artifacts() {
    const [artifacts, setArtifacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArtifacts = async () => {
            try {
                setLoading(true);
                console.log('Fetching all artifacts...');

                const response = await axios.get('http://localhost:5000/api/v1/artifacts');
                console.log('Artifacts response:', response.data);

                if (response.data.success) {
                    setArtifacts(response.data.data);
                } else {
                    setError('Failed to fetch artifacts');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching artifacts:', err);
                setError(err.response?.data?.message || 'Failed to fetch artifacts');
                setLoading(false);
            }
        };

        fetchArtifacts();
    }, []);

    const handleImageError = (e) => {
        e.target.src = '/placeholder-artifact.jpg';
    };

    if (loading) {
        return (
            <div className="artifacts-loading">
                <div className="loading-spinner">Loading artifacts...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="artifacts-error">
                <h2>Error Loading Artifacts</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!artifacts || artifacts.length === 0) {
        return (
            <div className="no-artifacts">
                <h2>No Artifacts Found</h2>
                <p>There are no artifacts available in the collection.</p>
            </div>
        );
    }

    // Group artifacts by category
    const groupedArtifacts = artifacts.reduce((acc, artifact) => {
        const category = artifact.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(artifact);
        return acc;
    }, {});

    return (
        <div className="artifacts-page">
            <div className="museum-header">
                <h1>Museum Artifacts Collection</h1>
                <p className="museum-description">
                    Explore our diverse collection of historical artifacts from around the world
                </p>
            </div>

            {Object.entries(groupedArtifacts).map(([category, categoryArtifacts]) => (
                <div key={category} className="category-section">
                    <h2 className="category-title">{category}</h2>
                    <div className="artifacts-grid">
                        {categoryArtifacts.map((artifact) => (
                            <div key={artifact._id} className="artifact-card">
                                <div className="artifact-image-container">
                                    <img
                                        src={artifact.imageUrl}
                                        alt={artifact.name}
                                        onError={handleImageError}
                                        className="artifact-image"
                                    />
                                </div>
                                <div className="artifact-info">
                                    <h3 className="artifact-name">{artifact.name}</h3>
                                    <p className="artifact-origin">Origin: {artifact.origin}</p>
                                    <p className="artifact-description">{artifact.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Artifacts;
