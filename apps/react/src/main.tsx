// @ts-nocheck
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { App } from './app/app';
import LitNodeClientPage from './app/lit-node-client-page';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/lit-node-client-page" element={<LitNodeClientPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
