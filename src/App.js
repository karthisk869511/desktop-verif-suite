import "./App.css";
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Header from "./component/Header";
import Footer from "./component/Footer";
import Dashboard from "./component/Dashboard";
import Introduction from "./component/Introduction";
import Body from "./component/Body";
import { Outlet, useLocation,Navigate } from "react-router-dom"; 
import { GoogleLogin } from "@react-oauth/google";
import SessionTimeout from "./component/SessionTimeout";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState(true);
  const [showIntroduction, setShowIntroduction] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); 

  const timeoutDuration =  parseInt(process.env.REACT_APP_TIMEOUT_DURATION);


  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setShowIntroduction(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("lastActivity");
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setIsLoggedIn(true);
      const lastActivity = localStorage.getItem("lastActivity");
      const currentTime = new Date().getTime();
      if (lastActivity && currentTime - lastActivity > timeoutDuration) {
        handleLogout();
      } else {
        localStorage.setItem("lastActivity", currentTime);
      }
    } else {
      navigate("/");
    }
  }, [handleLogout, navigate, timeoutDuration]);

  useEffect(() => {
    if (isLoggedIn && location.pathname === "/") {
      navigate("/introduction");
    }
    if (!isLoggedIn && location.pathname !== "/") {
      navigate("/");
    }
  }, [isLoggedIn, location.pathname, navigate]);

  useEffect(() => {
    localStorage.setItem("currentPath", location.pathname); 
  }, [location.pathname]);

  useEffect(() => {
    const currentPath = localStorage.getItem("currentPath");
    if (currentPath) {
      navigate(currentPath); 
    }
  }, [navigate]);

  const onLoginSuccess = async (accessToken) => {

    try {
      if (!accessToken) {
        setLoginError(false);
        return;
      }
    

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
       
        const data = await response.json();
       
        if (data.credentials) {
          localStorage.setItem("accessToken", data.credentials);
          setIsLoggedIn(true);
          setLoginError(true);
          setShowIntroduction(true);
          navigate("/introduction");
        }
      } else {
       
        const errorMessage = await response.text();
        setLoginError(false);
      }
    } catch (error) {
     
      setLoginError(false);
    }
  };

  const onLoginFailure = (error) => {
   
    setLoginError(false);
  };

  const logout = () => {
    handleLogout();
  };

  const hideIntroduction = () => {
    setShowIntroduction(false);
  };
  if (!isLoggedIn && location.pathname !== '/') {
    return <Navigate to="/" />;
  }


  return (
    <div className="App">
      <>
        <Header isLoggedIn={isLoggedIn} />
        <div className="main-content">
          {isLoggedIn ? (
            <Dashboard hideIntroduction={hideIntroduction} />
          ) : (
            <>
              <Body />
              <div className="google-login-container">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    const accessToken = credentialResponse?.credential;
                    onLoginSuccess(accessToken);
                  }}
                  onError={(error) => {
                   
                    onLoginFailure(error);
                  }}
                  className="google-login-btn"
                />
              </div>
            </>
          )}

          {isLoggedIn && (
            <button className="sign-out-btn" onClick={logout}>
              Sign out
            </button>
          )}
          {!loginError && (
            <div className="invalid-login">
              Unauthorized access. Please contact support.
            </div>
          )}
          <Outlet />
        </div>
        <Footer />
        {showIntroduction && !isLoggedIn && <Introduction />}
        <SessionTimeout
         isLoggedIn={isLoggedIn}
          handleLogout={handleLogout}
           timeoutDuration={timeoutDuration}
>
          {!isLoggedIn && <Navigate to="/" />}
         </SessionTimeout>
      </>
    </div>
  );
}

export default App;
