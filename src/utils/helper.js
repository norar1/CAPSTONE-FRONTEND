export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const validateFormData = (formData) => {
  const errors = {};
  
  if (!formData.date_received) {
    errors.date_received = 'Date received is required';
  }
  
  if (!formData.owner_establishment) {
    errors.owner_establishment = 'Owner name is required';
  }
  
  if (!formData.location) {
    errors.location = 'Business location is required';
  }
  
  if (!formData.fcode_fee || isNaN(formData.fcode_fee) || parseFloat(formData.fcode_fee) <= 0) {
    errors.fcode_fee = 'Valid fire code fee is required';
  }
  
  if (!formData.or_no) {
    errors.or_no = 'Official receipt number is required';
  }
  
  if (!formData.evaluated_by) {
    errors.evaluated_by = 'Evaluator name is required';
  }
  
  if (!formData.date_released_fsec) {
    errors.date_released_fsec = 'FSEC release date is required';
  }
  
  if (!formData.control_no) {
    errors.control_no = 'Control number is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const cleanPhoneNumber = (phone) => {
  return phone.replace(/[^\d]/g, '');
};

export const generateControlNumber = () => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `CTRL-${year}-${timestamp}`;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const downloadPDF = (filename, url) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};