import React, { useState, useEffect, useCallback } from "react";
import "./Calculator.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackspace } from "@fortawesome/free-solid-svg-icons";

// ย้าย helpers ออกมานอก component หรือจะ wrap ด้วย useCallback ก็ได้
// วิธีนี้จะทำให้ไม่ต้องสร้างฟังก์ชันเหล่านี้ใหม่ทุกครั้งที่ component re-render
const formatNumber = (str) => {
  return str.replace(/\d+(\.\d+)?/g, (num) => {
    const [intPart, decPart] = num.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
  });
};

const unformatNumber = (str) => str.replace(/,/g, "");

export default function Calculator() {
  const [input, setInput] = useState("0");
  const [history, setHistory] = useState([]);
  const [preview, setPreview] = useState("");
  const [justCalculated, setJustCalculated] = useState(false);

  const calculate = useCallback((expr) => {
    try {
      let expression = unformatNumber(expr)
        .replace(/x/g, "*")
        .replace(/÷/g, "/")
        .replace(/%/g, "/100"); // แก้ % ให้ถูกต้อง
      expression = expression.replace(/\b0+(\d)/g, "$1");
      
      // ป้องกันการ eval expression ที่ว่างเปล่าหรือมีปัญหา
      if (!expression || /[+\-*/]$/.test(expression)) {
         return eval(expression.slice(0, -1));
      }
      
      return eval(expression);
    } catch {
      return null;
    }
  }, []); // calculate ไม่มี dependency ภายใน component

  const handleClick = useCallback((value) => {
    if (value === "=") {
      const result = calculate(input);
      if (result !== null) {
        setInput(formatNumber(result.toString()));
        setHistory((prev) => [input, ...prev].slice(0, 2));
      } else {
        alert("Error");
        setInput("0");
      }
      setPreview("");
      setJustCalculated(true);
    } else if (value === "C" || value === "↻") {
      setInput("0");
      setPreview("");
      setHistory([]);
      setJustCalculated(false);
    } else if (value === "dl") {
      setInput((prev) => {
        const newVal = unformatNumber(prev).slice(0, -1);
        return newVal === "" ? "0" : formatNumber(newVal);
      });
      setJustCalculated(false);
    } else {
      setInput((prev) => {
        let cleanPrev = unformatNumber(prev);
        let newVal = cleanPrev;

        if (justCalculated && /[+\-x÷]/.test(value)) {
          setJustCalculated(false);
          newVal = cleanPrev + value;
        } else if (justCalculated && /[0-9]/.test(value)) {
          setJustCalculated(false);
          newVal = value;
        } else {
          if (cleanPrev === "0" && /[0-9]/.test(value)) newVal = value;
          else newVal = cleanPrev + value;
        }

        return formatNumber(newVal);
      });
      // ไม่ต้อง setJustCalculated(false) ที่นี่ เพราะมันถูกจัดการในเงื่อนไขข้างบนแล้ว
    }
  }, [calculate, input, justCalculated]); // ระบุ dependencies ที่ handleClick ใช้

  useEffect(() => {
    if (input && input !== "0") {
      const clean = unformatNumber(input);
      let exprToCalc = clean;
      
      // ถ้าตัวสุดท้ายเป็น operator ให้คำนวณตัวก่อนหน้า
      if (/[+\-x÷%]$/.test(clean)) {
        exprToCalc = clean.slice(0, -1);
      }

      // ถ้า exprToCalc ว่างเปล่า (เช่น กด "dl" จนหมด) ก็ไม่ต้อง preview
      if(exprToCalc === "") {
        setPreview("");
        return;
      }

      const result = calculate(exprToCalc);
      if (result !== null && formatNumber(result.toString()) !== input) {
         setPreview(formatNumber(result.toString()));
      } else {
         setPreview("");
      }
    } else {
      setPreview("");
    }
  }, [input, calculate]); // เพิ่ม calculate ใน dependency

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      
      if (/[0-9]/.test(key)) {
        e.preventDefault();
        handleClick(key);
      } else if (key === "*") {
        e.preventDefault();
        handleClick("x");
      } else if (key === "/") {
        e.preventDefault();
        handleClick("÷");
      } else if (/[\+\-\.%]/.test(key)) {
        e.preventDefault();
        handleClick(key);
      } else if (key === "Enter" || key === "=") { // รองรับทั้ง Enter และ =
        e.preventDefault(); 
        handleClick("=");
      } else if (key === "Backspace") {
        e.preventDefault();
        handleClick("dl");
      } else if (key.toLowerCase() === "c") {
        e.preventDefault();
        handleClick("C");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClick]); // <--- จุดสำคัญ: เพิ่ม handleClick เข้าไปใน dependency array

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

      {preview && (
        <div className="preview" onClick={() => setInput(preview)}>
          = {preview}
        </div>
      )}

      <div className="line"></div>
      <div className="buttons">
        {buttons.map((btn) => {
          let btnClass = "";
          if (btn === "=") btnClass = "equals";
          else if (["C", "dl", "↻", "%"].includes(btn)) btnClass = "function";
          else if (["+", "-", "x", "÷"].includes(btn)) btnClass = "operator";
          else btnClass = "number";

          return (
            <button key={btn} className={btnClass} onClick={() => handleClick(btn)}>
              {btn === "dl" ? <FontAwesomeIcon icon={faBackspace} /> : btn}
            </button>
          );
        })}
      </div>
    </div>
  );
}