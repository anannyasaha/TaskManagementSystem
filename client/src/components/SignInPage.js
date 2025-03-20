import React, { useState } from 'react';

function SignInPage({ navigateTo, setUserRole, setUserName,setUserID }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch("http://localhost:8000/api/users/signin", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        // If login is successful, store the role and navigate
        setUserRole(data.role);
        setUserName(data.name);
        setUserID(data.id)
        navigateTo("home");

    } catch (error) {
        console.error("Error during login:", error);
        alert("Something went wrong. Please try again.");
    }
};

  return (
    <div className="form-container">
      <h2>Sign In to Your Account</h2>
      {errorMessage && <div className="error-message" style={{ display: 'block' }}>{errorMessage}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            className="form-control" 
            id="email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            className="form-control" 
            id="password" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </div>
        
        <button type="submit" className="btn" style={{ width: '100%' }}>Sign In</button>
        
        <div className="center-text">
          <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('register'); }}>
            Don't have an account? Register
          </a>
        </div>
      </form>
    </div>
  );
}

export default SignInPage;