import React from 'react';
import "./Footer.css"
function Footer() {
    return (
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
    );
}

export default Footer;