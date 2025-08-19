
export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:3000/api',
  LOGOUT: '/account/firestation/logout',
  CREATE_PERMIT: '/firestation/business/CreatePermit',
  GET_PERMITS: '/firestation/business/permits',
  UPDATE_PERMIT: '/firestation/business/permits',
  DELETE_PERMIT: '/firestation/business/permits'
};

export const PAGES = {
  HOME: 'home',
  CHARTER: 'charter',
  APPLICATION: 'application',
  PERMITS_LIST: 'permits-list',
  PROFILE: 'profile'
};

export const PERMIT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const FORM_FIELDS = {
  DATE_RECEIVED: 'date_received',
  OWNER_ESTABLISHMENT: 'owner_establishment',
  LOCATION: 'location',
  FCODE_FEE: 'fcode_fee',
  OR_NO: 'or_no',
  EVALUATED_BY: 'evaluated_by',
  DATE_RELEASED_FSEC: 'date_released_fsec',
  CONTROL_NO: 'control_no'
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  ROLE: 'role',
  USER_ID: 'userId'
};

export const ERROR_MESSAGES = {
  NO_TOKEN: 'No authentication token found',
  INVALID_TOKEN: 'Invalid or expired token',
  NETWORK_ERROR: 'Network error occurred',
  SERVER_ERROR: 'Server error occurred',
  VALIDATION_ERROR: 'Please fill in all required fields',
  PERMISSION_DENIED: 'You do not have permission to perform this action'
};

export const SUCCESS_MESSAGES = {
  PERMIT_CREATED: 'Business permit application submitted successfully',
  PERMIT_UPDATED: 'Business permit updated successfully',
  PERMIT_DELETED: 'Business permit deleted successfully',
  LOGOUT_SUCCESS: 'Logged out successfully'
};

export const VALIDATION_RULES = {
  MIN_FEE: 0,
  MAX_FEE: 999999.99,
  CONTROL_NO_PREFIX: 'CTRL-',
  OR_NO_PREFIX: 'OR'
};

export const DATE_FORMATS = {
  DISPLAY: 'MMMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  API: 'YYYY-MM-DD'
};

export const FILE_TYPES = {
  PDF: 'application/pdf',
  IMAGE: 'image/*',
  DOCUMENT: '.pdf,.doc,.docx'
};

export const MODAL_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  CONFIRM: 'confirm'
};