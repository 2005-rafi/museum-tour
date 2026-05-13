/**
 * Format a museum/artifact location object into a readable string
 */
export const formatLocation = (location) => {
  if (!location) return 'Location not available';
  if (typeof location === 'string') return location;
  const parts = [location.city, location.state, location.country].filter(Boolean);
  return parts.join(', ') || 'Location not available';
};

/**
 * Format a date string to a human-readable format
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

/**
 * Format a date to a compact relative time like "3 days ago"
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString, { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Get first image URL from an images array, or a fallback
 */
export const getImageUrl = (images, fallback = '/placeholder-museum.jpg') => {
  if (Array.isArray(images) && images.length > 0) {
    return images[0]?.url || images[0] || fallback;
  }
  if (typeof images === 'string') return images;
  return fallback;
};

/**
 * Truncate a string to a max length with ellipsis
 */
export const truncate = (str, maxLength = 120) => {
  if (!str || str.length <= maxLength) return str || '';
  return `${str.slice(0, maxLength).trimEnd()}…`;
};

/**
 * Build a query string from an object, skipping empty values
 */
export const buildQueryString = (params = {}) => {
  const clean = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return clean.length ? `?${clean.join('&')}` : '';
};

/**
 * Capitalise the first letter of a string
 */
export const capitalise = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Extract error message from an axios error or plain Error
 */
export const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
};
