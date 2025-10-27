import React, { useEffect } from 'react';
import './LandingPage.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const LandingPage = () => {
    useEffect(() => {
        AOS.init({ duration: 500, once: false });
    }, []);

    return (
        <>
            <title>The Words Left Behind </title>
            <meta name="description" content="Transform your anonymous thoughts into beautiful visual art. Share your story at The Words Left Behind and let it resonate with others." />
            <link rel="canonical" href="https://thewordsleftbehind.com/" />
            <meta name="robots" content="index, follow" />

            {/* Open Graph tags for social sharing */}
            <meta property="og:title" content="The Words Left Behind - Express Your Thoughts Through Anonymous Art" />
            <meta property="og:description" content="Transform your anonymous thoughts into beautiful visual art. Share your story and let it resonate with others." />
            <meta property="og:url" content="https://thewordsleftbehind.com/" />
            <meta property="og:type" content="website" />
            <meta property="og:image" content="https://minio.thewordsleftbehind.com/thumbnails/68126baac783f4d08b9e8098.webp" />

            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="The Words Left Behind - Express Your Thoughts Through Anonymous Art" />
            <meta name="twitter:description" content="Transform your anonymous thoughts into beautiful visual art." />
            <meta name="twitter:image" content="https://minio.thewordsleftbehind.com/thumbnails/68126baac783f4d08b9e8098.webp" />
            <div className="landing-page">
                {/* Hero Section */}
                <section className="hero-section hero-container" data-aos="fade-up">
                    <div>
                        <h1 className="hero-title" data-aos="fade-up" data-aos-delay="100">
                            Express Your Thoughts, We’ll Turn Them into Art
                        </h1>
                        <p className="hero-description" data-aos="fade-up" data-aos-delay="200">
                            At "The Words Left Behind", we transform your anonymous messages into beautiful, emotive
                            visuals.
                            Share your story. Let it live beyond you.
                        </p>
                        <a href="/submit" className="cta-button" data-aos="zoom-in" data-aos-delay="300">
                            Submit Your Thought
                        </a>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="how-it-works" data-aos="fade-right">
                    <h2 data-aos="fade-down">How It Works</h2>
                    <div className="steps">
                        <div className="step" data-aos="fade-up" data-aos-delay="100">
                            <h4>1. Submit Anonymously</h4>
                            <p>Write something that's been on your mind — no names, no judgment.</p>
                        </div>
                        <div className="step" data-aos="fade-up" data-aos-delay="200">
                            <h4>2. We Turn It Into Art</h4>
                            <p>Our system renders your thought into a shareable visual piece.</p>
                        </div>
                        <div className="step" data-aos="fade-up" data-aos-delay="300">
                            <h4>3. Touch Someone's Heart</h4>
                            <p>Your message might be exactly what someone else needed to hear.</p>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="value-proposition" data-aos="fade-left">
                    <h4 data-aos="fade-down">Our Mission</h4>
                    <p>
                        At "The Words Left Behind", we believe silence holds power — but so does expression.
                        Every submission is a heartbeat, a memory, a moment someone needed to say but never could.
                        We're here to give those moments a voice and a face.
                    </p>
                </section>


                {/* Featured Visuals */}
                <section className="featured-visuals" data-aos="zoom-in">
                    <h3 data-aos="fade-up">See How It Comes to Life</h3>
                    <div className="image-gallery">
                        <div className="image-item" data-aos="fade-up" data-aos-delay="100">
                            <img src="https://minio.thewordsleftbehind.com/thumbnails/68126baac783f4d08b9e8098.webp" alt="Submission 1" />
                            <p>“The art of expression.”</p>
                        </div>
                        <div className="image-item" data-aos="fade-up" data-aos-delay="200">
                            <img src="https://minio.thewordsleftbehind.com/thumbnails/6810c3fdd07b1160442922a7.webp" alt="Submission 2" />
                            <p>“A thought that resonates.”</p>
                        </div>
                    </div>
                    <a href="/browse" className="cta-button" data-aos="fade-up" data-aos-delay="300">
                        Explore the Gallery
                    </a>
                </section>

                {/* Final CTA */}
                <section className="cta-section" data-aos="fade-up">
                    <h2>Join the Movement</h2>
                    <p>Thousands of thoughts have already been left behind. What's yours?</p>
                    <a href="/submit" className="cta-button" data-aos="zoom-in" data-aos-delay="200">
                        Share Your Thought
                    </a>
                </section>
            </div>
        </>
    );
};

export default LandingPage;
