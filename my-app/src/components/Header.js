import React from 'react';
import './css/Header.css';
import mrWorldWide from './css/gisrwwwhite.png'

const Header = () => {
return (
    <header className="header">
        <h1>GISr WorldWide</h1>
        <img src={mrWorldWide} alt="Logo" className="header-logo" />    
    </header>
);
};

export default Header;
