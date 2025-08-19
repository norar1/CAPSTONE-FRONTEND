import { useState } from 'react';
import BFP from '../assets/BFPLubao.png';
import HomePage from '../components/Homepage.jsx';
import CitizenCharter from '../components/Citizencharter.jsx';
import ApplicationForm from '../components/ApplicationForm.jsx';
import FSICApplicationForm from '../components/FSICApplicationForm.jsx';

function FirePermitSystem({ setIsAuthenticated }) {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch('http://localhost:3000/api/account/firestation/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      setIsAuthenticated(false);
    }
  };

  return (
    <div>
      {currentPage === 'home' && (
        <HomePage 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          BFP={BFP}
        />
      )}
      {currentPage === 'charter' && (
        <CitizenCharter 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          BFP={BFP}
        />
      )}
      {currentPage === 'application' && (
        <ApplicationForm 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          BFP={BFP}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
      {currentPage === 'fsic-application' && (
        <FSICApplicationForm 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          BFP={BFP}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
    </div>
  );
}

export default FirePermitSystem;