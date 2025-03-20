// App.js
import React, { useState } from 'react';
import './App.css';
import WelcomePage from './components/WelcomePage';
import RegisterPage from './components/RegisterPage';
import SignInPage from './components/SignInPage';
import HomePage from './components/HomePage';
import CreateTask from './components/CreateTask';
import EditTask from './components/EditTask';
import ViewTask from './components/ViewTask';
function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserID] = useState('');
  const [taskId, setTaskId] = useState('');
  const navigateTo = (page,data) => {
    setCurrentPage(page);
    if (data&&data.taskId) {
      setTaskId(data.taskId);
    }
  };

  return (
    <div className="App">
      {currentPage === 'welcome' && <WelcomePage navigateTo={navigateTo} />}
      {currentPage === 'register' && <RegisterPage navigateTo={navigateTo} />}
      {currentPage === 'signin' && <SignInPage navigateTo={navigateTo} setUserRole={setUserRole} setUserName={setUserName} setUserID={setUserID}/>}
      {currentPage === 'home' && <HomePage userRole={userRole} userName={userName} userId={userId} navigateTo={navigateTo} />}
      {currentPage === 'createTask' && <CreateTask userRole={userRole} userName={userName} userId={userId} navigateTo={navigateTo} />}
      {currentPage==='editTask' && <EditTask navigateTo={navigateTo} taskId={taskId} userRole={userRole} userName={userName} userId={userId}/>}
      {currentPage === 'viewTask' && <ViewTask navigateTo={navigateTo} taskId={taskId} userRole={userRole} userName={userName} />}

    </div>
  );
}

export default App;