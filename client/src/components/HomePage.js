import React, { useState, useEffect } from 'react';
import './HomePage.css';
//import socket from "../socket";

function HomePage({ userRole, userName,userId, navigateTo }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);
  const [categoryReports, setCategoryReports] = useState([]);
  const [isReportLoading, setIsReportLoading] = useState(false);
  // Filter state
  //socket.emit('setUser',userId);
  const [filters, setFilters] = useState({
    priority: '',
    category: '',
    status: '',
    assignedTo: '',
    createdBy: ''
  });
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({
    key: 'deadline',
    direction: 'asc'
  });

  // Fetch tasks when component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch(`http://localhost:8000/api/tasks/relevanttasks?name=${encodeURIComponent(userName)}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const fetchUserData = async (userId) => {
          const user_response = await fetch(`http://localhost:8000/api/users/user/${userId}`);
          if (user_response.ok) {
            const userData = await user_response.json();
            return userData.name;  // Return the user's name
          }
          return null;  // Return null if the user doesn't exist or there's an error
        };
      
        // Loop through each task and update 'assignedTo' and 'createdBy' fields
        for (let task of data) {
          if (task.assignedTo) {
            const assignedToName = await fetchUserData(task.assignedTo);
            if (assignedToName) {
              task.assignedTo = assignedToName;  // Assign name to assignedTo field
            } else {
              task.assignedTo = "Unknown";  // If the user doesn't exist, assign 'Unknown'
            }
          }
      
          if (task.createdBy) {
            const createdByName = await fetchUserData(task.createdBy);
            if (createdByName) {
              task.createdBy = createdByName;  // Assign name to createdBy field
            } else {
              task.createdBy = "Unknown";  // If the user doesn't exist, assign 'Unknown'
            }
          }
        }
     
        setTasks(data);
        setFilteredTasks(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [userName]);
  const fetchCategoryReports = async () => {
    try {
      setIsReportLoading(true);
      const response = await fetch(`http://localhost:8000/api/tasks/categoryReport?name=${encodeURIComponent(userName)}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setCategoryReports(data);
      setIsReportLoading(false);
    } catch (error) {
      console.error('Error fetching category reports:', error);
      setIsReportLoading(false);
    }
  };
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchCategoryReports();
    }
  }, [activeTab]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...tasks];
    
    // Apply filters
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }
    
    if (filters.category) {
      result = result.filter(task => task.category === filters.category);
    }
    
    if (filters.status) {
      result = result.filter(task => task.status === filters.status);
    }
    
    if (filters.assignedTo) {
      result = result.filter(task => task.assignedTo === filters.assignedTo);
    }
    
    if (filters.createdBy) {
      result = result.filter(task => task.createdBy === filters.createdBy);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Special handling for date fields
        if (sortConfig.key === 'deadline' || sortConfig.key === 'createdAt') {
          const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]) : new Date(0);
          const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]) : new Date(0);
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredTasks(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, sortConfig, tasks]);

  // Get current tasks for pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const resetFilters = () => {
    setFilters({
      priority: '',
      category: '',
      status: '',
      assignedTo: '',
      createdBy: ''
    });
  };

  const logout = () => {
    
    navigateTo('welcome');
  };

  const handleCreateTask = () => {
    navigateTo('createTask');
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (key) => {
    return [...new Set(tasks.map(task => task[key]))].filter(Boolean);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="navbar">
        <h1>Task Management System</h1>
        <div className="navbar-actions">
          <span className="role-badge">{userRole}</span>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </div>
      <div className="tabs">
            <button 
              className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`} 
              onClick={() => setActiveTab('tasks')}
            >
              Tasks
            </button>
            <button 
              className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`} 
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </button>
        </div>
        {activeTab === 'tasks' && (   
      <div className="container">
        <div className="form-container" style={{ maxWidth: '90%', margin: '0 auto' }}>
          <div className="dashboard-header">
            <h2>{userName}, Welcome to your Dashboard</h2>
            <button className="btn btn-primary" onClick={handleCreateTask}>Create New Task</button>
          </div>
          
          <p>Your task management portal is ready. You can manage tasks based on your role permissions.</p>
          <div className="role-info">
            <p><strong>Current Role:</strong> {userRole}</p>
            {userRole === 'Employee' && (
              <p>As an employee, you can view tasks assigned to you.</p>
            )}
            {userRole === 'Manager' && (
              <p>As a manager, you can view tasks assigned to you and your team members.</p>
            )}
            {userRole === 'Director' && (
              <p>As a director, you can view tasks across all departments.</p>
            )}
          </div>
          
          <div className="task-list-container">
            <h3>Your Tasks</h3>
            
            {isLoading ? (
              <p>Loading tasks...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : tasks.length === 0 ? (
              <p>No tasks found. Create a new task to get started.</p>
            ) : (
              <>
                <div className="filters-container">
                  <div className="filter-group">
                    <label>Priority</label>
                    <select name="priority" value={filters.priority} onChange={handleFilterChange}>
                      <option value="">All</option>
                      {getUniqueValues('priority').map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>Category</label>
                    <select name="category" value={filters.category} onChange={handleFilterChange}>
                      <option value="">All</option>
                      {getUniqueValues('category').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>Status</label>
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                      <option value="">All</option>
                      {getUniqueValues('status').map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>Assigned To</label>
                    <select name="assignedTo" value={filters.assignedTo} onChange={handleFilterChange}>
                      <option value="">All</option>
                      {getUniqueValues('assignedTo').map(assignedTo => (
                        <option key={assignedTo} value={assignedTo}>{assignedTo}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label>Created By</label>
                    <select name="createdBy" value={filters.createdBy} onChange={handleFilterChange}>
                      <option value="">All</option>
                      {getUniqueValues('createdBy').map(createdBy => (
                        <option key={createdBy} value={createdBy}>{createdBy}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button className="btn btn-secondary" onClick={resetFilters}>Reset Filters</button>
                </div>
                
                <div className="results-info">
                  Showing {currentTasks.length} of {filteredTasks.length} tasks
                </div>
                
                <div className="table-responsive">
                  <table className="task-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th onClick={() => handleSort('priority')} className="sortable-header">
                          Priority {sortConfig.key === 'priority' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('category')} className="sortable-header">
                          Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('status')} className="sortable-header">
                          Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('deadline')} className="sortable-header">
                          Deadline {sortConfig.key === 'deadline' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('assignedTo')} className="sortable-header">
                          Assigned To {sortConfig.key === 'assignedTo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('createdBy')} className="sortable-header">
                          Created By {sortConfig.key === 'createdBy' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('createdAt')} className="sortable-header">
                          Created At {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>File</th>
                       
                      </tr>
                    </thead>
                    <tbody>
                      {currentTasks.map((task) => (
                        <tr key={task._id} onClick={() => navigateTo('viewTask', { taskId: task._id })}
                        className="clickable-row">
                          <td>{task.title}</td>
                          <td className="description-cell">{task.description}</td>
                          <td>
                            <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td>{task.category}</td>
                          <td><span className={`status-badge status-${task.status.toLowerCase()}`}>{task.status}</span></td>
                          <td>{formatDate(task.deadline)}</td>
                          <td>{task.assignedTo}</td>
                          <td>{task.createdBy}</td>
                          <td>{formatDate(task.createdAt)}</td>
                          <td>
                            {task.file ? (
                              <a 
                                href={task.file} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View
                              </a>
                            ) : (
                              'No file'
                            )}
                          </td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="pagination">
                  <button 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.ceil(filteredTasks.length / tasksPerPage) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      onClick={() => paginate(currentPage + 1)} 
                      disabled={currentPage === Math.ceil(filteredTasks.length / tasksPerPage)}
                      className="pagination-button"
                    >
                      Next
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} of {Math.max(1, Math.ceil(filteredTasks.length / tasksPerPage))}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>)}
        {activeTab === 'reports' && (
            <div className="reports-container">
              <h3>Tasks by Category Report</h3>
              
              {isReportLoading ? (
                <p>Loading reports...</p>
              ) : (
                <div className="category-report">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Task Count</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryReports.length > 0 ? (
                        categoryReports.map((report) => (
                          <tr key={report._id}>
                            <td>{report._id}</td>
                            <td>{report.count}</td>
                            <td>
                              {Math.round((report.count / categoryReports.reduce((acc, cat) => acc + cat.count, 0)) * 100)}%
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3">No category data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  {/* Add a simple bar chart to visualize the data */}
                  <div className="chart-container">
                    {categoryReports.map((report) => (
                      <div key={report._id} className="chart-bar-container">
                        <div className="chart-label">{report._id}</div>
                        <div className="chart-bar" style={{ 
                          width: `${Math.min(100, Math.round((report.count / categoryReports.reduce((acc, cat) => acc + cat.count, 0)) * 100))}%` 
                        }}>
                          {report.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      
            
    );
  }
  
  export default HomePage;
  
  
  
  
  