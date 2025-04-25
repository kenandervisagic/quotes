import React, { useState, useEffect } from 'react';
import './PostCard.css';
import {formatDate} from "../../utils/dateFormat.js";

function PostCard({ imageUrl, likes, timestamp}) {
    const [liked, setLiked] = useState(false);
    const [animateLike, setAnimateLike] = useState(false);
    const [animateShare, setAnimateShare] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(`liked_${imageUrl}`);
        setLiked(stored === 'true');
    }, [imageUrl]);

    const toggleLike = () => {
        const newLiked = !liked;
        setLiked(newLiked);
        localStorage.setItem(`liked_${imageUrl}`, newLiked);

        if (newLiked) {
            setAnimateLike(true);
            setTimeout(() => setAnimateLike(false), 300);
        }
    };

    const handleShare = () => {
        setAnimateShare(true);
        setTimeout(() => setAnimateShare(false), 300);
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl, { mode: 'cors' });
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'image.jpg'; // you can generate dynamically
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl); // cleanup
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    return (
        <div className="post-card">
            <img src={imageUrl} alt="Submission" className="post-image" />
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
                        <span className="like-count">{likes}</span>
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
    );
}

export default PostCard;
