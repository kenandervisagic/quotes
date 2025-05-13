import React, { useEffect } from "react";
import './AdSlot.css';
import noImage from '../../assets/no-picture.jpg';

function AdSlot() {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error", e);
        }
    }, []);

    return (
        <div className="post-card ad-slot">
            <div className="post-card-header">
                <div className="post-card-header-inline">
                    <img src={noImage} alt="ad" />
                    <p>Ad</p>
                </div>
            </div>
            <ins
                className="adsbygoogle ad-ins"
                data-ad-client="ca-pub-6798966945497866" // replace with your AdSense ID
                data-ad-slot="6301625361"
                data-ad-format="auto"
                data-full-width-responsive="true"
            ></ins>
        </div>
    );
}

export default AdSlot;
