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
    return <h1>Signing up...</h1>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 text-black">
      <div className="flex w-1/2 max-w-4xl bg-white rounded-lg shadow-md p-6">
        <div className="w-full p-4">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Create Your Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" id="fullname" name="fullname" value={formData.fullname} onChange={handleChange} placeholder="Enter your full name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>

            <div className="flex items-center mt-2">
              <input type="checkbox" id="isAdmin" checked={isAdminChecked} onChange={(e) => setIsAdminChecked(e.target.checked)} className="mr-2" />
              <label htmlFor="isAdmin" className="text-sm text-gray-700">Are you an admin?</label>
            </div>

            {isAdminChecked && (
              <div>
                <label htmlFor="adminPasskey" className="block text-sm font-medium text-gray-700">Admin Passkey</label>
                <input type="text" id="adminPasskey" name="adminPasskey" value={formData.adminPasskey} onChange={handleChange} placeholder="Enter your admin passkey" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
              </div>
            )}

            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
