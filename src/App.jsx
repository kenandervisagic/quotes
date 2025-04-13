import React, {useState, useEffect} from 'react';
import './App.css';


const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://kdidp.art/api/v1';
function App() {
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Rate limiting configuration
    const MAX_SUBMISSIONS = 3; // Maximum submissions allowed in time window
    const TIME_WINDOW =   60 * 1000; // 1 hour in milliseconds
    const COOLDOWN_PERIOD =  60 * 1000; // 1 hour cooldown period in milliseconds

    // Check if user is rate limited on component mount
    useEffect(() => {
        checkRateLimit();
    }, []);

    // Countdown timer for cooldown period
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1000); // countdown by 1 second
            }, 1000);
        } else if (countdown === 0 && isRateLimited) {
            setIsRateLimited(false); // Allow submissions after cooldown
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown, isRateLimited]);

    // Check if user is rate limited based on submission history
    const checkRateLimit = () => {
        const submissionHistory = JSON.parse(localStorage.getItem('submissionHistory')) || [];
        const now = Date.now();

        // Filter out any submissions older than 1 hour
        const recentSubmissions = submissionHistory.filter(
            timestamp => now - timestamp < TIME_WINDOW
        );

        // Update localStorage with recent submissions
        localStorage.setItem('submissionHistory', JSON.stringify(recentSubmissions));

        // Check if rate limited (if they have made 3 submissions within the last hour)
        if (recentSubmissions.length >= MAX_SUBMISSIONS) {
            setIsRateLimited(true);
            const lastSubmissionTime = recentSubmissions[recentSubmissions.length - 1];
            const remainingCooldown = COOLDOWN_PERIOD - (now - lastSubmissionTime);
            setCountdown(remainingCooldown); // Set countdown to the remaining cooldown time
        }
    };

    // Update submission history in localStorage
    const updateSubmissionHistory = () => {
        const submissionHistory = JSON.parse(localStorage.getItem('submissionHistory')) || [];
        const now = Date.now();

        // Add current timestamp
        submissionHistory.push(now);

        // Save to localStorage
        localStorage.setItem('submissionHistory', JSON.stringify(submissionHistory));

        checkRateLimit();
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    // Basic content validation
    const isValidMessage = (text) => {
        if (!text.trim()) return false;
        if (text.length > 2000) return false; // Prevent extremely long messages
        const repeatedCharsRegex = /(.)\1{10,}/; // 10+ of the same character in a row
        return !repeatedCharsRegex.test(text);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isRateLimited) {
            return;
        }

        if (!isValidMessage(message)) {
            return;
        }

        // Process submission
        console.log("Submitted message:", message);
        setMessage('');
        setSubmitted(true);

        updateSubmissionHistory();

        const payload = {
            content: message
        };

        try {
            const response = await fetch(`${apiBaseUrl}/submit-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Message sent successfully:", data);
            } else {
                console.error("Failed to send message:", data);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleSubmitAnother = () => {
        // Reset for another submission attempt if not rate-limited
        setSubmitted(false);
        if (!isRateLimited) {
            checkRateLimit();
        }
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>the words left behind</h1>
            </header>
            {/* Decorative Paintings */}
            <main className="main-content">
                <div className="paper-card">
                    <h2 className="page-title">Submit an Anonymous Message</h2>

                    <p className="explanation">
                        This page is a safe space to share things you've never said out loud.
                        <br/>
                        Your message will remain anonymous.
                    </p>

                    {submitted ? (
                        <div className="thank-you-message">
                            <h3>Thank you for your message!</h3>
                            <p>Your words have been left behind.</p>
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
                                    disabled={isRateLimited}
                                />
                            </div>

                            {isRateLimited && (
                                <div className="rate-limit-message">
                                    <p>You have hit the limit. Please come back later.</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isRateLimited }
                            >
                                Submit
                            </button>
                        </form>
                    )}
                    {/* Add TikTok link below */}
                    <div className="footer-message">
                        <p>Want to explore other anonymous messages? <br/>
                            Check them out on our <a href="https://www.tiktok.com/@the_words_left_behind" target="_blank" rel="noopener noreferrer">TikTok</a> or  <a href="https://www.tiktok.com/@the_words_left_behind" target="_blank" rel="noopener noreferrer">Instagram</a>.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
