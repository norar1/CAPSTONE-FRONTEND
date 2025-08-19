import { useState } from 'react';
import ApiService from '../services/api';

function ApplicationForm({ currentPage, setCurrentPage, handleLogout, BFP, isLoading, setIsLoading }) {
  const [formData, setFormData] = useState({
    date_received: '',
    owner_establishment: '',
    location: '',
    fcode_fee: '',
    or_no: '',
    evaluated_by: '',
    date_released_fsec: '',
    control_no: ''
  });

  const [submitStatus, setSubmitStatus] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitStatus('');
    
    try {
      const result = await ApiService.createBusinessPermit(formData);
      
      setSubmitStatus('success');
      setShowPopup(true);
      setFormData({
        date_received: '',
        owner_establishment: '',
        location: '',
        fcode_fee: '',
        or_no: '',
        evaluated_by: '',
        date_released_fsec: '',
        control_no: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
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
                className="text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentPage('charter')}
                className="text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg transition-colors"
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Business Permit Application</h2>
          <p className="text-xl text-gray-600">Fire Station Clearance Form</p>
        </div>

        {submitStatus === 'error' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8 max-w-4xl mx-auto">
            <div className="flex items-center">
              <span className="text-xl mr-3">❌</span>
              <span className="font-medium">Error submitting application. Please check your authentication and try again.</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-5xl mx-auto border border-gray-100">
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-900 font-semibold mb-3 text-lg">Date Received</label>
                <input
                  type="date"
                  value={formData.date_received}
                  onChange={(e) => handleChange('date_received', e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-900 font-semibold mb-3 text-lg">Control Number</label>
                <input
                  type="text"
                  value={formData.control_no}
                  onChange={(e) => handleChange('control_no', e.target.value)}
                  placeholder="CTRL-2025-001"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-3 text-lg">Owner of Establishment</label>
              <input
                type="text"
                value={formData.owner_establishment}
                onChange={(e) => handleChange('owner_establishment', e.target.value)}
                placeholder="Full name of business owner"
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-3 text-lg">Business Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Complete business address"
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-900 font-semibold mb-3 text-lg">Fire Code Fee (₱)</label>
                <input
                  type="number"
                  value={formData.fcode_fee}
                  onChange={(e) => handleChange('fcode_fee', e.target.value)}
                  placeholder="1500"
                  min="0"
                  step="0.01"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-900 font-semibold mb-3 text-lg">Official Receipt Number</label>
                <input
                  type="text"
                  value={formData.or_no}
                  onChange={(e) => handleChange('or_no', e.target.value)}
                  placeholder="OR12345678"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-3 text-lg">Evaluated By</label>
              <input
                type="text"
                value={formData.evaluated_by}
                onChange={(e) => handleChange('evaluated_by', e.target.value)}
                placeholder="Fire Officer Name"
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-3 text-lg">Date Released FSEC</label>
              <input
                type="date"
                value={formData.date_released_fsec}
                onChange={(e) => handleChange('date_released_fsec', e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
                required
              />
            </div>

            <div className="flex gap-6 pt-8">
              <button
                onClick={() => setCurrentPage('home')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        </div>

        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-12 max-w-md mx-4 shadow-2xl">
              <div className="text-center">
                <div className="text-8xl mb-6">🎉</div>
                <h3 className="text-3xl font-bold text-green-600 mb-6">Application Submitted!</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Your business permit application has been successfully submitted. 
                  You will receive updates on the processing status.
                </p>
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setCurrentPage('home');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-12 rounded-xl transition-colors text-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationForm;