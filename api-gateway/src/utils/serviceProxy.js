import axios from 'axios';

/**
 * Proxy requests to microservices
 */
export const proxyRequest = async (serviceUrl, path, method, data, headers) => {
  try {
    // Filter out headers that shouldn't be forwarded to microservices
    const headersToExclude = ['host', 'connection', 'content-length', 'accept-encoding', 'user-agent'];
    const filteredHeaders = {};
    
    if (headers) {
      Object.keys(headers).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (!headersToExclude.includes(lowerKey)) {
          filteredHeaders[key] = headers[key];
        }
      });
    }

    const config = {
      method: method,
      url: `${serviceUrl}${path}`,
      headers: {
        'Content-Type': 'application/json',
        ...filteredHeaders
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
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error?.message || 
                          'Service error';
      const err = new Error(errorMessage);
      err.status = error.response.status;
      err.data = error.response.data;
      throw err;
    }
    // Service unavailable or network error
    const err = new Error(`Service temporarily unavailable: ${error.message || 'Unknown error'}`);
    err.status = 503;
    throw err;
  }
};

/**
 * Verify token with auth service
 */
export const verifyToken = async (token) => {
  try {
    // Ensure token is in Bearer format for Laravel Sanctum
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/api/auth/verify`,
      {},
      {
        headers: {
          'Authorization': bearerToken,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    return null;
  }
};
