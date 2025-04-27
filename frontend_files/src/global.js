// global.js

export function setCurrentUser(user) {
  console.log("Saving user to storage:", user);
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function getCurrentUser() {
  const raw = localStorage.getItem('currentUser');
  console.log("Raw user from storage:", raw);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error parsing user from storage", e);
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem('currentUser');
}
