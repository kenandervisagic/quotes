// Rate limiting configuration
const MAX_SUBMISSIONS = 3;
const TIME_WINDOW = 60 * 1000; // 1 minute (changed from original for testing purposes)
const COOLDOWN_PERIOD = 60 * 1000; // 1 minute (changed from original for testing purposes)

// Check if user is rate limited
export const checkRateLimit = () => {
    const submissionHistory = JSON.parse(localStorage.getItem('submissionHistory')) || [];
    const now = Date.now();

    // Filter out old submissions
    const recentSubmissions = submissionHistory.filter(
        timestamp => now - timestamp < TIME_WINDOW
    );

    localStorage.setItem('submissionHistory', JSON.stringify(recentSubmissions));

    if (recentSubmissions.length >= MAX_SUBMISSIONS) {
        const lastSubmissionTime = recentSubmissions[recentSubmissions.length - 1];
        const remainingCooldown = COOLDOWN_PERIOD - (now - lastSubmissionTime);

        return {
            isLimited: true,
            remainingCooldown: Math.max(0, remainingCooldown)
        };
    }

    return { isLimited: false, remainingCooldown: 0 };
};

// Update submission history
export const updateSubmissionHistory = () => {
    const submissionHistory = JSON.parse(localStorage.getItem('submissionHistory')) || [];
    const now = Date.now();
    submissionHistory.push(now);
    localStorage.setItem('submissionHistory', JSON.stringify(submissionHistory));
    return checkRateLimit();
};