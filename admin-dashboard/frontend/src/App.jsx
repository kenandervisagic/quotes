import React from 'react';
import Header from './components/Header/Header';
import './App.css';
import "./colors.css"
import Gallery from "./components/Gallery/Gallery.jsx";


function App() {
    return (
        <div className="app-container">
            <Header/>
            <main className="gallery">
                <Gallery refreshKey={null}/>
            </main>
        </div>
    );
}

export default App;