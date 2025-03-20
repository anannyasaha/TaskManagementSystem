import React, { useState, useEffect } from 'react';

const ViewTask = ({ navigateTo, taskId, userRole, userName }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/tasks/task/${taskId}`, {
          method: 'GET'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch task');
        }
        
        const taskData = await response.json();
        const assignedToName = await fetchUserData(taskData.assignedTo);
        const createdByName = await fetchUserData(taskData.createdBy);
        setTask({
            ...taskData,
            assignedTo: assignedToName || "Unknown",
            createdBy: createdByName || "Unknown",
          });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch task data');
        setLoading(false);
        console.error('Error fetching task:', err);
      }
    };

    fetchTask();
  }, [taskId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/tasks/delete/tasks/${taskId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete task');
        }
        
        alert('Task deleted successfully');
        navigateTo('home');
      } catch (err) {
        setError('Failed to delete task');
        console.error('Error deleting task:', err);
      }
    }
  };
  const fetchUserData = async (userId) => {
    const user_response = await fetch(`http://localhost:8000/api/users/user/${userId}`);
    if (user_response.ok) {
        const userData = await user_response.json();
        return userData.name;  // Return the user's name
    }
    return null;  // Return null if the user doesn't exist or there's an error
};
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!task) return <div className="not-found-message">Task not found</div>;

  return (
    <div className="view-task-container">
      <div className="task-header">
        <h2>{task.title}</h2>
        <div className="task-badges">
          <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
            {task.priority}
          </span>
          <span className={`status-badge status-${task.status?.toLowerCase()}`}>
            {task.status}
          </span>
        </div>
      </div>

      <div className="task-details">
        <div className="detail-row">
          <div className="detail-label">Description</div>
          <div className="detail-value">{task.description}</div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Category</div>
          <div className="detail-value">{task.category}</div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Priority</div>
          <div className="detail-value">
            <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
              {task.priority}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Status</div>
          <div className="detail-value">
            <span className={`status-badge status-${task.status?.toLowerCase()}`}>
              {task.status}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Deadline</div>
          <div className="detail-value">{formatDate(task.deadline)}</div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Assigned To</div>
          <div className="detail-value">
            {task.assignedTo}
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Created By</div>
          <div className="detail-value">
            {task.createdBy}
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Created At</div>
          <div className="detail-value">{formatDate(task.createdAt)}</div>
        </div>

        {task.file && (
          <div className="detail-row">
            <div className="detail-label">Attached File</div>
            <div className="detail-value">
              <a 
                href={task.file} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="file-link"
              >
                View Attachment
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="task-actions">
        <button 
          className="btn btn-primary" 
          onClick={() => navigateTo('editTask', { taskId: task._id })}
        >
          Edit Task
        </button>
        {(userRole === "Manager" || userRole === "Director") && (
          <button 
            className="btn btn-danger" 
            onClick={handleDelete}
          >
            Delete Task
          </button>
        )}
        <button 
          className="btn btn-secondary" 
          onClick={() => navigateTo('home')}
        >
          Back to Tasks
        </button>
      </div>
    </div>
  );
};

export default ViewTask;