import axios from 'axios';

/**
 * Proxy requests to microservices
 */
export const proxyRequest = async (serviceUrl, path, method, data, headers) => {
  try {
    const config = {
      method: method,
      url: `${serviceUrl}${path}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    // Forward the error from microservice
    if (error.response) {
      throw {
        status: error.response.status,
        message: error.response.data.message || 'Service error',
        data: error.response.data
      };
    }
    // Service unavailable
    throw {
      status: 503,
      message: `Service temporarily unavailable: ${error.message}`
    };
  }
};

/**
 * Verify token with auth service
 */
export const verifyToken = async (token) => {
  try {
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/api/auth/verify`,
      {},
      {
        headers: {
          'Authorization': token
        }
      }
    );
    return response.data;
  } catch (error) {
    return null;
  }
};
