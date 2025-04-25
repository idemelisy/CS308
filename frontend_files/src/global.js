// global.js

export function setCurrentUser(user) {
    localStorage.setItem("CURRENT_USER", user);
  }
  
  export function getCurrentUser() {
    return localStorage.getItem("CURRENT_USER");
  }
  
  export function logoutUser() {
    localStorage.removeItem("CURRENT_USER");
  }
  