import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
console.log(API_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
  // you can add other defaults here if needed
});

export default axiosInstance;
