import React, { useState, useEffect, useRef } from 'react';
import PostCard from "../PostCard/PostCard.jsx";
import "./Gallery.css";

function Gallery({ refreshKey }) {
    const [images, setImages] = useState([]);
    const [nextStartAfter, setNextStartAfter] = useState(null); // { id, likes } or null
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [sortOrder, setSortOrder] = useState("date");
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const observerRef = useRef(null);
    const isFetchingRef = useRef(false);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://kdidp.art";

    const fetchImages = async (startAfter = null) => {
        if (isFetchingRef.current || !hasMore) return;
        isFetchingRef.current = true;
        setIsLoading(true);

        try {
            const params = new URLSearchParams({ limit: "5", sort: sortOrder });
            if (startAfter?.id) {
                params.append("start_after_id", startAfter.id);
                if (sortOrder === "likes" && startAfter.likes !== undefined) {
                    params.append("start_after_likes", startAfter.likes);
                }
            }

            const response = await fetch(`${apiBaseUrl}/api/core/images?${params.toString()}`);
            const data = await response.json();


            setImages((prev) => {
                const newImages = data.images.filter(
                    (img) => !prev.some((p) => p.submission_id === img.submission_id)
                );
                return [...prev, ...newImages];
            });

            if (data.next_start_after_id) {
                const next = { id: data.next_start_after_id };
                if (sortOrder === "likes" && data.next_start_after_likes !== undefined) {
                    next.likes = data.next_start_after_likes;
                }
                setNextStartAfter(next);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    };

    const handleSortChange = (newSort) => {
        setSortOrder(newSort);
        setImages([]);
        setNextStartAfter(null);
        setHasMore(true);
        setSortMenuOpen(false);
    };

    // Reset and fetch on sortOrder or refreshKey change
    useEffect(() => {
        // Reset state on refreshKey change to ensure fresh data is fetched
        setImages([]);
        setNextStartAfter(null);
        setHasMore(true);

        // Fetch new images
        fetchImages();
    }, [sortOrder, refreshKey]);  // Trigger on sortOrder or refreshKey change


    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    fetchImages(nextStartAfter);
                }
            },
            { threshold: 0.1 }
        );

        if (observerRef.current) observer.observe(observerRef.current);
        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [nextStartAfter, hasMore, isLoading]);

    return (
        <div className="quotes-container">
            <div className="quotes-header">
                <h2 className="section-title">Recent Submissions</h2>
                <div className="sort-wrapper">
                    <button className="sort-button" onClick={() => setSortMenuOpen(!sortMenuOpen)}>
                        <svg
                            className="filter-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M3 5h18v2H3V5zm4 6h10v2H7v-2zm2 6h6v2H9v-2z"/>
                        </svg>
                    </button>
                    {sortMenuOpen && (
                        <div className="sort-menu">
                            <button
                                className={`sort-option ${sortOrder === 'date' ? 'selected' : ''}`}
                                onClick={() => handleSortChange('date')}
                            >
                                Date
                            </button>
                            <div
                                className={`sort-option ${sortOrder === 'likes' ? 'selected' : ''}`}
                                onClick={() => handleSortChange('likes')}
                            >
                                Likes
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="quotes-boxes">
                {images.map((img) => (
                    <PostCard
                        key={img.submission_id}
                        submission_id={img.submission_id}
                        imageUrl={img.thumbnail_url}
                        downloadUrl={img.image_url}
                        timestamp={img.timestamp}
                        likes={img.likes}
                    />
                ))}
                <div ref={observerRef} style={{ height: "20px" }} />
                {isLoading && <p>Loading...</p>}
            </div>
        </div>
    );
}

export default Gallery;