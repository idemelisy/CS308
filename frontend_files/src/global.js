// global.js
const USER_STORAGE_KEY = 'user'; // Define a constant for the key

export function setCurrentUser(user) {
  console.log("Saving user to storage:", user);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export const getCurrentUser = () => {
  try {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    console.log("Raw user from storage:", rawUser);
    
    if (!rawUser) {
      return null;
    }

    const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;
    console.log("Parsed user in getCurrentUser:", user);
    
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export function logoutUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
}
