
// The ID of the Microsoft 365 Group whose calendar will be managed.
// Replace with your actual Group ID.
export const GROUP_ID = "0d24b466-987d-4062-b580-7bada290c76c";

// The timezone to be used for all date/time operations with Microsoft Graph.
export const TIMEZONE = "SE Asia Standard Time";

// (Optional) The Object ID of the Entra ID group for secretaries.
// Users in this group will have access to create, edit, and delete events.
// If null, all authenticated users will have these permissions.
// In a real application, this check should be reinforced on a secure backend.
export const ROLE_SECRETARY_GROUP_OBJECT_ID = null; // e.g., "your-secretary-group-object-id"
