const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com' 
  : 'http://localhost:5000';

export default API_BASE_URL;