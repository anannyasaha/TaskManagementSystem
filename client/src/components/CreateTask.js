import React, { useState, useEffect } from 'react';
import './CreateTask.css';
import socket from "../socket";
function CreateTask({ userRole, userName, navigateTo, userId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    category: 'Feature Development',
    deadline: '',
    assignedTo: '',
    file: null
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize the date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      deadline: formattedDate
    }));
  }, []);

  // Fetch team members if the user is a manager or director
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        // For managers, fetch their team members
        if (userRole === 'Manager' || userRole === 'Director') {

          const response = await fetch(`http://localhost:8000/api/users/team/${userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log(data)
          setTeamMembers(data);
        } else {
          // For employees, set their ID as the default assignee
          setFormData(prev => ({
            ...prev,
            assignedTo: userId
          }));
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
        setErrorMessage('Failed to load team members. Please try again.');
      }
    };

    fetchTeamMembers();
  }, [userRole, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0] || null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
    const taskFormData = new FormData();
    
    // Add the text fields to FormData
    taskFormData.append('title', formData.title);
    taskFormData.append('description', formData.description);
    taskFormData.append('priority', formData.priority);
    taskFormData.append('status', formData.status);
    taskFormData.append('category', formData.category);
    taskFormData.append('deadline', formData.deadline);
    taskFormData.append('assignedTo', formData.assignedTo);
    taskFormData.append('createdBy', userId);
    
    // Add file if it exists
    if (formData.file) {
      taskFormData.append('file', formData.file);
    }
    console.log("Form title:", formData.title);
    console.log("FormData contains title:", taskFormData.get('title'));

      const response = await fetch('http://localhost:8000/api/tasks', {
        method: 'POST',
        credentials: 'include',
        body: taskFormData,
       
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }

      setSuccessMessage('Task created successfully!');
      
      socket.on("newTask", (task) => {
        alert(`📢 New task received(coming from Server):", ${task.title}`)})
  
      
      // Clear form after successful submission
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Pending',
        category: 'Feature Development',
        deadline: formData.deadline,
        assignedTo: userRole === 'Employee' ? userId : '',
        file: null
      });
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigateTo('home');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating task:', error);
      setErrorMessage(error.message || 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="create-task-container">
        <div className="page-header">
          <h2>Create New Task</h2>
          <button className="btn btn-secondary" onClick={() => navigateTo('home')}>
            Back to Dashboard
          </button>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Provide a detailed description of the task"
              className="form-control"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="category">Category*</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="Feature Development">Feature Development</option>
                <option value="Bug Fixing">Bug Fixing</option>
                <option value="Code Review">Code Review</option>
                <option value="Refactoring">Refactoring</option>
                <option value="API Development">API Development</option>
              </select>
            </div>

            <div className="form-group half-width">
              <label htmlFor="priority">Priority*</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="status">Status*</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="Pending">Pending</option>
                <option value="Working">Working</option>
                <option value="Support">Need Support</option>
                <option value="Overdue">Overdue</option>
                <option value="Completed">Completed</option>
                <option value="New">New</option>
              </select>
            </div>

            <div className="form-group half-width">
              <label htmlFor="deadline">Deadline*</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">
              Assigned To* {userRole === 'Employee' && <span>(Auto-assigned to you)</span>}
            </label>
            {userRole === 'Employee' ? (
              <input
                type="text"
                value={userName}
                disabled
                className="form-control"
              />
            ) : (
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">-- Select Team Member --</option>
                <option value={userId}>
                    {userName} (Myself)
                </option>
                {teamMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="file-input">Attachment (Optional)</label>
            <input
              type="file"
              id="file-input"
              name="file"
              onChange={handleFileChange}
              className="form-control file-input"
            />
            <small>Upload any relevant documents or screenshots</small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => navigateTo('home')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTask;