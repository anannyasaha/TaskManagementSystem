import React, { useState, useEffect } from 'react';
import axios from "axios"

function RegisterPage({ navigateTo }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    password: '',
    role: '',
    manager: '',
  });

  const [managers, setManagers] = useState([]);
  const [showManagerField, setShowManagerField] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    
    setFormData({
      ...formData,
      [id]: value
    });

    if (id === 'role') {
      handleRoleChange(value);
    }
  };

  const handleRoleChange = async (role) => {
    setFormData((prev) => ({ ...prev, role })); // Update role in form data
  
    if (role === "Employee") {
      setShowManagerField(true);
  
      try {
        const response = await fetch("http://localhost:8000/api/users?role=Manager", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        
        setManagers(data); 
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    } else if (role === "Manager") {
      setShowManagerField(true);
  
      try {
        const response = await fetch("http://localhost:8000/api/users?role=Director", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Directors:", data);
        setManagers(data); 
      } catch (error) {
        console.error("Error fetching directors:", error);
      }
    } else {
      setShowManagerField(false);
      setManagers([]);
      setFormData((prev) => ({ ...prev, manager: "" })); // Clear manager field
    }
  };
  


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log the form data to see what you're sending
    console.log('Registration data:', formData);

    try {
        // Make a POST request to the backend API to create the user
        const response = await axios.post('http://localhost:8000/api/users', formData);

        // On success, show a message and navigate
        alert('Registration successful! Please sign in.');
        navigateTo('signin'); // Assuming navigateTo is correctly defined elsewhere
    } catch (error) {
        // Handle any errors that might occur during the request
        console.error('Error during registration:', error.response?.data || error.message);
        alert('Registration failed. Please try again.');
    }
};

  return (
    <div className="form-container">
      <h2>Create an Account</h2>
      {errorMessage && <div className="error-message" style={{ display: 'block' }}>{errorMessage}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input 
            type="text" 
            className="form-control" 
            id="name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
        </div>
        
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
          <label htmlFor="employeeId">Employee ID</label>
          <input 
            type="text" 
            className="form-control" 
            id="employeeId" 
            value={formData.employeeId}
            onChange={handleChange}
            required 
          />
          <small className="form-text">This must be unique across the organization</small>
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
        
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select 
            className="form-control" 
            id="role" 
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Director">Director</option>
          </select>
        </div>
        
        {showManagerField && (
          <div className="form-group">
            <label htmlFor="manager">Manager</label>
            <select 
              className="form-control" 
              id="manager"
              value={formData.manager}
              onChange={handleChange}
              required
            >
              <option value="">Select Manager</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <button type="submit" className="btn" style={{ width: '100%' }}>Register</button>
        
        <div className="center-text">
          <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('signin'); }}>
            Already have an account? Sign in
          </a>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;