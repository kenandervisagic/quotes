import Gallery from "../../components/Gallery/Gallery.jsx";
import React, {useState} from "react";
import SnackBar from "../../components/SnackBar/SnackBar.jsx";

function BrowsePage() {
    const [isDownloaded, setIsDownloaded] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [error, setError] = useState("")

    return (
        <>
            <main className="gallery">
                <Gallery isDownloaded={isDownloaded} isCopied={isCopied} error={error} setIsDownloaded={setIsDownloaded}
                         setIsCopied={setIsCopied} setError={setError}/>
            </main>
            {isDownloaded && <SnackBar severity="success" message="Image downloaded."/>}
            {isCopied && <SnackBar severity="success" message="Image copied to clipboard."/>}
            {error && <SnackBar severity="error" message={error}/>}
        </>
    );
}

export default BrowsePage;