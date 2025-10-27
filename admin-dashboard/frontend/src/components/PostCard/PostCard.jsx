import React, { useState, useEffect } from 'react';
import './PostCard.css';
import noImage from '../../assets/no-picture.jpg'
import { formatDate } from "../../utils/dateFormat.js";
function PostCard({ imageUrl, likes, timestamp, submission_id, downloadUrl, username, onDelete }) {

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://internal.thewordsleftbehind.com';

    const handleDelete = async () => {
        if (!submission_id) {
            console.error("Submission ID is missing.");
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/admin/delete?submission_id=${submission_id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Deleted:", data.message || "Successfully deleted.");
                if (onDelete) onDelete(submission_id);
            } else {
                console.error("Delete failed:", data.detail || "Unknown error.");
            }
        } catch (error) {
            console.error("Error deleting submission:", error);
        }
    };


    return (
        <div className="post-card">
            <div className="post-card-header">
                <div className="post-card-header-inline">
                    <img src={noImage} alt="profile-picture" />
                    <p>{username}</p>
                </div>
            </div>
            <img src={imageUrl} alt="Submission" className="post-image" />
            <div className="post-actions">
                <div className="post-actions-left">
                    <button onClick={handleDelete} className="delete-button">Delete </button>

                </div>
            </div>
            <div className="post-meta">
                <span className="post-date">{formatDate(timestamp)}</span>
            </div>
        </div>
    );
}

export default PostCard;
