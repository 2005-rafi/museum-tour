/**
 * Central service registry.
 *
 * Import services from here rather than directly from individual files.
 * Centralised re-exports mean backend URL changes are isolated to the
 * individual service file, not scattered across the codebase.
 *
 * Usage:
 *   import { artifactService, museumService } from '../services';
 */

export { default as apiClient }       from './apiClient';
export { default as authService }     from './authService';
export { default as museumService }   from './museumService';
export { default as artifactService } from './artifactService';
export { default as searchService }   from './searchService';
export { default as userService }     from './userService';
export { default as adminService }    from './adminService';
