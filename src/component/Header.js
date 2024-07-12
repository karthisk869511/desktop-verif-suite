import React from 'react';
import { Link } from 'react-router-dom'; 
import './Header.css';
import logo from '../assets/logo.gif'; 

const Header = ({ isLoggedIn }) => {
  return (
    <header>
      <div className="header-container">
        {isLoggedIn ? (
          <Link to="/introduction" className="logo-link">
            <div className="logo-container">
              <img src={logo} alt="Logo" className="logo" /> 
            </div>
          </Link>
        ) : (
          <div className="logo-container disabled">
            <img src={logo} alt="Logo" className="logo" /> 
          </div>
        )}
        <div className="verification-container">
          <h1 className="verification-text">Verification Suite</h1>
        </div>
      </div>
    </header>
  );
}

export default Header;
