import Gallery from "../../components/Gallery/Gallery.jsx";
import React from "react";

function BrowsePage() {
    return (
        <>
            <title>Browse Anonymous Art - KDidP Art</title>
            <meta name="description" content="Explore thousands of anonymous thoughts transformed into beautiful visual art. Discover stories that resonate with you." />
            <link rel="canonical" href="https://kdidp.art/browse" />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content="Browse Anonymous Art - KDIDP Art" />
            <meta property="og:description" content="Explore thousands of anonymous thoughts transformed into beautiful visual art." />
            <meta property="og:url" content="https://kdidp.art/browse" />
            <main className="gallery">
                <Gallery />
            </main>
        </>

    );
}

export default BrowsePage;