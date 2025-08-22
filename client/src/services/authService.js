import axios from 'axios';

const API_URL = '/api/auth';

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