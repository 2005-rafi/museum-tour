import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        color: '#2c1810',
      }}
    >
      <h1 style={{ fontSize: '6rem', fontFamily: "'Playfair Display', serif", margin: 0, lineHeight: 1, color: '#69341f' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
        Page Not Found
      </h2>
      <p style={{ color: '#6b5b52', maxWidth: '400px', marginTop: '0.75rem' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '0.6rem 1.4rem',
            border: '2px solid #69341f',
            borderRadius: '6px',
            background: 'transparent',
            color: '#69341f',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
          }}
        >
          Go back
        </button>
        <Link
          to="/"
          style={{
            padding: '0.6rem 1.4rem',
            borderRadius: '6px',
            background: '#69341f',
            color: '#fff',
            textDecoration: 'none',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
          }}
        >
          Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
