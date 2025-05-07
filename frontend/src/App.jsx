import React from 'react';
import router from './router/router.jsx';
import {RouterProvider} from "react-router-dom";

function App() {
    return <RouterProvider router={router} />;
}

export default App;
