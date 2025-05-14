import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function BusinessPermit({ onUpdateStats }) {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [formData, setFormData] = useState({
    date_received: '',
    owner_establishment: '',
    location: '',
    fcode_fee: '',
    or_no: '',
    evaluated_by: '',
    date_released_fsec: '',
    control_no: '',
    status: 'pending'
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchQuery, selectedMonth]);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/firestation/business/GetPermit');
      const data = await response.json();
      if (data.success) {
        setBusinesses(data.businesses);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBusinesses();
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/firestation/business/search?query=${searchQuery}`);
      const data = await response.json();
      if (data.success) {
        setBusinesses(data.businesses);
      } else {
        setBusinesses([]);
      }
    } catch (error) {
      console.error('Error searching businesses:', error);
      setBusinesses([]);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleSearch(); 
    }
  };

  const filterBusinesses = () => {
    let filtered = [...businesses];
    
    if (selectedMonth) {
      filtered = filtered.filter(business => {
        const date = new Date(business.date_received);
        const month = date.getMonth() + 1;
        return month.toString() === selectedMonth;
      });
    }
    
    setFilteredBusinesses(filtered);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = 'http://localhost:3000/api/firestation/business/CreatePermit';
      let method = 'POST';
      
      if (editingId) {
        url = `http://localhost:3000/api/firestation/business/UpdatePermit/${editingId}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormData({
          date_received: '',
          owner_establishment: '',
          location: '',
          fcode_fee: '',
          or_no: '',
          evaluated_by: '',
          date_released_fsec: '',
          control_no: '',
          status: 'pending'
        });
        setEditingId(null);
        setShowForm(false);
        fetchBusinesses();
        if (onUpdateStats) {
          onUpdateStats();
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (business) => {
    setFormData({
      date_received: business.date_received,
      owner_establishment: business.owner_establishment,
      location: business.location,
      fcode_fee: business.fcode_fee,
      or_no: business.or_no,
      evaluated_by: business.evaluated_by,
      date_released_fsec: business.date_released_fsec,
      control_no: business.control_no,
      status: business.status || 'pending'
    });
    setEditingId(business._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/firestation/business/DeletePermit/${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          fetchBusinesses();
          if (onUpdateStats) {
            onUpdateStats();
          }
        }
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const business = businesses.find(b => b._id === id);
      if (!business) {
        console.error('Business not found');
        return;
      }
      
      const updatedBusiness = {
        ...business,
        status: newStatus
      };
      
      const response = await fetch(`http://localhost:3000/api/firestation/business/UpdatePermit/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBusiness),
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchBusinesses();
        if (onUpdateStats) {
          onUpdateStats();
        }
      } else {
        console.error('API returned error:', data.message || 'Unknown error');
        alert('Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating the status.');
    }
  };

  // Function to export data to Excel
  const exportToExcel = () => {
    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Format the data for Excel
    const excelData = filteredBusinesses.map(item => ({
      'Date Received': item.date_received,
      'Owner/Establishment': item.owner_establishment,
      'Location': item.location,
      'FCODE Fee': item.fcode_fee,
      'OR No.': item.or_no,
      'Evaluated By': item.evaluated_by,
      'Date Released FSEC': item.date_released_fsec,
      'Control No.': item.control_no,
      'Status': item.status || 'pending'
    }));
    
    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Building Permits");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "Building_Permits_Report.xlsx");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBusinesses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex items-center justify-center mt-4">
        <button
          onClick={() => paginate(1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 mx-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          &laquo;
        </button>
        <button
          onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
          disabled={currentPage === 1}
          className={`px-2 py-1 mx-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          &lsaquo;
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => paginate(1)}
              className="px-2 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              1
            </button>
            {startPage > 2 && <span className="mx-1">...</span>}
          </>
        )}
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-2 py-1 mx-1 rounded ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="mx-1">...</span>}
            <button
              onClick={() => paginate(totalPages)}
              className="px-2 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-2 py-1 mx-1 rounded ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          &rsaquo;
        </button>
        <button
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-2 py-1 mx-1 rounded ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          &raquo;
        </button>
      </div>
    );
  };

  const getRowSize = () => {
    if (filteredBusinesses.length > 15) {
      return 'py-1 text-xs';
    } else if (filteredBusinesses.length > 8) {
      return 'py-2 text-xs';
    }
    return 'py-2 md:py-3 text-xs md:text-sm';
  };

  const rowSize = getRowSize();

  const renderForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto pt-10 pb-10">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-5xl mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
          <h3 className="text-lg md:text-xl font-bold text-blue-700">
            {editingId ? 'Update' : 'Create New'} Building Permit
          </h3>
          <button 
            type="button"
            onClick={() => setShowForm(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Date Received</label>
              <input
                type="date"
                name="date_received"
                value={formData.date_received}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Owner/Establishment</label>
              <input
                type="text"
                name="owner_establishment"
                value={formData.owner_establishment}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">FCODE Fee</label>
              <input
                type="number"
                name="fcode_fee"
                value={formData.fcode_fee}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">OR No.</label>
              <input
                type="text"
                name="or_no"
                value={formData.or_no}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Evaluated By</label>
              <input
                type="text"
                name="evaluated_by"
                value={formData.evaluated_by}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Date Released FSEC</label>
              <input
                type="date"
                name="date_released_fsec"
                value={formData.date_released_fsec}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Control No.</label>
              <input
                type="text"
                name="control_no"
                value={formData.control_no}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end sticky bottom-0 bg-white pt-2 border-t">
            <button 
              type="button" 
              onClick={() => {
                setFormData({
                  date_received: '',
                  owner_establishment: '',
                  location: '',
                  fcode_fee: '',
                  or_no: '',
                  evaluated_by: '',
                  date_released_fsec: '',
                  control_no: '',
                  status: 'pending'
                });
                setEditingId(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {editingId ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderTable = () => (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
        <h3 className="text-lg md:text-xl font-bold text-blue-700">Building Permits</h3>
        
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex w-full md:w-auto">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="px-4 py-2 border border-gray-300 rounded-l focus:outline-none w-full"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
          
          {/* Export to Excel button */}
          <button 
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center justify-center"
            title="Export to Excel"
          >
            <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            Excel
          </button>
          
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none w-full md:w-auto"
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
          
          <button 
            onClick={() => {
              setFormData({
                date_received: '',
                owner_establishment: '',
                location: '',
                fcode_fee: '',
                or_no: '',
                evaluated_by: '',
                date_released_fsec: '',
                control_no: '',
                status: 'pending'
              });
              setEditingId(null);
              setShowForm(true);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center w-full md:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 md:w-28">Date Received</th>
              <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36 md:w-40">Owner/Establishment</th>
              <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36 md:w-40">Location</th>
              <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 md:w-24">FCODE Fee</th>
              <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 md:w-24">OR No.</th>
              <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 md:w-32">Evaluated By</th>
              <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 md:w-28">Date Released</th>
              <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 md:w-28">Control No.</th>
              <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Status</th>
              <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 md:w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((business) => (
                <tr key={business._id} className="hover:bg-gray-50">
                  <td className={`px-2 md:px-3 ${rowSize} truncate`}>{business.date_received}</td>
                  <td className={`px-2 md:px-3 ${rowSize} truncate`}>{business.owner_establishment}</td>
                  <td className={`px-2 md:px-3 ${rowSize} truncate`}>{business.location}</td>
                  <td className={`px-2 md:px-3 ${rowSize} truncate`}>{business.fcode_fee}</td>
                  <td className={`px-2 md:px-3 ${rowSize} truncate`}>{business.or_no}</td>
                  <td className={`px-2 md:px-3 ${rowSize} truncate`}>{business.evaluated_by}</td>
                  <td className={`px-2 md:px-3 ${rowSize} truncate`}>{business.date_released_fsec}</td>
                  <td className={`px-2 md:px-3 ${rowSize} truncate`}>{business.control_no}</td>
                  <td className={`px-2 md:px-3 ${rowSize}`}>
                    <span className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${business.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        business.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}>
                      {business.status || 'pending'}
                    </span>
                  </td>
                  <td className={`px-2 md:px-3 ${rowSize}`}>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(business)}
                        className="text-blue-600 hover:text-blue-900 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(business._id)}
                        className="text-red-600 hover:text-red-900 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div className="mt-1">
                      <select
                        value={business.status}
                        onChange={(e) => handleStatusChange(business._id, e.target.value)}
                        className="text-xs w-full border border-gray-300 rounded px-1 py-0.5"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {filteredBusinesses.length > 0 && renderPagination()}
      
      {filteredBusinesses.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-right">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBusinesses.length)} of {filteredBusinesses.length} records
        </div>
      )}
    </div>
  );

  return (
    <>
      {showForm && renderForm()}
      {renderTable()}
    </>
  );
}

export default BusinessPermit;