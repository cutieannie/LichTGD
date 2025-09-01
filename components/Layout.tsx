
import React, { ReactNode } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(e => {
      console.error(e);
    });
  };

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: '/',
      mainWindowRedirectUri: '/',
    });
  };

  const userName = accounts[0]?.name;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-700 dark:text-white">
              <span className="text-blue-600 dark:text-blue-400">M365</span> Calendar
            </div>
            <div className="flex items-center">
              {isAuthenticated && userName && (
                 <span className="text-gray-700 dark:text-gray-200 mr-4">Welcome, {userName}</span>
              )}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Login with Microsoft
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
