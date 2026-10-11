import React, { useState, useRef } from 'react';

const stageData = {
  1: {
    name: "STAGE 1/3: Base64 Source Inspection",
    prompt: "STAGE 1/3: Decode the obfuscated string hidden in the terminal background code: 'c3RhZ2UxX2ZsYWdfMjAyNg=='",
    hint: "Use Base64 decoding or inspect standard Javascript btoa/atob utilities.",
    answers: ["stage1_flag_2026"],
    solvedMsg: "[SUCCESS] Stage 1/3 completed! Decoded flag accepted."
  },
  2: {
    name: "STAGE 2/3: XKCD #327 SQL Injection",
    prompt: "STAGE 2/3: Enter the infamous XKCD #327 payload used to drop the Students table.",
    hint: "Sanitize your database inputs! Name: Robert'); ...",
    answers: [
      "robert'); drop table students;--",
      "robert'); drop table students;-- ",
      "robert'); drop table students;-- roberts"
    ],
    solvedMsg: "[SUCCESS] Stage 2/3 completed! SQL Injection sanitized."
  },
  3: {
    name: "STAGE 3/3: Protocol & Port Puzzle",
    prompt: "STAGE 3/3: Combine the official HTTP status code for 'I\\'m a teapot' with the default port number for secure web traffic (HTTPS).",
    hint: "RFC 2324 status code + standard SSL/TLS port (6 digits total).",
    answers: ["418443"],
    solvedMsg: "[SUCCESS] Stage 3/3 completed! Teapot + HTTPS Port verified."
  }
};

export default function CtfTerminal() {
  const [logs, setLogs] = useState([
    { text: "[SYSTEM] 4aru5h.in CTF Challenge Core v2.6.0 Online.", type: "ctf-log-sys" },
    { text: "Type 'help' or tap below to initiate Stage 1/3.", type: "ctf-log-sys" }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [stage, setStage] = useState(1);
  const [stageBadge, setStageBadge] = useState("CTF: STANDBY");
  const [isActivated, setIsActivated] = useState(false);
  const logRef = useRef(null);

  function appendLine(text, typeClass) {
    setLogs(prev => [...prev, { text, type: typeClass || "ctf-log-sys" }]);
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  }

  function activateCtf() {
    if (isActivated) return;
    setIsActivated(true);
    setStageBadge("STAGE 1/3 ACTIVE");
    appendLine("--- CTF MINI TERMINAL INITIALIZED ---", "ctf-log-prompt");
    appendLine(stageData[1].prompt, "ctf-log-prompt");
    appendLine('Type submit("answer") to solve.', "ctf-log-sys");
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputVal.trim();
      setInputVal("");
      if (!val) return;

      appendLine("user@portfolio:~$ " + val, "ctf-log-cmd");
      if (!isActivated) activateCtf();

      const lower = val.toLowerCase();
      if (lower === 'help') {
        appendLine("AVAILABLE COMMANDS:", "ctf-log-prompt");
        appendLine("  submit(\"answer\")  - Submit flag/answer for current stage", "ctf-log-sys");
        appendLine("  status            - Check current stage progress", "ctf-log-sys");
        appendLine("  hint              - Get hint for active stage", "ctf-log-sys");
        appendLine("  clear             - Clear terminal screen", "ctf-log-sys");
        return;
      }
      if (lower === 'clear') {
        setLogs([]);
        return;
      }
      if (lower === 'status') {
        appendLine(`[STATUS] Currently on: ${stageData[stage] ? stageData[stage].name : 'COMPLETED'} (${stageBadge})`, "ctf-log-prompt");
        return;
      }
      if (lower === 'hint') {
        if (stageData[stage]) appendLine("[HINT] " + stageData[stage].hint, "ctf-log-hint");
        return;
      }

      // Check submit("...") syntax or direct answer
      const submitMatch = val.match(/^submit\s*\(\s*["']?([\s\S]*?)["']?\s*\)$/i);
      const answerToTest = submitMatch ? submitMatch[1] : val;

      const currentObj = stageData[stage];
      if (currentObj) {
        const matched = currentObj.answers.some(ans => ans.toLowerCase().trim() === answerToTest.toLowerCase().trim());
        if (matched) {
          appendLine(currentObj.solvedMsg, "ctf-log-success");
          if (stage === 1) {
            setStage(2);
            setStageBadge("STAGE 2/3 ACTIVE");
            setTimeout(() => appendLine("\n" + stageData[2].prompt, "ctf-log-prompt"), 300);
          } else if (stage === 2) {
            setStage(3);
            setStageBadge("STAGE 3/3 ACTIVE");
            setTimeout(() => appendLine("\n" + stageData[3].prompt, "ctf-log-prompt"), 300);
          } else if (stage === 3) {
            setStageBadge("ACCESS GRANTED");
            appendLine("\n[ACCESS GRANTED] CONGRATULATIONS! OVERRIDE PROTOCOL INITIATED.", "ctf-log-success");
          }
        } else {
          appendLine("[INCORRECT] Flag validation failed. Try again or type 'hint'.", "ctf-log-error");
        }
      }
    }
  }

  return (
    <div className="ctf-terminal-box" id="ctf-terminal-box">
      <div className="ctf-terminal-header">
        <div className="ctf-terminal-controls">
          <span className="ctf-ctrl-dot ctrl-red"></span>
          <span className="ctf-ctrl-dot ctrl-yellow"></span>
          <span className="ctf-ctrl-dot ctrl-green"></span>
        </div>
        <span className="ctf-terminal-title">user@portfolio: ~/ctf_challenge</span>
        <span className="ctf-terminal-tag" id="ctf-stage-badge">{stageBadge}</span>
      </div>
      <div className="ctf-terminal-body">
        <div className="ctf-terminal-log" id="ctf-terminal-log" ref={logRef}>
          {logs.map((log, i) => (
            <div key={i} className={`ctf-log-line ${log.type}`}>{log.text}</div>
          ))}
        </div>
        <div className="ctf-input-row">
          <span className="ctf-prompt-symbol">user@portfolio:~$</span>
          <input
            type="text"
            className="ctf-input"
            id="ctf-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onFocus={activateCtf}
            onKeyDown={handleKeyDown}
            placeholder="type 'help' or tap here to play..."
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        <div className="ctf-terminal-footer-hint">
          <span>submit("answer")</span>
          <span>help | hint | status | clear</span>
        </div>
      </div>
    </div>
  );
}
