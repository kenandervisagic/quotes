import React, { useState } from 'react';

function MessageForm({ onSubmit, isLoading, isRateLimited, error, setError }) {
    const [message, setMessage] = useState('');

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
        setError(null);
    };

    // Validate message
    const isValidMessage = (text) => {
        if (!text.trim()) {
            setError("Message cannot be empty.");
            return false;
        }
        if (text.length > 500) {
            setError("Message must be 500 characters or less.");
            return false;
        }
        const repeatedCharsRegex = /(.)\1{10,}/;
        if (repeatedCharsRegex.test(text)) {
            setError("Message contains too many repeated characters.");
            return false;
        }
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isRateLimited || !isValidMessage(message)) {
            return;
        }
        onSubmit(message);
        setMessage('');
    };

    return (
        <form onSubmit={handleSubmit} className="message-form">
            <div className="textarea-container">
                <textarea
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Write your anonymous message..."
                    rows="5"
                    className="message-textarea"
                    disabled={isRateLimited || isLoading}
                />
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {isRateLimited && (
                <div className="rate-limit-message">
                    <p>You have hit the limit. Please come back later.</p>
                </div>
            )}

            <button
                type="submit"
                className="submit-button"
                disabled={isRateLimited || isLoading}
            >
                {isLoading ? "Processing..." : "Submit"}
            </button>
        </form>
    );
}

export default MessageForm;