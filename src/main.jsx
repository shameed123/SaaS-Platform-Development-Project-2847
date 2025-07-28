import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Log mock user credentials for easy testing
console.log('%c SaaS Platform Test Credentials:', 'background: #333; color: #fff; padding: 5px; border-radius: 5px;');
console.log('%c Super Admin:', 'font-weight: bold;', 'email: super@example.com, password: password123');
console.log('%c Admin:', 'font-weight: bold;', 'email: admin@example.com, password: password123');
console.log('%c User:', 'font-weight: bold;', 'email: user@example.com, password: password123');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);