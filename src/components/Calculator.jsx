import React, { useState, useEffect } from "react";
import "./Calculator.css";

export default function Calculator() {
  const [input, setInput] = useState("");

  const handleClick = (value) => {
    if (value === "=") {
      try {
        const expression = input.replace(/x/g, "*").replace(/÷/g, "/");
        setInput(eval(expression).toString());
      } catch {
        alert("Error");
        setInput("");
      }     
    } else if (value === "C") {
      setInput("");
    } else {
      setInput(input + value);
    }
  };

  // เพิ่ม event listener สำหรับ keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      // ถ้าเป็นตัวเลข, +, -, *, /, ., %
      if (/[0-9+\-*/.%]/.test(key)) {
        const value = key === "*" ? "x" : key === "/" ? "÷" : key;
        setInput(prev => prev + value);
      } else if (key === "Enter") {
        handleClick("=");
      } else if (key === "Backspace") {
        setInput(prev => prev.slice(0, -1));
      } else if (key.toLowerCase() === "c") {
        handleClick("C");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input]);

  const buttons = [
    "7", "8", "9", "÷",
    "4", "5", "6", "x",
    "1", "2", "3", "-",
    "0", ".", "=", "+",
    "%", "C"
  ];

  return (
    <div className="calculator">
      <input type="text" value={input} readOnly />
      <div className="buttons">
        {buttons.map((btn) => (
          <button key={btn} onClick={() => handleClick(btn)}>
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
