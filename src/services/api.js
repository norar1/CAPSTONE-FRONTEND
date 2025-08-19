const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  static async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/account/firestation/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  static async createBusinessPermit(formData) {
    try {
      const cleanFcodeFee = parseFloat(formData.fcode_fee.toString().replace(/[₱,\s]/g, ''));
      
      const response = await fetch(`${API_BASE_URL}/firestation/business/CreatePermit`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          date_received: formData.date_received,
          owner_establishment: formData.owner_establishment,
          location: formData.location,
          fcode_fee: cleanFcodeFee,
          or_no: formData.or_no,
          evaluated_by: formData.evaluated_by,
          date_released_fsec: formData.date_released_fsec,
          control_no: formData.control_no
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create permit');
      }
      
      return result;
    } catch (error) {
      console.error('Create permit error:', error);
      throw error;
    }
  }

  static async createFSIC(formData) {
    try {
      const cleanAmountPaid = parseFloat(formData.amount_paid.toString().replace(/[₱,\s]/g, ''));
      const cleanFloorArea = parseInt(formData.floor_area);
      const cleanNoOfStoreys = parseInt(formData.no_of_storeys);
      
      const response = await fetch(`${API_BASE_URL}/businessfsic/data/CreatePermit`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          contact_number: formData.contact_number,
          business_name: formData.business_name,
          owner: formData.owner,
          brgy: formData.brgy,
          complete_address: formData.complete_address,
          floor_area: cleanFloorArea,
          no_of_storeys: cleanNoOfStoreys,
          rental: formData.rental,
          nature_of_business: formData.nature_of_business,
          bir_tin: formData.bir_tin,
          expiry: formData.expiry,
          amount_paid: cleanAmountPaid,
          or_number: formData.or_number,
          date_applied: formData.date_applied,
          type_of_occupancy: formData.type_of_occupancy,
          date_released: formData.date_released,
          status: formData.status
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create FSIC');
      }
      
      return result;
    } catch (error) {
      console.error('Create FSIC error:', error);
      throw error;
    }
  }

  static async getBusinessPermits() {
    try {
      const response = await fetch(`${API_BASE_URL}/firestation/business/permits`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch permits');
      }
      
      return result;
    } catch (error) {
      console.error('Get permits error:', error);
      throw error;
    }
  }

  static async updateBusinessPermit(permitId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/firestation/business/permits/${permitId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update permit');
      }
      
      return result;
    } catch (error) {
      console.error('Update permit error:', error);
      throw error;
    }
  }

  static async deleteBusinessPermit(permitId) {
    try {
      const response = await fetch(`${API_BASE_URL}/firestation/business/permits/${permitId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete permit');
      }
      
      return result;
    } catch (error) {
      console.error('Delete permit error:', error);
      throw error;
    }
  }
}

export default ApiService;