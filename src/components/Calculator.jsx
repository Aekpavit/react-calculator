import React, { useState, useEffect } from "react";
import "./Calculator.css";

export default function Calculator() {
  const [input, setInput] = useState("0"); // เปลี่ยนจาก "" เป็น "0"

  const handleClick = (value) => {
    if (value === "=") {
      try {
        let expression = input.replace(/x/g, "*").replace(/÷/g, "/");
        expression = expression.replace(/\b0+(\d)/g, "$1");
        const result = eval(expression);
        setInput(result.toString());
      } catch {
        alert("Error");
        setInput("0");
      }
    } else if (value === "C") {
      setInput("0");
    } else if (value === "dl") {
      setInput(prev => {
        const newVal = prev.slice(0, -1);
        return newVal === "" ? "0" : newVal;
      });
    } else if (value === "↻") {
      setInput("0");
    } else {
      if (input === "0" && /[0-9]/.test(value)) {
        setInput(value); // แทนที่ 0
      } else {
        setInput(input + value);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (/[0-9+\-*/.%]/.test(key)) {
        const value = key === "*" ? "x" : key === "/" ? "÷" : key;
        setInput(prev => (prev === "0" && /[0-9]/.test(value) ? value : prev + value));
      } else if (key === "Enter") handleClick("=");
      else if (key === "Backspace") setInput(prev => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
      else if (key.toLowerCase() === "c") handleClick("AC");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const buttons = [
    "C", "dl", "%", "÷",
    "7", "8", "9", "x",
    "4", "5", "6", "-",
    "1", "2", "3", "+",
    "↻", "0", ".", "="
  ];

  return (
    <div className="calculator">
      <input type="text" value={input} readOnly />
      <div className="line"></div>
      <div className="buttons">
        {buttons.map((btn) => {
          let btnClass = "";
          if (btn === "=") btnClass = "equals";
          else if (["C", "dl", "↻", "%"].includes(btn)) btnClass = "function";
          else if (["+", "-", "x", "÷"].includes(btn)) btnClass = "operator";
          else btnClass = "number";

          return (
            <button
              key={btn}
              className={btnClass}
              onClick={() => handleClick(btn)}
            >
              {btn}
            </button>
          );
        })}
      </div>
    </div>
  );
}
