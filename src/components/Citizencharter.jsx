function CitizenCharter({ currentPage, setCurrentPage, handleLogout, BFP }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/BFP-Citizens-Charter.pdf';
    link.download = 'BFP-Citizens-Charter.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">BFP Citizen's Charter</h2>
          <p className="text-xl text-gray-600">Fire Safety Services & Requirements</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-16 text-center">
            <div className="mb-12">
              <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <div className="text-white text-6xl">📋</div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                Download BFP Citizen's Charter
              </h3>
              <p className="text-xl text-gray-600 mb-12">
                Get the complete guide for Fire Safety services, requirements, and procedures.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-red-50 rounded-2xl p-8">
                <div className="text-5xl mb-4">📝</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Complete Guide</h4>
                <p className="text-gray-600">All requirements and procedures in one document</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-8">
                <div className="text-5xl mb-4">⏱️</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Processing Times</h4>
                <p className="text-gray-600">Know exactly how long each step takes</p>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-8">
                <div className="text-5xl mb-4">💰</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Fee Structure</h4>
                <p className="text-gray-600">Complete breakdown of all applicable fees</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-12 mb-12">
              <h4 className="text-2xl font-bold text-gray-900 mb-8">What's Included:</h4>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-4"></span>
                    Transaction Classifications
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-4"></span>
                    Step-by-step Process Flow
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-4"></span>
                    Required Documents Checklist
                  </li>
                </ul>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-4"></span>
                    Fee Computation Examples
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-4"></span>
                    Contact Information
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-4"></span>
                    Important Notices & Warnings
                  </li>
                </ul>
              </div>
            </div>

            <button 
              onClick={handleDownload}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-6 px-16 rounded-2xl text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center justify-center space-x-4">
                <span className="text-2xl">📥</span>
                <span>Download PDF</span>
              </span>
            </button>

            <p className="text-gray-500 mt-6">
              PDF Size: ~2MB | Compatible with all devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CitizenCharter;