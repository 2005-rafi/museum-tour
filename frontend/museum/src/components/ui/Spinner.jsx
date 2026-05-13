import React from 'react';

function Spinner({ fullPage = false, size = 40 }) {
  if (fullPage) {
    return (
      <div className="spinner-fullpage">
        <div className="spinner" style={{ width: size, height: size }} />
      </div>
    );
  }
  return (
    <div className="spinner-wrap">
      <div className="spinner" style={{ width: size, height: size }} />
    </div>
  );
}

export default Spinner;
