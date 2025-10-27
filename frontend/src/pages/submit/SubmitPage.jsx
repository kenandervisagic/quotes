import React from "react";
import SubmitForm from "../../components/SubmitForm/SubmitForm.jsx";

function BrowsePage() {
    return (
        <>
            <title>Submit Your Thought - KDidP Art</title>
            <meta name="description" content="Share your anonymous thoughts and transform them into beautiful visual art. No names, no judgment - just expression." />
            <link rel="canonical" href="https://thewordsleftbehind.com/submit" />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content="Submit Your Thought - KDIDP Art" />
            <meta property="og:description" content="Share your anonymous thoughts and transform them into beautiful visual art." />
            <meta property="og:url" content="https://thewordsleftbehind.com/submit" />
            <SubmitForm />
        </>
    );
}

export default BrowsePage;