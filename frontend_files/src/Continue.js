import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Continue = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to the home page when this component is loaded
    navigate("/home");
  }, [navigate]);

  return (
    <div>
      {/* Optionally, you can show a loading message */}
      <h2>Redirecting to Home...</h2>
    </div>
  );
};

export default Continue;
