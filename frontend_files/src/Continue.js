import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { setCurrentUser, getCurrentUser } from "./global";

const Continue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createGuestUser = async () => {
      try {
        // First check if user is already logged in
        const existingUser = getCurrentUser();
        if (existingUser) {
          console.log("User already exists, navigating to home:", existingUser);
          navigate("/home");
          return;
        }
        
        // Generate a unique guest ID
        const guestId = uuidv4();
        const uniqueEmail = `guest_${guestId}@guest.mail`;
        
        try {
          // Try to register guest user with backend
          const registerResponse = await fetch("http://localhost:8080/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              userType: "guest",
              name: "Guest",
              surname: "User",
              email: uniqueEmail,
              password: "guest123",
              additionalParams: {}
            })
          });
          
          if (registerResponse.ok) {
            const guestData = await registerResponse.json();
            console.log("Guest registered with backend:", guestData);
            
            // Create guest user object with backend data
            const guestUser = {
              userId: guestData.account_id,
              username: "Guest",
              email: uniqueEmail,
              wishlist: [],
              wishlistNeedsUpdate: false,
              userType: "guest",
              shopping_cart: {}
            };
            
            // Save guest user to local storage
            setCurrentUser(guestUser);
            console.log("Guest user created with backend:", guestUser);
            
            // Navigate to home page
            navigate("/home");
            return;
          } else {
            // Get the error message from the response
            const errorText = await registerResponse.text();
            console.warn("Backend registration failed:", errorText);
            // Continue with local-only guest user
          }
        } catch (backendError) {
          console.warn("Backend error:", backendError);
          // Continue with local-only guest user
        }
        
        // Fallback: Create a local-only guest user
        console.log("Creating local-only guest user");
        const localGuestUser = {
          userId: guestId,
          username: "Guest",
          email: uniqueEmail,
          wishlist: [],
          wishlistNeedsUpdate: false,
          userType: "guest",
          shopping_cart: {}
        };
        
        setCurrentUser(localGuestUser);
        console.log("Local-only guest user created:", localGuestUser);
        navigate("/home");
        
      } catch (error) {
        console.error("Error creating guest account:", error);
        setError("Failed to continue as guest. Please try again.");
        setLoading(false);
      }
    };

    createGuestUser();
  }, [navigate]);

  if (error) {
    return (
      <div className="container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/login")}>Back to Login</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Creating Guest Account...</h2>
      <p>Please wait while we set up your guest session.</p>
    </div>
  );
};

export default Continue;
