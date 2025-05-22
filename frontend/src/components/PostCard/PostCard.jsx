import React, {useEffect, useState} from 'react';
import './PostCard.css';
import noImage from '../../assets/no-picture.jpg'
import {formatDate} from "../../utils/dateFormat.js";

function PostCard({imageUrl, likes, timestamp, submission_id, username, setIsDownloaded, setError, setIsCopied}) {
    const [liked, setLiked] = useState(false);
    const [currentLikes, setCurrentLikes] = useState(likes);
    const [animateLike, setAnimateLike] = useState(false);
    const [animateShare, setAnimateShare] = useState(false);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://kdidp.art';

    useEffect(() => {
        const stored = localStorage.getItem(`liked_${imageUrl}`);
        setLiked(stored === 'true');
    }, [imageUrl]);

    const toggleLike = async () => {
        const newLiked = !liked;
        const likeAction = newLiked ? 'increase' : 'decrease';

        try {
            const response = await fetch(`${apiBaseUrl}/api/core/like?submission_id=${submission_id}&like_action=${likeAction}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to update likes');
            }

            const result = await response.json();

            // Only update state and localStorage if request succeeds
            setLiked(newLiked);
            localStorage.setItem(`liked_${imageUrl}`, newLiked);
            setCurrentLikes(result.likes);

            if (newLiked) {
                setAnimateLike(true);
                setTimeout(() => setAnimateLike(false), 300);
            }

        } catch (error) {
            console.error("Error updating likes:", error);
            setError("Failed to like. Please try again.")
            setTimeout(() => setError(""), 3000);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(imageUrl); // Copy the image URL to clipboard
            setAnimateShare(true);
            setTimeout(() => setAnimateShare(false), 300);
            setIsCopied(true)// Show "Copied" feedback
            setTimeout(() => setIsCopied(false), 3000);
        } catch (err) {
            console.error("Failed to copy to clipboard", err);
            setError("Failed to copy to clipboard. Please try again.")
            setTimeout(() => setError(""), 3000);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl, {mode: 'cors'});
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'image'; // you can generate dynamically
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl); // cleanup

            setIsDownloaded(true)// Show "Copied" feedback
            setTimeout(() => setIsDownloaded(false), 3000);
        } catch (err) {
            console.error("Download failed:", err);
            setError("Failed to download. Please try again.");
            setTimeout(() => setError(""), 3000);
        }
    };

    return (
        <>
            <div className="post-card">
                <div className="post-card-header">
                    <div className="post-card-header-inline">
                        <img src={noImage} alt="profile-picture"/>
                        <p>{username}</p>
                    </div>
                </div>
                <img src={imageUrl} alt="Submission" className="post-image"/>
                <div className="post-actions">
                    <div className="post-actions-left">
                        <button
                            onClick={toggleLike}
                            className={`like-button ${liked ? 'liked' : ''} ${animateLike ? 'pop' : ''}`}
                            aria-label="Like button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="heart-icon">
                                <path
                                    d="M12 21c-4.2-3.6-7-6.4-8.4-8.7C2.7 10.2 2 8.6 2 7a5 5 0 0110 0 5 5 0 0110 0c0 1.6-.7 3.2-1.6 5.3C19 14.6 16.2 17.4 12 21z"
                                    fill={liked ? '#ed4956' : 'none'}
                                    stroke={liked ? '#ed4956' : '#888'}
                                    strokeWidth="2"
                                />
                            </svg>
                            <span className="like-count">{currentLikes}</span>
                        </button>

                        <button
                            onClick={handleShare}
                            className={`share-button ${animateShare ? 'pop' : ''}`}
                            aria-label="Share button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#888"
                                 viewBox="0 0 24 24">
                                <path
                                    d="M19 22H5c-1.654 0-3-1.346-3-3V8h2v11c0 .552.449 1 1 1h14c.552 0 1-.448 1-1v-2h2v2C22 20.654 20.654 22 19 22zM16.707 11.707L15.293 10.293 18.586 7 15.293 3.707 16.707 2.293 21.414 7z"></path>
                                <path d="M8,18H6v-1c0-6.065,4.935-11,11-11h3v2h-3c-4.963,0-9,4.037-9,9V18z"></path>
                            </svg>
                        </button>
                    </div>

                    <button onClick={handleDownload} className="download-button" aria-label="Download button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#888" viewBox="0 0 24 24">
                            <path
                                d="M12 16a1 1 0 0 1-.7-.3l-5-5 1.4-1.4L11 12.59V3h2v9.59l3.3-3.3 1.4 1.42-5 5a1 1 0 0 1-.7.29zM5 18h14v2H5z"/>
                        </svg>
                    </button>
                </div>
                <div className="post-meta">
                    <span className="post-date">{formatDate(timestamp)}</span>
                </div>
            </div>
        </>
    );
}

export default PostCard;
