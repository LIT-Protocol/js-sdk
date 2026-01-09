import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { Buffer } from 'buffer';
import { router } from './router';

const globalWithBuffer = globalThis as typeof globalThis & {
  Buffer?: typeof Buffer;
};

if (!globalWithBuffer.Buffer) {
  globalWithBuffer.Buffer = Buffer;
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
