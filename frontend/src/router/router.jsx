import { createBrowserRouter, Navigate } from 'react-router-dom';
import Root from "../components/Root/Root.jsx";
import MainContent from "../components/MainContent/MainContent.jsx";

// Create the browser router
const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                index: true,  // This is the default route when visiting "/"
                element: <MainContent />
            },
            // Catch-all route to handle non-existing paths
            {
                path: "*",  // Matches any path that doesn't exist
                element: <Navigate to="/" replace />  // Redirect to homepage
            }
        ]
    }
]);

export default router;
