import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BusinessPermit from './Business.jsx';
import Occupancy from './Occupancy.jsx';
import FSIC from './BusinessFSIC.jsx';
import BFP from "../assets/BFPLubao.png";

function AdminDashboard({ setIsAuthenticated }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setUserData(user);
    setLoading(false);
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) setSidebarOpen(false);
      else if (window.innerWidth >= 1024 && !sidebarOpen) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  useEffect(() => {
    if (activeSection === 'dashboard') fetchStats();
  }, [activeSection]);

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [activeSection]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/firestation/business/GetPermit');
      const data = await response.json();
      if (data.success) {
        const counts = { pending: 0, approved: 0, rejected: 0 };
        data.permits.forEach(permit => {
          if (permit.status === 'pending') counts.pending++;
          else if (permit.status === 'approved') counts.approved++;
          else if (permit.status === 'rejected') counts.rejected++;
        });
        setStats(counts);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const renderDashboard = () => (
    <div>
      <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-bold text-blue-700 mb-4">Permit Status Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 md:p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-yellow-800 font-bold text-xl md:text-2xl">{stats.pending}</h3>
                <p className="text-yellow-600 text-sm md:text-base">Pending Permits</p>
              </div>
              <div className="bg-yellow-200 p-2 md:p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-green-100 border-l-4 border-green-500 p-3 md:p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-green-800 font-bold text-xl md:text-2xl">{stats.approved}</h3>
                <p className="text-green-600 text-sm md:text-base">Approved Permits</p>
              </div>
              <div className="bg-green-200 p-2 md:p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
          </div>
          <div className="bg-red-100 border-l-4 border-red-500 p-3 md:p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-bold text-xl md:text-2xl">{stats.rejected}</h3>
                <p className="text-red-600 text-sm md:text-base">Rejected Permits</p>
              </div>
              <div className="bg-red-200 p-2 md:p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-red-100 p-4 md:p-6 rounded-lg shadow border-2 border-red-300 hover:shadow-lg transition-all cursor-pointer" onClick={() => setActiveSection('businessPermit')}>
          <h3 className="text-lg md:text-xl font-bold text-red-700 mb-2">Building Permit Management</h3>
          <p className="text-gray-600 text-sm md:text-base">Create, update, and manage building permits.</p>
          <button className="mt-3 md:mt-4 bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-1 md:py-2 rounded text-sm md:text-base">Access Building Permits</button>
        </div>
        <div className="bg-blue-100 p-4 md:p-6 rounded-lg shadow border-2 border-blue-300 hover:shadow-lg transition-all cursor-pointer" onClick={() => setActiveSection('occupancy')}>
          <h3 className="text-lg md:text-xl font-bold text-blue-700 mb-2">Occupancy Management</h3>
          <p className="text-gray-600 text-sm md:text-base">Create, update, and manage occupancy permits.</p>
          <button className="mt-3 md:mt-4 bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-1 md:py-2 rounded text-sm md:text-base">Access Occupancy Permits</button>
        </div>
        <div className="bg-orange-100 p-4 md:p-6 rounded-lg shadow border-2 border-orange-300 hover:shadow-lg transition-all cursor-pointer" onClick={() => setActiveSection('fsic')}>
          <h3 className="text-lg md:text-xl font-bold text-orange-700 mb-2">Fire Safety Inspection Certificate</h3>
          <p className="text-gray-600 text-sm md:text-base">Create, update, and manage FSIC permits.</p>
          <button className="mt-3 md:mt-4 bg-orange-500 hover:bg-orange-600 text-white px-3 md:px-4 py-1 md:py-2 rounded text-sm md:text-base">Access FSIC Permits</button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'businessPermit': return <BusinessPermit onUpdateStats={fetchStats} />;
      case 'occupancy': return <Occupancy onUpdateStats={fetchStats} />;
      case 'fsic': return <FSIC onUpdateStats={fetchStats} />;
      default: return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg border-4 border-blue-500">
          <h2 className="text-xl md:text-2xl font-bold text-blue-700">Loading...</h2>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className={`bg-red-200 text-gray-800 fixed md:relative z-30 h-screen ${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'left-0' : '-left-64 md:left-0'}`}>
        <div className="p-3 md:p-4 border-b border-red-300 flex items-center justify-between">
          <h1 className={`font-bold ${sidebarOpen ? 'text-lg md:text-xl' : 'text-xs md:text-sm'} ${!sidebarOpen && 'md:block hidden'} text-center`}>{sidebarOpen ? 'Lubao Fire Station' : 'LFS'}</h1>
          <div className="flex items-center">
            <img src={BFP} alt="BFP Lubao Logo" className={`transition-all duration-200 ${sidebarOpen ? 'h-12 w-12' : 'h-8 w-8'}`} />
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 md:p-2 bg-red-300 hover:bg-red-400 rounded md:hidden ml-2">{sidebarOpen ? '✕' : '☰'}</button>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 md:p-2 bg-red-300 hover:bg-red-400 self-end m-2 rounded hidden md:block">{sidebarOpen ? '←' : '→'}</button>
        <div className="flex flex-col flex-grow mt-4 md:mt-6">
          <button onClick={() => setActiveSection('dashboard')} className={`py-2 md:py-3 px-3 md:px-4 ${activeSection === 'dashboard' ? 'bg-red-300' : 'hover:bg-red-300'} flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            {sidebarOpen && <span className="ml-3 text-sm md:text-base">Dashboard</span>}
          </button>
          <button onClick={() => setActiveSection('businessPermit')} className={`py-2 md:py-3 px-3 md:px-4 ${activeSection === 'businessPermit' ? 'bg-red-300' : 'hover:bg-red-300'} flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            {sidebarOpen && <span className="ml-3 text-sm md:text-base">Business</span>}
          </button>
          <button onClick={() => setActiveSection('occupancy')} className={`py-2 md:py-3 px-3 md:px-4 ${activeSection === 'occupancy' ? 'bg-red-300' : 'hover:bg-red-300'} flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {sidebarOpen && <span className="ml-3 text-sm md:text-base">Occupancy</span>}
          </button>
          <button onClick={() => setActiveSection('fsic')} className={`py-2 md:py-3 px-3 md:px-4 ${activeSection === 'fsic' ? 'bg-red-300' : 'hover:bg-red-300'} flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {sidebarOpen && <span className="ml-3 text-sm md:text-base">FSIC</span>}
          </button>
        </div>
        <div className="mt-auto border-t border-red-300 p-3 md:p-4">
          {userData && sidebarOpen && <div className="text-xs md:text-sm mb-2 md:mb-3 text-red-800"><span>{userData.email}</span></div>}
          <button onClick={handleLogout} className="flex items-center w-full bg-red-600 hover:bg-red-700 text-white py-1 md:py-2 px-2 md:px-3 rounded text-sm md:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </button>
        </div>
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
      <div className="flex-1 overflow-auto w-full">
        <div className="p-4 md:p-8">
          <div className="flex items-center mb-4 md:mb-6">
            {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} className="mr-3 p-2 bg-red-400 text-white rounded md:hidden">☰</button>}
            <h2 className="text-xl md:text-2xl font-bold text-blue-700">
              {activeSection === 'dashboard' ? 'Lubao Fire Station Management System' : 
               activeSection === 'businessPermit' ? 'Building Permit Management' : 
               activeSection === 'occupancy' ? 'Occupancy Management' : 
               'Fire Safety Inspection Certificate Management'}
            </h2>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;