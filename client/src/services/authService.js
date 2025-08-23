import axios from 'axios';
import API_BASE_URL from '../config/api';

//const API_URL = '/api/auth';
const API_URL = `${API_BASE_URL}/api/auth`;

const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    return response.data;
  },

  signup: async (username, email, password) => {
    const response = await axios.post(`${API_URL}/signup`, {
      username,
      email,
      password
    });
    return response.data;
  }
};

export default authService;