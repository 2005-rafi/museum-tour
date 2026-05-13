export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  HOME: '/',
  MUSEUMS: '/museums',
  MUSEUM_DETAIL: '/museums/:id',
  ARTIFACTS: '/artifacts',
  ARTIFACT_DETAIL: '/artifacts/:id',
  SEARCH: '/search',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  PROFILE: '/profile',
  ABOUT: '/about',
  CONTACT: '/contact',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_REGISTER: '/admin/register',
  NOT_FOUND: '*',
};

export const QUERY_KEYS = {
  MUSEUMS: 'museums',
  MUSEUM_DETAIL: 'museum',
  MUSEUM_ARTIFACTS: 'museumArtifacts',
  ARTIFACTS: 'artifacts',
  ARTIFACT_DETAIL: 'artifact',
  ARTIFACT_COMMENTS: 'artifactComments',
  SEARCH: 'search',
  PROFILE: 'profile',
  LIKED_ARTIFACTS: 'likedArtifacts',
  USER_COMMENTS: 'userComments',
  USERS: 'users',
};

export const TOKEN_KEYS = {
  ACCESS: 'museum_access_token',
  REFRESH: 'museum_refresh_token',
  USER: 'museum_user',
};

export const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin',
};

export const DEFAULT_PAGE_SIZE = 12;
export const SEARCH_DEBOUNCE_MS = 400;
export const TOKEN_REFRESH_THRESHOLD_MS = 2 * 60 * 1000; // 2 min before expiry
