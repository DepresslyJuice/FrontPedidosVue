import axios from 'axios';

const http = axios.create({
     baseURL: 'https://security-module.onrender.com/api/v1/auth/login',
     withCredentials: true
});

export default http;
