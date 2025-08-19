function Navigation({ currentPage, setCurrentPage, handleLogout, BFP }) {
  return (
    <nav className="bg-white shadow-lg border-b-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <img src={BFP} alt="BFP Lubao" className="h-12 w-12 mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-red-700">Lubao Fire Station</h1>
              <p className="text-red-600 text-sm">Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'home' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentPage('charter')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'charter' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Citizen's Charter
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;