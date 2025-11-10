import React, { useState, useEffect } from "react";
import "./Calculator.css";

export default function Calculator() {
  const [input, setInput] = useState("0");
  const [history, setHistory] = useState([]); // เก็บประวัติ 3 ครั้ง
  const [preview, setPreview] = useState(""); // แสดงผลลัพธ์ล่วงหน้า

  const calculate = (expr) => {
    try {
      let expression = expr
        .replace(/x/g, "*")
        .replace(/÷/g, "/")
        .replace(/%/g, "/100");
      expression = expression.replace(/\b0+(\d)/g, "$1"); // ลบเลข 0 หน้า
      return eval(expression);
    } catch {
      return null;
    }
  };

  const handleClick = (value) => {
    if (value === "=") {
      const result = calculate(input);
      if (result !== null) {
        setInput(result.toString());
        setHistory((prev) => [input, ...prev].slice(0, 2));
      } else {
        alert("Error");
        setInput("0");
      }
      setPreview("");
    } else if (value === "C" || value === "↻") {
      setInput("0");
      setPreview("");
      setHistory([]);
    } else if (value === "dl") {
      setInput((prev) => {
        const newVal = prev.slice(0, -1);
        return newVal === "" ? "0" : newVal;
      });
    } else {
      setInput((prev) => {
        if (prev === "0" && /[0-9]/.test(value)) return value;
        return prev + value;
      });
    }
  };

  // แสดงผลลัพธ์ล่วงหน้า
  useEffect(() => {
    if (input && input !== "0") {
      // ถ้าลงท้ายด้วย operator ไม่ต้องแสดง preview
      if (/[+\-x÷%]$/.test(input)) {
        
        return;
      }

      const result = calculate(input);
      if (result !== null) setPreview(result.toString());
      else setPreview("");
    } else {
      setPreview("");
    }
  }, [input]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (/[0-9]/.test(key)) handleClick(key);
      else if (key === "*") handleClick("x");
      else if (key === "/") handleClick("÷");
      else if (/[\+\-\.%]/.test(key)) handleClick(key);
      else if (key === "Enter") handleClick("=");
      else if (key === "Backspace") handleClick("dl");
      else if (key.toLowerCase() === "c") handleClick("C");
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
      <div className="history">
        {history.map((h, i) => (
          <div key={i} className="history-item">{h}</div>
        ))}
      </div>
      <input type="text" value={input} readOnly />

      {preview && 
        <div 
          className="preview" 
          onClick={() => setInput(preview)} // กด preview แทน input
        >
          = {preview}
        </div>
      }

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
