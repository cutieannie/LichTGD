
import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';

const HomePage: React.FC = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(e => {
      console.error(e);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center h-full mt-16">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-lg">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome to the M365 Group Calendar Manager
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please log in with your Microsoft 365 account to view and manage the group calendar.
        </p>
        <button
          onClick={handleLogin}
          className="w-full px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Login with Microsoft
        </button>
      </div>
    </div>
  );
};

export default HomePage;
