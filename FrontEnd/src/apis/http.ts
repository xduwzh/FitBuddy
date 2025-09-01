import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: false,
});

export default http;
