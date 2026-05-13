import React from 'react';

/**
 * Consistent inner-page wrapper with top-padding that accounts for fixed Navbar.
 */
function PageContainer({ children, className = '' }) {
  return (
    <div className={`page-container ${className}`.trim()}>
      {children}
    </div>
  );
}

export default PageContainer;
