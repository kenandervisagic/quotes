import React, {useState} from 'react';
import {Filter} from "bad-words";
import {isUrl} from "../utils/isUrl.js";

function MessageForm({onSubmit, isLoading, isRateLimited, error, setError}) {
    const [message, setMessage] = useState('');

    const filter = new Filter()

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
        setError(null);
    };

    // Validate message
    const isValidMessage = (text) => {
        if (!text.trim()) {
            setError("Message cannot be empty, please add your message.");
            return false;
        }
        if (text.length > 300) {
            setError("Message must be 300 characters or less, please shorten it.");
            return false;
        }
        const repeatedCharsRegex = /(.)\1{10,}/;
        if (repeatedCharsRegex.test(text)) {
            setError("Message contains too many repeated characters, please shorten it.");
            return false;
        }
        if (filter.isProfane(text)) {
            setError("Message contains bad words, please be nice.");
            return false;
        }
        if (isUrl(text)) {
            setError("Message contains urls, please remove any url from message.")
            return false;
        }
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isRateLimited || !isValidMessage(message)) {
            return;
        }
        const escapedValue = message.replace(/\n/g, '\\n'); // Replace real newlines with literal "\n"
        onSubmit(escapedValue);
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
                    className={error ? 'message-textarea error-border' : 'message-textarea'}
                    disabled={isRateLimited || isLoading}
                />
            </div>

            {error && (
                <div className="error-color error-message">
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