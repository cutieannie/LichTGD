
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import CalendarPage from './pages/CalendarPage';
import HomePage from './pages/HomePage';
import Layout from './components/Layout';

interface AppProps {
  pca: PublicClientApplication;
}

const App: React.FC<AppProps> = ({ pca }) => {
  return (
    <MsalProvider instance={pca}>
      <HashRouter>
        <Layout>
          <AuthenticatedTemplate>
            <Routes>
              <Route path="/" element={<CalendarPage />} />
            </Routes>
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <HomePage />
          </UnauthenticatedTemplate>
        </Layout>
      </HashRouter>
    </MsalProvider>
  );
};

export default App;
