import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.tsx';
import { createDraftStore, getBrowserStorage } from './app/draftStore.ts';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

const store = createDraftStore(getBrowserStorage());

createRoot(rootElement).render(
  <StrictMode>
    <App store={store} />
  </StrictMode>,
);
