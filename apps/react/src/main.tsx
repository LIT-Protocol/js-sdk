// @ts-nocheck
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { App } from './app/app';
import Test1 from './app/test-1';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/test-1" element={<Test1 />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
