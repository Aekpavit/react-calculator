import React, { useState, useEffect, useCallback } from "react";
import "./Calculator.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackspace, faSync } from "@fortawesome/free-solid-svg-icons";

// --- Helpers ---
const formatNumber = (str) => {
  if (typeof str !== 'string') return ""; // ป้องกัน error ถ้า str ไม่ใช่ string
  return str.replace(/\d+(\.\d+)?/g, (num) => {
    const [intPart, decPart] = num.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
  });
};

const unformatNumber = (str) => {
  if (typeof str !== 'string') return "";
  return str.replace(/,/g, "");
};

// --- Component ---
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
        .replace(/%/g, "/100");
      expression = expression.replace(/\b0+(\d)/g, "$1");

      if (!expression) return 0; // ถ้า expression ว่างเปล่า

      // ถ้าตัวสุดท้ายเป็น operator ให้คำนวณตัวก่อนหน้า
      if (/[+\-*/]$/.test(expression)) {
        return eval(expression.slice(0, -1));
      }

      return eval(expression);
    } catch {
      return null;
    }
  }, []);

  const handleClick = useCallback((value) => {
    if (value === "=") {
      const result = calculate(input);
      if (result !== null) {
        const resultString = result.toString();
        setInput(formatNumber(resultString));
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
      // --- Logic สำหรับการพิมพ์ ---
      setInput((prev) => {
        let cleanPrev = unformatNumber(prev);
        let newVal = cleanPrev;

        // Case 1: เพิ่งกด = ไป
        if (justCalculated) {
          setJustCalculated(false);
          if (/[+\-x÷]/.test(value)) {
            newVal = cleanPrev + value; // เริ่มการคำนวณใหม่จากผลลัพธ์เดิม
          } else if (/[0-9]/.test(value)) {
            newVal = value; // เริ่มต้นใหม่ทั้งหมด
          } else if (value === '.') {
             newVal = "0."; // เริ่มต้นใหม่ด้วย 0.
          } else {
            newVal = cleanPrev; // ป้องกันการกดปุ่มอื่น
          }
        } 
        
        // Case 2: พิมพ์ต่อตามปกติ
        else {
          const replaceableOperators = /[+\-x÷]/;
          const lastChar = cleanPrev.slice(-1);

          // 2.1: ผู้ใช้กดเครื่องหมาย (+, -, x, ÷)
          if (replaceableOperators.test(value)) {
            if (replaceableOperators.test(lastChar)) {
              // ถ้าตัวสุดท้ายเป็นเครื่องหมายอยู่แล้ว -> ให้แทนที่
              newVal = cleanPrev.slice(0, -1) + value;
            } else {
              // ถ้าตัวสุดท้ายไม่ใช่เครื่องหมาย -> ให้เพิ่มเข้าไป
              newVal = cleanPrev + value;
            }
          } 
          
          // 2.2: ผู้ใช้กดจุด (.)
          else if (value === '.') {
            // แบ่ง string ด้วยเครื่องหมาย เพื่อหา "ก้อนตัวเลข" สุดท้าย
            const segments = cleanPrev.split(replaceableOperators);
            const lastSegment = segments.pop() || "";
            
            if (!lastSegment.includes('.')) {
              // ถ้าก้อนตัวเลขสุดท้ายยังไม่มีจุด -> ให้เพิ่มจุด
              newVal = cleanPrev + value;
            }
            // ถ้ามีจุดอยู่แล้ว ก็ไม่ต้องทำอะไร
          }

          // 2.3: ผู้ใช้กดตัวเลข
          else if (/[0-9]/.test(value)) {
            if (cleanPrev === "0") {
              newVal = value; // แทนที่ "0" เริ่มต้น
            } else {
              newVal = cleanPrev + value; // ต่อตัวเลข
            }
          }

          // 2.4: ผู้ใช้กด %
          else if (value === '%') {
            // ป้องกันการใส่ % ต่อจากเครื่องหมาย (เช่น 5+%)
            if (!replaceableOperators.test(lastChar) && cleanPrev !== "0") {
              newVal = cleanPrev + value;
            }
          }
        }
        
        return formatNumber(newVal);
      });
      
      // ถ้าเพิ่งกด = แล้วพิมพ์ตัวเลข/จุด ให้ reset justCalculated
      if (justCalculated && (/[0-9]/.test(value) || value === '.')) {
          setJustCalculated(false);
      }
    }
  }, [calculate, input, justCalculated]);

  // Effect สำหรับอัปเดต Preview
  useEffect(() => {
    if (input && input !== "0") {
      const clean = unformatNumber(input);
      let exprToCalc = clean;

      if (/[+\-x÷%]$/.test(clean)) {
        exprToCalc = clean.slice(0, -1);
      }

      if (exprToCalc === "" || exprToCalc === input) {
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
  }, [input, calculate]);

  // Effect สำหรับ Keyboard Input
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
      } else if (key === "Enter" || key === "=") {
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
  }, [handleClick]); // <-- Dependency ที่ถูกต้อง

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
        <div className="preview" onClick={() => {
          setInput(preview);
          setPreview("");
        }}>
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
              {btn === "dl" ? (
                <FontAwesomeIcon icon={faBackspace} />
              ) : btn === "↻" ? (
                <FontAwesomeIcon icon={faSync} />
              ) : (
                btn
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}