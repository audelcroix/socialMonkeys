import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ColorGate = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  const [currentTheme, setCurrentTheme] = useState("spring");

  useEffect(() => {
    if (user && user.theme) {
      setCurrentTheme(user.theme);
    } else {
      setCurrentTheme("spring");
    }
  }, [user]);

  return (
    <div className={`page-container color-gate-${currentTheme}`}>
      {children}
    </div>
  );
};

export default ColorGate;
