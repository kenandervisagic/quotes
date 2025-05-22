import React, {useEffect, useState} from 'react';
import MessageForm from '../../components/MessageForm/MessageForm.jsx';
import SubmissionSuccess from "../../components/SubmissionSuccess/SubmissionSuccess.jsx";
import {checkRateLimit, updateSubmissionHistory} from '../../utils/rateLimiting.js';

import './SubmitForm.css';
import "../../colors.css";
import SnackBar from "../SnackBar/SnackBar.jsx";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://kdidp.art';

function MainContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [userImageUrl, setUserImageUrl] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error", e);
        }
    }, []);

    useEffect(() => {
        const rateStatus = checkRateLimit();
        setIsRateLimited(rateStatus.isLimited);
        if (rateStatus.isLimited) {
            setCountdown(rateStatus.remainingCooldown);
        }
    }, []);

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
        //
        const payload = {content: message};
        try {
            const response = await fetch(`${apiBaseUrl}/api/generate/submit-message`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (response.ok) {
                setUserImageUrl(data.image_url);
                setSubmitted(true);

                const rateStatus = updateSubmissionHistory();
                setIsRateLimited(rateStatus.isLimited);
                setCountdown(rateStatus.remainingCooldown);

            } else {
                setError(data.error || "Failed to submit message.");
            }
        } catch (error) {
            setError("Error submitting message. Please refresh page.");

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
        <main className="submit-content">
            <div className="paper-card">
                {submitted ? (
                    <>
                        <SubmissionSuccess
                            userImageUrl={userImageUrl}
                            isRateLimited={isRateLimited}
                            countdown={countdown}
                            onSubmitAnother={handleSubmitAnother}
                        />
                        <SnackBar message="Successfully submitted message." severity="success"/>
                    </>
                ) : (
                    <>
                        <h2 className="page-title">Submit an Anonymous Message</h2>
                        <p className="explanation">
                            This page is a safe space to share things you've never said out loud.
                        </p>
                        <MessageForm
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                            isRateLimited={isRateLimited}
                            error={error}
                            setError={setError}
                        />
                    </>
                )
                }
                {
                    error &&
                    <SnackBar message="Something went wrong. Please try again." severity="error"/>
                }
                <div className="footer-message">
                    <p>
                        Want to explore other anonymous messages? <br/>
                        Check them out on our{' '}
                        <a href="https://www.tiktok.com/@the_words_left_behind" target="_blank"
                           rel="noopener noreferrer">
                            TikTok
                        </a>{' '}
                        or{' '}
                        <a href="https://www.instagram.com/the_words_left_behind" target="_blank"
                           rel="noopener noreferrer">
                            Instagram
                        </a>.
                    </p>
                </div>
            </div>
            <div className="under-submit-ad">
                <ins className="adsbygoogle"
                     style={{display: "block"}}
                     data-ad-client="ca-pub-6798966945497866"
                     data-ad-slot="7496407096"
                     data-ad-format="auto"
                     data-full-width-responsive="true">
                </ins>
            </div>
        </main>
    );
}

export default MainContent;
