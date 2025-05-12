import React from 'react';
import router from './router/router.jsx';
import {RouterProvider} from "react-router-dom";
import './App.css';
function App() {
    return <RouterProvider router={router} />;
}

export default App;
