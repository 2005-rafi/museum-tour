import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './app/router';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;