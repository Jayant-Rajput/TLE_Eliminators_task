import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { useTheme } from './ThemeProvider.jsx';

const Navbar = () => {

  const { authUser,logout } = useAuthStore();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleClick = (e) => {
    if (authUser.role === "admin") {
      navigate("/addYtLink");
    } else {
      toast.error("Sorry, You're not an admin");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  }


  const handleToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">TLE Eliminators</h1>
        <div className="flex space-x-4">
        
          <Link to="/" className="hover:text-gray-300">Home</Link>
          {!authUser && <Link to="/signup" className="hover:text-gray-300">Signup</Link>}
          {!authUser && <Link to="/login" className="hover:text-gray-300">Login</Link>}
          {authUser && <button className="hover:text-gray-300" onClick={handleLogout}>Logout</button>}
          {authUser && (<button className="hover:text-gray-300" onClick={handleClick}>Add Solutions</button>)}
          <button onClick={handleToggle}>Toggle Mode</button>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;