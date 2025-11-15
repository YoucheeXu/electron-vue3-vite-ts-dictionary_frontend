// service unfity interface

import CNetRequest from "./request";

const netRequest = new CNetRequest({
  // baseURL: import.meta.env.VITE_BASE_URL,
  baseURL: "http://127.0.0.1:5000",
  // timeout: import.meta.env.VITE_NET_TIMEOUT,
  timeout: 1000,
  interceptors: {
    requestInterceptor: (config) => {
      const token = "";
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    requestInterceptorCatch: (err) => {
      console.log("requset fail intercetpor");
      return err;
    },
    responseInterceptor: (config) => {
      return config;
    },
    responseInterceptorCatch: (err) => {
      console.log("response fail intercetpor: " + err.code);
      return err;
    },
  },
});

export default netRequest;
