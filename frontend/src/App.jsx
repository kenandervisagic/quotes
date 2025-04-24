import React, {useState, useEffect} from 'react';
import Header from './components/Header';
import MessageForm from './components/MessageForm';
import SubmissionSuccess from './components/SubmissionSuccess';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import {checkRateLimit, updateSubmissionHistory} from './utils/rateLimiting';
import './App.css';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://kdidp.art/api/v1';

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [userImageUrl, setUserImageUrl] = useState(null);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Check rate limit on mount
    useEffect(() => {
        const rateStatus = checkRateLimit();
        setIsRateLimited(rateStatus.isLimited);
        if (rateStatus.isLimited) {
            setCountdown(rateStatus.remainingCooldown);
        }
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

    const handleSubmit = async (message) => {
        setIsLoading(true);
        setError(null);

        const payload = {content: message};

        try {
            const response = await fetch(`${apiBaseUrl}/submit-message`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (response.ok) {
                setUserImageUrl(data.image_url);
                setSubmitted(true);

                // 1) update the LS history, AND 2) get the new rate‐limit status:
                const rateStatus = updateSubmissionHistory();
                setIsRateLimited(rateStatus.isLimited);
                setCountdown(rateStatus.remainingCooldown);

                setRefreshKey((prev) => prev + 1);
            } else {
                setError(data.error || "Failed to submit message.");
            }
        } catch (error) {
            setError("Error submitting message. Please try again.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitAnother = () => {
        setSubmitted(false);
        setUserImageUrl(null);
        if (!isRateLimited) {
            const rateStatus = checkRateLimit();
            setIsRateLimited(rateStatus.isLimited);
            if (rateStatus.isLimited) {
                setCountdown(rateStatus.remainingCooldown);
            }
        }
    };

    return (
        <div className="app-container">
            <Header/>
            <main className="main-content">
                <div className="paper-card">
                    <h2 className="page-title">Submit an Anonymous Message</h2>
                    <p className="explanation">
                        This page is a safe space to share things you've never said out loud.
                        <br/>
                        Your message will remain anonymous.
                    </p>

                    {submitted ? (
                        <SubmissionSuccess
                            userImageUrl={userImageUrl}
                            isRateLimited={isRateLimited}
                            countdown={countdown}
                            onSubmitAnother={handleSubmitAnother}
                        />
                    ) : (
                        <MessageForm
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                            isRateLimited={isRateLimited}
                            error={error}
                            setError={setError}
                        />
                    )}

                    <Footer/>
                </div>

                <Gallery refreshKey={refreshKey}/>
            </main>
        </div>
    );
}

export default App;