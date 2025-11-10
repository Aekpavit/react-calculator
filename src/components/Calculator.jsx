import React, { useState, useEffect } from "react";
import "./Calculator.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackspace } from "@fortawesome/free-solid-svg-icons";

export default function Calculator() {
  const [input, setInput] = useState("0");
  const [history, setHistory] = useState([]);
  const [preview, setPreview] = useState("");
  const [justCalculated, setJustCalculated] = useState(false);

  const calculate = (expr) => {
    try {
      let expression = expr
        .replace(/x/g, "*")
        .replace(/÷/g, "/")
        .replace(/%/g, "/100");
      expression = expression.replace(/\b0+(\d)/g, "$1");
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
      setJustCalculated(true);
    } else if (value === "C" || value === "↻") {
      setInput("0");
      setPreview("");
      setHistory([]);
      setJustCalculated(false);
    } else if (value === "dl") {
      setInput((prev) => {
        const newVal = prev.slice(0, -1);
        return newVal === "" ? "0" : newVal;
      });
      setJustCalculated(false);
    } else {
      setInput((prev) => {
        let newVal = prev;

        if (justCalculated && /[+\-x÷]/.test(value)) {
          setJustCalculated(false);
          newVal = prev + value;
        } else if (justCalculated && /[0-9]/.test(value)) {
          setJustCalculated(false);
          newVal = value;
        } else {
          if (prev === "0" && /[0-9]/.test(value)) newVal = value;
          else newVal = prev + value;
        }

        return newVal;
      });
    }
  };

  useEffect(() => {
    if (input && input !== "0") {
      if (/[+\-x÷%]$/.test(input)) {
        const trimmed = input.slice(0, -1);
        const result = calculate(trimmed);
        if (result !== null) setPreview(result.toString());
        else setPreview("");
        return;
      }
      const result = calculate(input);
      if (result !== null) setPreview(result.toString());
      else setPreview("");
    } else {
      setPreview("");
    }
  }, [input]);

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

      {preview && (
        <div
          className="preview"
          onClick={() => setInput(preview)}
        >
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
            <button
              key={btn}
              className={btnClass}
              onClick={() => handleClick(btn)}
            >
              {btn === "dl" ? <FontAwesomeIcon icon={faBackspace} /> : btn}
            </button>
          );
        })}
      </div>
    </div>
  );
}
