import { auth } from "./firebase";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut
} from "firebase/auth";

// Sign Up Function
export const signUp = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();  // 🔥 Get JWT Token
    localStorage.setItem("token", token);  // 🔥 Store JWT Token
    return token;
};

// Login Function
export const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();  // 🔥 Get JWT Token
    localStorage.setItem("token", token);  // 🔥 Store JWT Token
    return token;
};

// Logout Function
export const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");  // Remove JWT Token
};
