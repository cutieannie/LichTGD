import { Configuration, LogLevel } from '@azure/msal-browser';

// -----------------------------------------------------------------------------
// TODO: IMPORTANT CONFIGURATION REQUIRED
// -----------------------------------------------------------------------------
// You MUST replace the placeholder values below with your actual Azure App
// Registration details for the application to work correctly. The current
// values are placeholders to allow the app to load without crashing.
//
// 1. AZURE_AD_CLIENT_ID: Find this in your Azure AD App Registration under
//    "Overview" > "Application (client) ID".
// 2. AZURE_AD_TENANT_ID: This is the "Directory (tenant) ID" from the same
//    "Overview" page.
// -----------------------------------------------------------------------------
const AZURE_AD_CLIENT_ID = "04c18527-f705-4f52-857e-c2a7fe59d4d9";
const AZURE_AD_TENANT_ID = "f49f790c-d831-46a2-898d-27902a8b490f";

export const msalConfig: Configuration = {
  auth: {
    clientId: AZURE_AD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use sessionStorage for better security than localStorage
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

// Scopes required for the application to access Microsoft Graph APIs.
export const loginRequest = {
  scopes: ["openid", "profile", "email", "offline_access", "Calendars.ReadWrite", "Mail.Send"],
};