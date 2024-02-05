import React, { useState, useEffect } from "react"
import { BrowserRouter, NavigationType } from "react-router-dom";
import useLocalStorage from "./hooks/useLocalStorage";
import Navigation from "./routes/Navigation";
import Routes from "./routes/Routes";
import LoadingSpinner from "./common/LoadingSpinner";
import UserContext from "./auth/UserContext";
import JoblyApi from "./api"
import jwt from "jsonwebtoken";


// Key name for storing token in localStorage for "remember me" re-login
export const TOKEN_STORAGE_ID = "jobly-token";


function App() {
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [applicationIds, setApplicationIds] = useState(new Set([]));
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);
  console.debug(
    "App",
    "infoLoaded=", infoLoaded,
    "currentUser=", currentUser,
    "token=", token,
  );

  // Logs into the whole site.
  async function login(data) {
    try {
      let loginToken = await JoblyApi.login(data)
      setToken(loginToken)
      return {success: true}
    } catch (err) {
      console.error("login failed", err);
      return {success: false, err}
    }
  }

  // Logs out of the whole site.
  function logout() {
    setCurrentUser(null)
    setToken(null)
  }


  /** Creates a new user
   * Logs in automatically upon sign-up and sets a token.
   */
  async function signup(data) {
    try {
      let signupToken = await JoblyApi.signup(data)
      setToken(signupToken)
      return {success: true}
    } catch (err) {
      console.error("signup failed", err);
      return {success: false, err}
    }
  }

  // Checks to see if the user has applied to a specific job.
  function hasAppliedToJob(id) {
    return applicationIds.has(id)
  }

  // Applies a user to a job.
  function applyToJob(id) {
    if (hasAppliedToJob(id)) return
    JoblyApi.applyToJob(currentUser.username, id)
    setApplicationIds(new Set([...applicationIds, id]))
  }

  // if (!infoLoaded) return <LoadingSpinner/>
  return (
    <div className="App">
      <BrowserRouter>
        <UserContext.Provider value={{ currentUser, setCurrentUser, hasAppliedToJob, applyToJob}}>
          <p>Hello There!</p>
          <div className="App">
            <Navigation logout={logout}/>
            <Routes login={login} signup={signup}/>
          </div>
        </UserContext.Provider>
      </BrowserRouter>
    </div>
  );
}

export default App;
