import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function Occupancy({ onUpdateStats }) {
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
    status: 'approved',
    payment_status_occupancy: 'not_paid',
    last_payment_date_occupancy: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showPaidThisYear, setShowPaidThisYear] = useState(false);
  const [showNotPaid, setShowNotPaid] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchQuery, selectedMonth, selectedYear, showPaidThisYear, showNotPaid]);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/firestation/business/GetPermit');
      const data = await response.json();
      if (data.success && data.permits) {
        setBusinesses(data.permits);
      } else if (data.success && data.businesses) {
        setBusinesses(data.businesses);
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
      const response = await fetch(`http://localhost:3000/api/firestation/business/search?query=${searchQuery}`);
      const data = await response.json();
      if (data.success && data.permits) {
        setBusinesses(data.permits);
      } else if (data.success && data.businesses) {
        setBusinesses(data.businesses);
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
    let filtered = businesses.filter(business => business.status === 'approved');
    
    if (selectedMonth) {
      filtered = filtered.filter(business => {
        const date = new Date(business.date_received);
        const month = date.getMonth() + 1;
        return month.toString() === selectedMonth;
      });
    }
    
    if (selectedYear) {
      filtered = filtered.filter(business => {
        const date = new Date(business.date_received);
        const year = date.getFullYear();
        return year.toString() === selectedYear;
      });
    }
    
    if (showPaidThisYear || showNotPaid) {
      filtered = filtered.filter(business => {
        const currentYear = new Date().getFullYear();
        const paymentYear = business.last_payment_date_occupancy 
          ? new Date(business.last_payment_date_occupancy).getFullYear() 
          : null;
        
        const isPaidThisYear = business.payment_status_occupancy === 'paid' && paymentYear === currentYear;
        
        if (showPaidThisYear && isPaidThisYear) return true;
        if (showNotPaid && !isPaidThisYear) return true;
        return false;
      });
    }
    
    filtered.sort((a, b) => new Date(b.date_received) - new Date(a.date_received));
    
    setFilteredBusinesses(filtered);
    setCurrentPage(1);
  };

  const getRowColor = (business) => {
    const currentYear = new Date().getFullYear();
    const paymentYear = business.last_payment_date_occupancy 
      ? new Date(business.last_payment_date_occupancy).getFullYear() 
      : null;
    
    const isPaidThisYear = business.payment_status_occupancy === 'paid' && paymentYear === currentYear;
    
    if (isPaidThisYear) {
      return 'bg-green-100 hover:bg-green-200';
    } else {
      return 'bg-red-100 hover:bg-red-200';
    }
  };

  const handleOccupancyPaymentStatusChange = async (businessId, newStatus) => {
    try {
      const updateData = {
        payment_status_occupancy: newStatus,
        last_payment_date_occupancy: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null
      };

      const response = await fetch(`http://localhost:3000/api/firestation/business/UpdateOccupancyPaymentStatus/${businessId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchBusinesses();
        if (onUpdateStats) {
          onUpdateStats();
        }
      }
    } catch (error) {
      console.error('Error updating occupancy payment status:', error);
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    let dataToExport = filteredBusinesses;
    
    if (selectedMonth === '' && selectedYear === '') {
      dataToExport = businesses.filter(business => business.status === 'approved');
    }
    
    dataToExport.sort((a, b) => new Date(b.date_received) - new Date(a.date_received));
    
    const excelData = dataToExport.map(item => ({
      'Date Received': item.date_received,
      'Owner/Establishment': item.owner_establishment,
      'Location': item.location,
      'FCODE Fee': item.fcode_fee,
      'OR No.': item.or_no,
      'Inspected By': item.evaluated_by,
      'Date Released FSIC': item.date_released_fsec,
      'Control No.': item.control_no,
      'Occupancy Payment Status': item.payment_status_occupancy === 'paid' ? 'Paid' : 'Not Paid',
      'Occupancy Payment Date': item.last_payment_date_occupancy || 'N/A'
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Occupancy Permits");
    XLSX.writeFile(wb, "Occupancy_Permits_Report.xlsx");
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
      const response = await fetch(`http://localhost:3000/api/firestation/business/UpdatePermit/${editingId}`, {
        method: 'PUT',
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
          status: 'approved',
          payment_status_occupancy: 'not_paid',
          last_payment_date_occupancy: ''
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
      status: business.status || 'approved',
      payment_status_occupancy: business.payment_status_occupancy || 'not_paid',
      last_payment_date_occupancy: business.last_payment_date_occupancy || ''
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
          <h3 className="text-lg md:text-xl font-bold text-red-700">
            Update Occupancy Permit
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
              <label className="block text-gray-700 mb-1 text-sm">Inspected By</label>
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
              <label className="block text-gray-700 mb-1 text-sm">Date Released FSIC</label>
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
              <label className="block text-gray-700 mb-1 text-sm">Occupancy Payment Status</label>
              <select
                name="payment_status_occupancy"
                value={formData.payment_status_occupancy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="not_paid">Not Paid</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {formData.payment_status_occupancy === 'paid' && (
              <div>
                <label className="block text-gray-700 mb-1 text-sm">Occupancy Payment Date</label>
                <input
                  type="date"
                  name="last_payment_date_occupancy"
                  value={formData.last_payment_date_occupancy}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            )}
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
                  status: 'approved',
                  payment_status_occupancy: 'not_paid',
                  last_payment_date_occupancy: ''
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
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {showForm && renderForm()}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
          <h3 className="text-lg md:text-xl font-bold text-red-700">Occupancy Permits</h3>
          
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
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none w-full md:w-auto"
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-4 text-xs items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPaidThisYear"
              checked={showPaidThisYear}
              onChange={() => setShowPaidThisYear(!showPaidThisYear)}
              className="mr-2"
            />
            <label htmlFor="showPaidThisYear">Paid This Year</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showNotPaid"
              checked={showNotPaid}
              onChange={() => setShowNotPaid(!showNotPaid)}
              className="mr-2"
            />
            <label htmlFor="showNotPaid">Not Paid / Overdue</label>
          </div>
        </div>
        
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 table-fixed border-collapse">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-300">
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24 md:w-28 border-r border-gray-200">Date Received</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-36 md:w-40 border-r border-gray-200">Owner/Establishment</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-36 md:w-40 border-r border-gray-200">Location</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-20 md:w-24 border-r border-gray-200">FCODE Fee</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-20 md:w-24 border-r border-gray-200">OR No.</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-28 md:w-32 border-r border-gray-200">Inspected By</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24 md:w-28 border-r border-gray-200">Date Released</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24 md:w-28 border-r border-gray-200">Control No.</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-28 md:w-32 border-r border-gray-200">Occupancy Payment</th>
                <th className="px-2 md:px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24 md:w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((business) => (
                  <tr key={business._id} className={`border-b border-gray-200 ${getRowColor(business)}`}>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.date_received}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.owner_establishment}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.location}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.fcode_fee}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.or_no}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.evaluated_by}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.date_released_fsec}</td>
                    <td className={`px-2 md:px-3 ${rowSize} truncate border-r border-gray-200`}>{business.control_no}</td>
                    <td className={`px-2 md:px-3 ${rowSize} border-r border-gray-200`}>
                      <select
                        value={business.payment_status_occupancy || 'not_paid'}
                        onChange={(e) => handleOccupancyPaymentStatusChange(business._id, e.target.value)}
                        className="w-full px-1 py-1 border border-gray-300 rounded text-xs bg-white"
                      >
                        <option value="not_paid">Not Paid</option>
                        <option value="paid">Paid</option>
                      </select>
                      {business.last_payment_date_occupancy && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(business.last_payment_date_occupancy).toLocaleDateString()}
                        </div>
                      )}
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
    </>
  );
}

export default Occupancy;