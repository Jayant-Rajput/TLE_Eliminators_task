import { useState, useEffect } from 'react'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'

import { Toaster } from "react-hot-toast";
import { useAuthStore } from './stores/useAuthStore';

import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import AddLinkPage from './pages/AddLinkPage';

function App() {

  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  },[]);

  if(isCheckingAuth && !authUser){
    return <h1>wait for a while...</h1>
  }

  return (
      <div>
        <Navbar />    

        <Routes>
          <Route path="/" element={ authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignupPage /> : < Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/addYtLink" element={ <AddLinkPage /> } />
        </Routes>

        <Toaster />
      </div>
  );
};

export default App
