import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function FSIC({ onUpdateStats }) {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [formData, setFormData] = useState({
    contact_number: '',
    business_name: '',
    owner: '',
    brgy: '',
    complete_address: '',
    floor_area: '',
    no_of_storeys: '',
    rental: '',
    nature_of_business: '',
    bir_tin: '',
    expiry: '',
    amount_paid: 0,
    or_number: '',
    date_applied: '',
    type_of_occupancy: '',
    date_released: '',
    status: 'pending'
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchQuery, selectedMonth, selectedYear, statusFilter]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/businessfsic/data/GetPermit');
      const data = await response.json();
      if (data.success && data.permits) {
        setBusinesses(data.permits);
      } else {
        setBusinesses([]);
      }
    } catch (error) {
      setBusinesses([]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBusinesses();
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/businessfsic/data/search?query=${searchQuery}`);
      const data = await response.json();
      if (data.success && data.permits) {
        setBusinesses(data.permits);
      } else {
        setBusinesses([]);
      }
    } catch (error) {
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
    
    if (statusFilter) {
      filtered = filtered.filter(business => business.status === statusFilter);
    }
    
    if (selectedMonth) {
      filtered = filtered.filter(business => {
        const date = new Date(business.date_applied);
        const month = date.getMonth() + 1;
        return month.toString() === selectedMonth;
      });
    }
    
    if (selectedYear) {
      filtered = filtered.filter(business => {
        const date = new Date(business.date_applied);
        const year = date.getFullYear();
        return year.toString() === selectedYear;
      });
    }
    
    filtered.sort((a, b) => new Date(b.date_applied) - new Date(a.date_applied));
    
    setFilteredBusinesses(filtered);
    setCurrentPage(1);
  };

  const getRowColor = (business) => {
    switch (business.status) {
      case 'approved':
        return 'bg-green-100 hover:bg-green-200';
      case 'rejected':
        return 'bg-red-100 hover:bg-red-200';
      case 'pending':
        return 'bg-yellow-100 hover:bg-yellow-200';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  const handleStatusChange = async (businessId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/businessfsic/data/UpdateStatus/${businessId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchBusinesses();
        if (onUpdateStats) {
          onUpdateStats();
        }
        
        let message = '';
        switch (newStatus) {
          case 'approved':
            message = '✅ Permit has been approved successfully!';
            break;
          case 'rejected':
            message = '❌ Permit has been rejected.';
            break;
          case 'pending':
            message = '⏳ Permit status changed to pending.';
            break;
          default:
            message = `Status updated to ${newStatus}`;
        }
        showNotification(message, newStatus === 'approved' ? 'success' : newStatus === 'rejected' ? 'error' : 'info');
      } else {
        showNotification('❌ Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('❌ Error updating status', 'error');
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    let dataToExport = filteredBusinesses;
    
    if (selectedMonth === '' && selectedYear === '' && statusFilter === '') {
      dataToExport = businesses;
    }
    
    dataToExport.sort((a, b) => new Date(b.date_applied) - new Date(a.date_applied));
    
    const excelData = dataToExport.map(item => ({
      'Contact Number': item.contact_number,
      'Business Name': item.business_name,
      'Owner': item.owner,
      'Barangay': item.brgy,
      'Complete Address': item.complete_address,
      'Floor Area (SQM)': item.floor_area,
      'No of Storeys': item.no_of_storeys,
      'Rental': item.rental,
      'Nature of Business': item.nature_of_business,
      'BIR TIN': item.bir_tin,
      'Expiry': item.expiry,
      'Amount Paid': item.amount_paid,
      'OR Number': item.or_number,
      'Date Applied': item.date_applied,
      'Type of Occupancy': item.type_of_occupancy,
      'Date Released': item.date_released,
      'Status': item.status
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "FSIC Permits");
    XLSX.writeFile(wb, "FSIC_Permits_Report.xlsx");
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
      const url = editingId 
        ? `http://localhost:3000/api/businessfsic/data/UpdatePermit/${editingId}`
        : 'http://localhost:3000/api/businessfsic/data/CreatePermit';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormData({
          contact_number: '',
          business_name: '',
          owner: '',
          brgy: '',
          complete_address: '',
          floor_area: '',
          no_of_storeys: '',
          rental: '',
          nature_of_business: '',
          bir_tin: '',
          expiry: '',
          amount_paid: 0,
          or_number: '',
          date_applied: '',
          type_of_occupancy: '',
          date_released: '',
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
      contact_number: business.contact_number || '',
      business_name: business.business_name || '',
      owner: business.owner || '',
      brgy: business.brgy || '',
      complete_address: business.complete_address || '',
      floor_area: business.floor_area || '',
      no_of_storeys: business.no_of_storeys || '',
      rental: business.rental || '',
      nature_of_business: business.nature_of_business || '',
      bir_tin: business.bir_tin || '',
      expiry: business.expiry || '',
      amount_paid: business.amount_paid || 0,
      or_number: business.or_number || '',
      date_applied: business.date_applied || '',
      type_of_occupancy: business.type_of_occupancy || '',
      date_released: business.date_released || '',
      status: business.status || 'pending'
    });
    setEditingId(business._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/businessfsic/data/DeletePermit/${id}`, {
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
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-6xl mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
          <h3 className="text-lg md:text-xl font-bold text-red-700">
            {editingId ? 'Update FSIC Permit' : 'Create FSIC Permit'}
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
              <label className="block text-gray-700 mb-1 text-sm">Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Business Name *</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Owner *</label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Barangay</label>
              <input
                type="text"
                name="brgy"
                value={formData.brgy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Complete Address</label>
              <input
                type="text"
                name="complete_address"
                value={formData.complete_address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Floor Area (SQM)</label>
              <input
                type="number"
                name="floor_area"
                value={formData.floor_area}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                step="0.01"
                min="0"
                placeholder="Enter floor area in square meters"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">No. of Storeys</label>
              <input
                type="number"
                name="no_of_storeys"
                value={formData.no_of_storeys}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Rental</label>
              <select
                name="rental"
                value={formData.rental}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select</option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Nature of Business</label>
              <input
                type="text"
                name="nature_of_business"
                value={formData.nature_of_business}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">BIR TIN</label>
              <input
                type="text"
                name="bir_tin"
                value={formData.bir_tin}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Expiry</label>
              <input
                type="date"
                name="expiry"
                value={formData.expiry}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Amount Paid</label>
              <input
                type="number"
                name="amount_paid"
                value={formData.amount_paid}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">OR Number *</label>
              <input
                type="text"
                name="or_number"
                value={formData.or_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Date Applied</label>
              <input
                type="date"
                name="date_applied"
                value={formData.date_applied}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Type of Occupancy</label>
              <input
                type="text"
                name="type_of_occupancy"
                value={formData.type_of_occupancy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Date Released</label>
              <input
                type="date"
                name="date_released"
                value={formData.date_released}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
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
                  contact_number: '',
                  business_name: '',
                  owner: '',
                  brgy: '',
                  complete_address: '',
                  floor_area: '',
                  no_of_storeys: '',
                  rental: '',
                  nature_of_business: '',
                  bir_tin: '',
                  expiry: '',
                  amount_paid: 0,
                  or_number: '',
                  date_applied: '',
                  type_of_occupancy: '',
                  date_released: '',
                  status: 'pending'
                });
                setEditingId(null);
                setShowForm(false);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
          notification.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
          'bg-blue-100 border border-blue-400 text-blue-700'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">{notification.message}</span>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {showForm && renderForm()}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
          <h3 className="text-lg md:text-xl font-bold text-red-700">Fire Safety Inspection Certificate</h3>
          
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
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8a4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
            
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
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-4 text-xs items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
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
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
        </div>
        
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 table-fixed border-collapse">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-300">
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24 border-r border-gray-200">Contact Number</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32 border-r border-gray-200">Business Name</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-28 border-r border-gray-200">Owner</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-20 border-r border-gray-200">Barangay</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32 border-r border-gray-200">Complete Address</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-20 border-r border-gray-200">Floor Area (SQM)</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-16 border-r border-gray-200">Storeys</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-16 border-r border-gray-200">Rental</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-28 border-r border-gray-200">Nature of Business</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24 border-r border-gray-200">BIR TIN</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-20 border-r border-gray-200">Expiry</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-20 border-r border-gray-200">Amount Paid</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24 border-r border-gray-200">OR Number</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-20 border-r border-gray-200">Date Applied</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-28 border-r border-gray-200">Type of Occupancy</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-20 border-r border-gray-200">Date Released</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-28 border-r border-gray-200">Status</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((business) => (
                  <tr key={business._id} className={`border-b border-gray-200 ${getRowColor(business)}`}>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.contact_number || 'N/A'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.business_name || 'N/A'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.owner || 'N/A'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.brgy || 'N/A'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.complete_address || 'N/A'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.floor_area ? `${business.floor_area} sqm` : 'N/A'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.no_of_storeys || 'N/A'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.rental || 'N/A'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.nature_of_business || 'N/A'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.bir_tin || 'N/A'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>
                      {business.expiry ? new Date(business.expiry).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.amount_paid || '0'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.or_number || 'N/A'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>
                      {business.date_applied ? new Date(business.date_applied).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.type_of_occupancy || 'N/A'}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>
                      {business.date_released ? new Date(business.date_released).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className={`px-2 md:px-3 ${rowSize} border-r border-gray-200`}>
                      <select
                        value={business.status || 'pending'}
                        onChange={(e) => handleStatusChange(business._id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white min-w-[80px]"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="18" className="px-6 py-4 text-center text-sm text-gray-500">
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
    </>
  );
}

export default FSIC;