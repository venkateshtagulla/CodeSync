import axios from 'axios';
import API_BASE_URL from '../config/api';

//const API_URL = '/api/rooms';
const API_URL = `${API_BASE_URL}/api/rooms`;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const roomService = {
  createRoom: async (name) => {
    const response = await axios.post(API_URL, { name }, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getRoomInfo: async (roomId) => {
    const response = await axios.get(`${API_URL}/${roomId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getUserRooms: async () => {
    const response = await axios.get(`${API_URL}/user/rooms`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  createFile: async (roomId, fileName, language = 'javascript') => {
    const response = await axios.post(`${API_URL}/${roomId}/files`, {
      fileName,
      language
    }, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  deleteFile: async (roomId, fileName) => {
    const response = await axios.delete(`${API_URL}/${roomId}/files/${fileName}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  runCode: async (roomId, code, language) => {
    const response = await axios.post(`${API_URL}/${roomId}/run`, {
      code,
      language
    }, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  saveRoom: async (roomId, files) => {
    const response = await axios.post(`${API_URL}/${roomId}/save`, {
      files
    }, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};

export default roomService;