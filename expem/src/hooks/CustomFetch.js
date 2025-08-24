// utils/fetchConfig.js
// utils/fetchConfig.js
const API_BASE_URL = 'http://localhost:8000/api/v1/users';

const customFetch = async (url, options = {}, authToken, handleAuthError) => {
  if (!authToken) {
    throw new Error('No authentication token available');
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const fullUrl = `${API_BASE_URL}${url}`;
  console.log('🌐 Making request to:', fullUrl);

  try {
    const response = await fetch(fullUrl, config);
    
    if (response.status === 401) {
      handleAuthError();
      return;
    }
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('❌ Fetch error:', error);
    throw error;
  }
};

export default customFetch;
