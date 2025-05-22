import React, {useEffect, useRef, useState} from 'react';
import PostCard from "../PostCard/PostCard.jsx";
import "./Gallery.css";
import SnackBar from "../SnackBar/SnackBar.jsx";

function Gallery() {
    const [images, setImages] = useState([]);
    const [nextStartAfter, setNextStartAfter] = useState(null); // { id, likes } or null
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [sortOrder, setSortOrder] = useState("date");
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const observerRef = useRef(null);
    const isFetchingRef = useRef(false);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://kdidp.art";

    const fetchImages = async (startAfter = null) => {
        if (isFetchingRef.current || !hasMore || fetchError) return; // 👈 block on error
        isFetchingRef.current = true;
        setIsLoading(true);

        try {
            const params = new URLSearchParams({ sort: sortOrder });
            if (startAfter?.id) {
                params.append("start_after_id", startAfter.id);
                if (sortOrder === "likes" && startAfter.likes !== undefined) {
                    params.append("start_after_likes", startAfter.likes);
                }
            }

            const response = await fetch(`${apiBaseUrl}/api/core/images?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch"); // ✅ catch non-200s
            const data = await response.json();

            setImages((prev) => {
                const newImages = data.images.filter(
                    (img) => !prev.some((p) => p.submission_id === img.submission_id)
                );
                return [...prev, ...newImages];
            });

            if (data.next_start_after_id) {
                const next = {id: data.next_start_after_id};
                if (sortOrder === "likes" && data.next_start_after_likes !== undefined) {
                    next.likes = data.next_start_after_likes;
                }
                setNextStartAfter(next);
            } else {
                setHasMore(false);
            }

            setFetchError(false); // ✅ reset error if successful
        } catch (error) {
            console.error("Fetch error:", error);
            setFetchError(true); // ✅ block future fetches
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    };

    const handleSortChange = (newSort) => {
        setSortOrder(newSort);
        setImages([]); // Reset images when sort order changes
        setNextStartAfter(null);
        setHasMore(true);
        setSortMenuOpen(false);
    };

    // Reset and fetch on sortOrder change
    useEffect(() => {
        // Reset state on sortOrder change to ensure fresh data is fetched
        setImages([]);
        setNextStartAfter(null);
        setHasMore(true);

        // Fetch new images
        fetchImages();
    }, [sortOrder]); // Trigger on sortOrder change

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && !fetchError) {
                    fetchImages(nextStartAfter);
                }
            },
            {threshold: 0.1}
        );

        if (observerRef.current) observer.observe(observerRef.current);
        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [nextStartAfter, hasMore, isLoading]);

    return (
        <div className="quotes-container">
            <div className="quotes-header">
                <h2 className="section-title">Submissions</h2>
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
                                Recent
                            </button>
                            <div
                                className={`sort-option ${sortOrder === 'likes' ? 'selected' : ''}`}
                                onClick={() => handleSortChange('likes')}
                            >
                                Popular
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="quotes-boxes">
                {images.map((img) => (
                    <React.Fragment key={img.submission_id}>
                        <PostCard
                            submission_id={img.submission_id}
                            imageUrl={img.thumbnail_url}
                            username={img.username}
                            timestamp={img.timestamp}
                            likes={img.likes}
                        />
                    </React.Fragment>
                ))}

                <div ref={observerRef} style={{height: "20px"}}/>
            </div>
            {
                isLoading && <p>Loading...</p>
            }
            {
                fetchError && <SnackBar message="Something went wrong. Please try again." severity="error"/>
            }
        </div>
    );
}

export default Gallery;
