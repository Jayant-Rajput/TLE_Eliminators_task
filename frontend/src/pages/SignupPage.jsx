import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore.js";
import toast from "react-hot-toast";

const SignupPage = () => {
  const navigate = useNavigate();
  const [isAdminChecked, setIsAdminChecked] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    adminPasskey: ""
  });

  const { signup, isSigninUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullname.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 3) return toast.error("Password must be at least 3 characters");
    if (isAdminChecked && !formData.adminPasskey) return toast.error("Admin passkey is required");

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await signup(formData);
    // navigate('/');
  };

  if (isSigninUp) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <h1 className="text-xl font-medium text-center text-gray-700 mt-4">Creating your account...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 m-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Join Us</h2>
          <p className="text-gray-600 mt-2">Create an account to get started</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              id="fullname" 
              name="fullname" 
              value={formData.fullname} 
              onChange={handleChange} 
              placeholder="Enter your full name" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              required 
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="you@example.com" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              required 
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              required 
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 3 characters</p>
          </div>

          <div className="flex items-center mt-2">
            <input 
              type="checkbox" 
              id="isAdmin" 
              checked={isAdminChecked} 
              onChange={(e) => setIsAdminChecked(e.target.checked)} 
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
            />
            <label htmlFor="isAdmin" className="ml-2 text-sm text-gray-700">I am an admin</label>
          </div>

          {isAdminChecked && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <label htmlFor="adminPasskey" className="block text-sm font-medium text-gray-700 mb-1">Admin Passkey</label>
              <input 
                type="text" 
                id="adminPasskey" 
                name="adminPasskey" 
                value={formData.adminPasskey} 
                onChange={handleChange} 
                placeholder="Enter admin passkey" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                required 
              />
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Create Account
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? 
            <a href="/login" className="ml-1 text-blue-600 hover:text-blue-800 font-medium">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;