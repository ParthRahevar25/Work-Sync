import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  // 🔒 CRITICAL: This allows the browser to send the cookie 
  // and the backend to set the cookie.
  withCredentials: true, 
});

// We no longer need the request interceptor for the token!
// The browser automatically attaches the cookie to every request.

export default api;