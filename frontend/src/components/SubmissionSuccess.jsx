import React from 'react';

function SubmissionSuccess({ userImageUrl, isRateLimited, countdown, onSubmitAnother }) {
    return (
        <div className="thank-you-message">
            <h3>Thank you for your message!</h3>
            <p>Your words have been left behind.</p>

            {userImageUrl && (
                <div>
                    <h4>Your Image:</h4>
                    <img src={userImageUrl} alt="Generated Quote" className="user-image" />
                </div>
            )}

            <button
                onClick={onSubmitAnother}
                className="submit-button"
                disabled={isRateLimited}
            >
                {isRateLimited
                    ? `Please wait ${Math.ceil(countdown / 1000)} seconds`
                    : "Submit another message"}
            </button>
        </div>
    );
}

export default SubmissionSuccess;