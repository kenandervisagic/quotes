import React, { useState, useEffect } from 'react';
import './App.css';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://kdidp.art/api/v1';

function App() {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [userImageUrl, setUserImageUrl] = useState(null);
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);

    // Rate limiting configuration
    const MAX_SUBMISSIONS = 3;
    const TIME_WINDOW = 60 * 1000; // 1 hour
    const COOLDOWN_PERIOD = 60 * 1000; // 1 hour

    // Check rate limit and fetch images on mount
    useEffect(() => {
        checkRateLimit();
        fetchImages();
    }, []);

    // Countdown timer for cooldown period
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1000);
            }, 1000);
        } else if (countdown === 0 && isRateLimited) {
            setIsRateLimited(false);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown, isRateLimited]);

    // Check if user is rate limited
    const checkRateLimit = () => {
        const submissionHistory = JSON.parse(localStorage.getItem('submissionHistory')) || [];
        const now = Date.now();
        const recentSubmissions = submissionHistory.filter(
            timestamp => now - timestamp < TIME_WINDOW
        );
        localStorage.setItem('submissionHistory', JSON.stringify(recentSubmissions));
        if (recentSubmissions.length >= MAX_SUBMISSIONS) {
            setIsRateLimited(true);
            const lastSubmissionTime = recentSubmissions[recentSubmissions.length - 1];
            const remainingCooldown = COOLDOWN_PERIOD - (now - lastSubmissionTime);
            setCountdown(remainingCooldown);
        }
    };

    // Update submission history
    const updateSubmissionHistory = () => {
        const submissionHistory = JSON.parse(localStorage.getItem('submissionHistory')) || [];
        const now = Date.now();
        submissionHistory.push(now);
        localStorage.setItem('submissionHistory', JSON.stringify(submissionHistory));
        checkRateLimit();
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isRateLimited || !isValidMessage(message)) {
            return;
        }

        setIsLoading(true);
        setError(null);

        const payload = { content: message };

        try {
            const response = await fetch(`${apiBaseUrl}/submit-message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            setIsLoading(false);

            if (response.ok) {
                setUserImageUrl(data.image_url);
                setSubmitted(true);
                setMessage('');
                updateSubmissionHistory();
                fetchImages(); // Refresh gallery
            } else {
                setError(data.error || "Failed to submit message.");
            }
        } catch (error) {
            setIsLoading(false);
            setError("Error submitting message. Please try again.");
            console.error("Error:", error);
        }
    };

    const handleSubmitAnother = () => {
        setSubmitted(false);
        setUserImageUrl(null);
        if (!isRateLimited) {
            checkRateLimit();
        }
    };

    const fetchImages = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/images`);
            const data = await response.json();
            setImages(data.images || []);
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>the words left behind</h1>
            </header>
            <main className="main-content">
                <div className="paper-card">
                    <h2 className="page-title">Submit an Anonymous Message</h2>
                    <p className="explanation">
                        This page is a safe space to share things you've never said out loud.
                        <br />
                        Your message will remain anonymous.
                    </p>
                    {submitted ? (
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
                                onClick={handleSubmitAnother}
                                className="submit-button"
                                disabled={isRateLimited}
                            >
                                {isRateLimited
                                    ? `Please wait ${Math.ceil(countdown / 1000)} seconds`
                                    : "Submit another message"}
                            </button>
                        </div>
                    ) : (
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
                    )}
                    <div className="footer-message">
                        <p>
                            Want to explore other anonymous messages? <br />
                            Check them out on our{' '}
                            <a href="https://www.tiktok.com/@the_words_left_behind" target="_blank" rel="noopener noreferrer">
                                TikTok
                            </a>{' '}
                            or{' '}
                            <a href="https://www.instagram.com/the_words_left_behind" target="_blank" rel="noopener noreferrer">
                                Instagram
                            </a>.
                        </p>
                    </div>
                </div>
                <div className="quotes-container">
                    <h2 className="section-title">Recent Submissions</h2>
                    <div className="quotes-boxes">
                        {images.length > 0 ? (
                            images.map((imageUrl, index) => (
                                <div key={index} className="quote-box">
                                    <img src={imageUrl} alt={`Submission ${index + 1}`} className="quote-image" />
                                </div>
                            ))
                        ) : ( <></>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;