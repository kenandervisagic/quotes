import React from 'react';

function Gallery({ images }) {
    return (
        <div className="quotes-container">
            <h2 className="section-title">Recent Submissions</h2>
            <div className="quotes-boxes">
                {images.length > 0 ? (
                    images.map((imageUrl, index) => (
                        <div key={index} className="quote-box">
                            <img
                                src={imageUrl}
                                alt={`Submission ${index + 1}`}
                                className="quote-image"
                            />
                        </div>
                    ))
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
}

export default Gallery;