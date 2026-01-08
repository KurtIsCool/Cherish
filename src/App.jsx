import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout'; // Ensure this matches your file location
import { Toaster } from 'sonner';

// Import Pages
import Home from './Pages/Home';
import Calendar from './Pages/Calendar';
import Vault from './Pages/Vault';
import Settings from './Pages/Settings';
import Welcome from './Pages/Welcome';
import UserNotRegisteredError from './components/UserNotRegisteredError'; // Verify path

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/calendar" element={<Layout currentPageName="Calendar"><Calendar /></Layout>} />
          <Route path="/vault" element={<Layout currentPageName="Vault"><Vault /></Layout>} />
          <Route path="/settings" element={<Layout currentPageName="Settings"><Settings /></Layout>} />
          
          {/* Welcome handles its own nav state */}
          <Route path="/welcome" element={<Layout currentPageName="Welcome"><Welcome /></Layout>} />

          <Route path="/error" element={<UserNotRegisteredError />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      {/* Global Toaster for notifications */}
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}