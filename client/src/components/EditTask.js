import React, { useState, useEffect } from 'react';


const EditTask = ({navigateTo,taskId,userRole,userName,userId}) => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [team_members, setTeamMembers] = useState([]);
  
  const [task, setTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'New',
    category: '',
    deadline: '',
    assignedTo: ''
  });

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
        
        const response = await fetch(`http://localhost:8000/api/tasks/task/${taskId}`,
            {method:'GET'}
        );
        const taskData =await response.json();
        
        // Format the date to YYYY-MM-DD for the input field
        const formattedDeadline = taskData.deadline 
          ? new Date(taskData.deadline).toISOString().split('T')[0]
          : '';
        
        setTask({
          title: taskData.title || '',
          description: taskData.description || '',
          priority: taskData.priority || 'Medium',
          status: taskData.status || 'New',
          category: taskData.category || '',
          deadline: formattedDeadline,
          assignedTo: taskData.assignedTo?._id || taskData.assignedTo || ''
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch task data. Please try again.');
        setLoading(false);
        console.error('Error fetching task:', err);
      }
    };

    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/users/team/${userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
        setTeamMembers(await response.json());
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchTask();
    if(userRole=="Manager"||userRole=="Director"){
        fetchTeamMembers();
    }
  }, [taskId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response= await fetch(
        `http://localhost:8000/api/tasks/update/task/${taskId}`, 
        
        { 
          method:'PUT',
          headers: {
             'Content-Type': 'application/json'
          },
          body:JSON.stringify(task)

        }
      );
      console.log(task,"response")
      if(response)
      {alert('Task updated successfully!');
        
      }
      navigateTo('home'); // Navigate back to tasks list
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  
  return (
    <div className="container mt-4">
      <h2>Edit Task</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={task.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            value={task.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="file" className="form-label">Upload File (Optional)</label>
          <input
            type="file"
            className="form-control"
            id="file"
            name="file"
            onChange={handleFileChange}
          />
          {task.file && task.file.data && (
            <small className="text-muted">Current file exists. Upload a new one to replace it.</small>
          )}
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="priority" className="form-label">Priority</label>
            <select
              className="form-select"
              id="priority"
              name="priority"
              value={task.priority}
              onChange={handleChange}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="status" className="form-label">Status</label>
            <select
              className="form-select"
              id="status"
              name="status"
              value={task.status}
              onChange={handleChange}
              required
            >
              <option value="New">New</option>
              <option value="Working">Working</option>
              <option value="Support">Support</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category</label>
          <select
            className="form-select"
            id="category"
            name="category"
            value={task.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="Feature Development">Feature Development</option>
            <option value="Bug Fixing">Bug Fixing</option>
            <option value="Code Review">Code Review</option>
            <option value="Refactoring">Refactoring</option>
            <option value="API Development">API Development</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="deadline" className="form-label">Deadline</label>
          <input
            type="date"
            className="form-control"
            id="deadline"
            name="deadline"
            value={task.deadline}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
  <label htmlFor="assignedTo">
    Assigned To* {userRole === "Employee" && <span>(Auto-assigned to you)</span>}
  </label>
  {userRole === "Employee" ? (
    <input type="text" value={userName} disabled className="form-control" />
  ) : (
    <select
      id="assignedTo"
      name="assignedTo"
      value={task.assignedTo}
      onChange={handleChange}
      required
      className="form-control"
    >
      <option value="">-- Select Team Member --</option>

      {/* Add "Myself" option for Manager/Director */}
      {(userRole === "Manager" || userRole === "Director") && (
        <option value={userId}>
          {userName} (Myself)
        </option>
      )}

      {/* Render other team members */}
      {team_members.map(member => (
        <option key={member._id} value={member._id}>
          {member.name} ({member.role})
        </option>
      ))}
    </select>
  )}
</div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Task'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigateTo('home')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTask;