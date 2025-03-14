// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNmlcbjaXLwpkVGe3DFQGLNGwYpboO_uA",
  authDomain: "cs-308-ab84a.firebaseapp.com",
  projectId: "cs-308-ab84a",
  storageBucket: "cs-308-ab84a.firebasestorage.app",
  messagingSenderId: "179989955862",
  appId: "1:179989955862:web:ffa7f95af4a4e270857c37",
  measurementId: "G-CXJ7F0S2QB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };