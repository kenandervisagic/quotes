import {createBrowserRouter, Navigate} from 'react-router-dom';
import Root from "../components/Root/Root.jsx";
import SubmitPage from "../pages/submit/SubmitPage.jsx";
import BrowsePage from "../pages/browse/BrowsePage.jsx";
import LandingPage from "../pages/landing/LandingPage.jsx";

// Create the browser router
const router = createBrowserRouter([
    {
        path: "/",
        element: <Root/>,
        children: [
            {
                index: true,
                element: <LandingPage/>
            },
            {
                path: "submit",  // This is the default route when visiting "/"
                element: <SubmitPage/>
            },
            {
                path: "browse",
                element: <BrowsePage/>
            },
            {
                path: "*",  // Matches any path that doesn't exist
                element: <Navigate to="/" replace/>  // Redirect to homepage
            }
        ]
    }
]);

export default router;
