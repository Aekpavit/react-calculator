import React, { useState, useEffect } from "react";
import "./Calculator.css";

export default function Calculator() {
  const [input, setInput] = useState("");

  const handleClick = (value) => {
    if (value === "=") {
      try {
        // แทนที่ x และ ÷
        let expression = input.replace(/x/g, "*").replace(/÷/g, "/");

        // ตัดเลขนำศูนย์ เช่น 010 -> 10
        expression = expression.replace(/\b0+(\d)/g, "$1");

        const result = eval(expression);
        setInput(result.toString());
      } catch {
        alert("Error");
        setInput("");
      }
    } else if (value === "C") {
      setInput("");
    } else {
      // ป้องกันเลขนำศูนย์ตอนกด
      if (/^[0]$/.test(input) && /[0-9]/.test(value)) {
        setInput(value);
        return;
      }
      setInput(input + value);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (/[0-9+\-*/.%]/.test(key)) {
        const value = key === "*" ? "x" : key === "/" ? "÷" : key;
        setInput(prev => {
          if (/^[0]$/.test(prev) && /[0-9]/.test(value)) return value;
          return prev + value;
        });
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
  }, []);

  const buttons = [
    "7", "8", "9", "÷",
    "4", "5", "6", "x",
    "1", "2", "3", "-",
    "0", ".", "C", "+",
    "%", "="
  ];

  return (
    <div className="calculator">
      <input type="text" value={input} readOnly />
      <div className="buttons">
        {buttons.map((btn) => (
          <button
            key={btn}
            className={btn === "=" ? "equals" : ""}
            onClick={() => handleClick(btn)}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
