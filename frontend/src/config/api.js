const API_BASE_URL = 'http://localhost:3000';

export { API_BASE_URL };

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    PROTECTED: `${API_BASE_URL}/protected`,
  },
  USERS: `${API_BASE_URL}/users`,
  INGREDIENTS: `${API_BASE_URL}/api/v1/ingredients`,
  PORTIONS: `${API_BASE_URL}/api/v1/portions`,
  SNACKS: `${API_BASE_URL}/api/v1/snacks`,
};

export const getSnackPortionUrl = (snackId, portionId) =>
  `${API_BASE_URL}/api/v1/snacks/${snackId}/portions/${portionId}`;
