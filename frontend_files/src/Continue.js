import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentUser } from "./global";

const Continue = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const createGuestUser = async () => {
      try {
        const response = await fetch("http://localhost:8080/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userType: "guest",
            name: null,
            surname: null,
            email: null,
            password: null,
            additionalParams: {},
          }),
        });

        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data));
        setCurrentUser(data);
        navigate("/home");
      } catch (error) {
        console.error("Guest registration failed:", error);
        navigate("/");
      }
    };

    createGuestUser();
  }, [navigate]);

  return (
    <div>
      <h2>Continuing as Guest...</h2>
    </div>
  );
};

export default Continue;
