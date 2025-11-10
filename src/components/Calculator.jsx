import React, { useState, useEffect, useCallback } from "react";
import "./Calculator.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackspace, faSync } from "@fortawesome/free-solid-svg-icons";

// --- Helpers ---
const formatNumber = (str) => {
  if (typeof str !== 'string') return "";
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

      if (!expression) return 0;

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
      setInput((prev) => {
        let cleanPrev = unformatNumber(prev);
        let newVal = cleanPrev;

        if (justCalculated) {
          setJustCalculated(false);
          if (/[+\-x÷]/.test(value)) newVal = cleanPrev + value;
          else if (/[0-9]/.test(value)) newVal = value;
          else if (value === '.') newVal = "0.";
          else newVal = cleanPrev;
        } else {
          const replaceableOperators = /[+\-x÷]/;
          const lastChar = cleanPrev.slice(-1);

          if (replaceableOperators.test(value)) {
            newVal = replaceableOperators.test(lastChar)
              ? cleanPrev.slice(0, -1) + value
              : cleanPrev + value;
          } else if (value === '.') {
            const segments = cleanPrev.split(replaceableOperators);
            const lastSegment = segments.pop() || "";
            if (!lastSegment.includes('.')) newVal = cleanPrev + value;
          } else if (/[0-9]/.test(value)) {
            newVal = cleanPrev === "0" ? value : cleanPrev + value;
          } else if (value === '%') {
            if (!replaceableOperators.test(lastChar) && cleanPrev !== "0") {
              newVal = cleanPrev + value;
            }
          }
        }

        return formatNumber(newVal);
      });

      if (justCalculated && (/[0-9]/.test(value) || value === '.')) {
        setJustCalculated(false);
      }
    }
  }, [calculate, input, justCalculated]);

  // --- Preview แสดงตลอด ---
  useEffect(() => {
    const clean = unformatNumber(input);
    if (!clean || clean === "0") {
      setPreview("");
      return;
    }

    const result = calculate(clean);
    if (result !== null && formatNumber(result.toString()) !== input) {
      setPreview(formatNumber(result.toString()));
    } else {
      setPreview("");
    }
  }, [input, calculate]);

  // --- Keyboard input ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (/[0-9]/.test(key)) { e.preventDefault(); handleClick(key); }
      else if (key === "*") { e.preventDefault(); handleClick("x"); }
      else if (key === "/") { e.preventDefault(); handleClick("÷"); }
      else if (/[\+\-\.%]/.test(key)) { e.preventDefault(); handleClick(key); }
      else if (key === "Enter" || key === "=") { e.preventDefault(); handleClick("="); }
      else if (key === "Backspace") { e.preventDefault(); handleClick("dl"); }
      else if (key.toLowerCase() === "c") { e.preventDefault(); handleClick("C"); }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClick]);

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
