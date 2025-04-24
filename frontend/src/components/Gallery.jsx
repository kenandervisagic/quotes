import React, { useState, useEffect, useRef } from 'react';

function Gallery({ refreshKey }) {
    const [images, setImages] = useState([]);
    const [nextStartAfter, setNextStartAfter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef(null);
    const isFetchingRef = useRef(false); // Track ongoing fetch
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://kdidp.art/api/v1';

    const fetchImages = async (startAfter = null) => {
        if (isFetchingRef.current || isLoading) return; // Prevent concurrent fetches
        isFetchingRef.current = true;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ limit: '10' });
            if (startAfter) {
                params.append('start_after', startAfter);
            }
            const response = await fetch(`${apiBaseUrl}/images?${params.toString()}`);
            const data = await response.json();

            // Deduplicate images by filtering out duplicates
            setImages((prev) => {
                const newImages = data.images.filter((url) => !prev.includes(url));
                return [...prev, ...newImages];
            });

            if (data.next_start_after) {
                setNextStartAfter(data.next_start_after);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
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
            { threshold: 1.0 }
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
            <h2 className="section-title">Recent Submissions</h2>
            <div className="quotes-boxes">
                {images.map((imageUrl) => (
                    <div key={imageUrl} className="quote-box">
                        <img src={imageUrl} alt="Submission" className="quote-image" />
                    </div>
                ))}
                {hasMore && (
                    <div
                        ref={observerRef}
                        style={{ height: '20px', background: 'transparent' }}
                    ></div>
                )}
                {isLoading && <p>Loading more images...</p>}
            </div>
        </div>
    );
}

export default Gallery;