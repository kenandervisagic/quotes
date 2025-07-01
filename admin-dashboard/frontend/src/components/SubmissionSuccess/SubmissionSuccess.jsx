import React from 'react';
import "./SubmissionSuccess.css"

function SubmissionSuccess({userImageUrl, isRateLimited, countdown, onSubmitAnother}) {

    const handleDownload = async () => {
        try {
            const response = await fetch(userImageUrl, {mode: 'cors'});
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
        <div className="thank-you-message">
            <h3>Thank you for your message!</h3>
            <p>Your words have been left behind.</p>

            {userImageUrl && (
                <div>
                    <img src={userImageUrl} alt="Generated Quote" className="user-image"/>
                </div>
            )}
            <div className="button-container">
                <button
                    onClick={handleDownload}
                    className="submit-button-again"
                >
                    Download
                </button>
                <p>or</p>
                <button
                    onClick={onSubmitAnother}
                    className="submit-button-again"
                    disabled={isRateLimited}
                >
                    {isRateLimited
                        ? `Please wait ${Math.ceil(countdown / 1000)} seconds`
                        : "Submit another message"}
                </button>
            </div>

        </div>
    );
}

export default SubmissionSuccess;