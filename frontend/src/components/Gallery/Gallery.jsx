import React, {useState, useEffect, useRef} from 'react';
import PostCard from "../PostCard/PostCard.jsx";
import "./Gallery.css"

function Gallery({refreshKey}) {
    const [images, setImages] = useState([]);
    const [nextStartAfter, setNextStartAfter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef(null);
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState('date'); // default sort
    const isFetchingRef = useRef(false); // Track ongoing fetch
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://kdidp.art/api/v1';

    const fetchImages = async (startAfter = null) => {
        if (isFetchingRef.current || isLoading) return; // Prevent concurrent fetches
        isFetchingRef.current = true;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({limit: '5'});
            if (startAfter) {
                params.append('start_after', startAfter);  // Add the submission_id to start after this image
            }
            const response = await fetch(`${apiBaseUrl}/images?${params.toString()}`);
            const data = await response.json();

            // Deduplicate images by filtering out duplicates
            setImages((prev) => {
                const newImages = data.images.filter((image) => !prev.some((prevImage) => prevImage.submission_id === image.submission_id));
                return [...prev, ...newImages];
            });

            if (data.next_start_after) {
                setNextStartAfter(data.next_start_after);  // Set the next start after for pagination
            } else {
                setHasMore(false);  // No more images to load
            }
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    };
    const toggleSortMenu = () => {
        setSortMenuOpen((prev) => !prev);
    };

    const handleSortChange = (option) => {
        setSortOrder(option);
        setSortMenuOpen(false);
        console.log("Selected sort:", option); // For now just log
    };

    // Fetch initial images or reset on refresh
    useEffect(() => {
        setImages([]); // Reset images
        setNextStartAfter(null);
        setHasMore(true);
        fetchImages(); // Fetch initial images
    }, [refreshKey]);

    // Set up Intersection Observer for infinite scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    fetchImages(nextStartAfter);
                }
            },
            {threshold: 1.0}
        );

        const currentObserver = observerRef.current;
        if (currentObserver) {
            observer.observe(currentObserver);
        }

        return () => {
            if (currentObserver) {
                observer.unobserve(currentObserver);
            }
        };
    }, [nextStartAfter, hasMore, isLoading]);

    return (
        <div className="quotes-container">
            <div className="quotes-header">
                <h2 className="section-title">Recent Submissions</h2>

                <div className="sort-wrapper">
                    <button className="sort-button" onClick={toggleSortMenu}>
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
                            <div className="sort-option" onClick={() => handleSortChange('date')}>
                                Date
                            </div>
                            <div className="sort-option" onClick={() => handleSortChange('likes')}>
                                Popularity
                            </div>
                        </div>
                    )}
                </div>
            </div>


            <div className="quotes-boxes">
                {images.map((imageData) => (
                    <PostCard
                        submission_id={imageData.submission_id}
                        key={imageData.image_url}
                        imageUrl={imageData.image_url}
                        timestamp={imageData.timestamp}
                        likes={imageData.likes}
                    />
                ))}
                {hasMore && (
                    <div
                        ref={observerRef}
                        style={{height: '20px', background: 'transparent'}}
                    ></div>
                )}
                {isLoading && <p>Loading more images...</p>}
            </div>
        </div>
    )
        ;
}

export default Gallery;
