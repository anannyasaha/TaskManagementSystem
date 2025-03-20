import React from 'react';

function WelcomePage({ navigateTo }) {
  return (
    <div className="welcome-page form-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>Welcome to Task Management System</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '40px', fontSize: '1.1rem', lineHeight: '1.6' }}>
        Streamline your workflow with our comprehensive task management solution. 
        Assign, track, and complete tasks efficiently across your organization's hierarchy.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button onClick={() => navigateTo('signin')} className="btn">Sign In</button>
        <button onClick={() => navigateTo('register')} className="btn">Register</button>
      </div>
    </div>
  );
}

export default WelcomePage;