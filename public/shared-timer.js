(function (root) {
  const TIMER_DOCUMENT = "timer";

  function clampInteger(value, min, max) {
    return Math.min(max, Math.max(min, Math.floor(Number(value) || 0)));
  }

  function remainingTimerSeconds(state, now = Date.now()) {
    if (!state) return 0;
    if (state.status === "running") {
      return Math.max(0, Math.ceil((Number(state.endsAtMs) - now) / 1000));
    }
    return Math.max(0, clampInteger(state.remainingSeconds, 0, 359999));
  }

  function formatTimerSeconds(totalSeconds) {
    const total = clampInteger(totalSeconds, 0, 359999);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return hours
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function ensureTimerStyles() {
    if (document.getElementById("shared-countdown-styles")) return;
    const style = document.createElement("style");
    style.id = "shared-countdown-styles";
    style.textContent = `
      .shared-countdown{position:fixed;z-index:1280;top:8px;left:252px;min-width:156px;box-sizing:border-box;color:#fff4d6;background:linear-gradient(180deg,rgba(58,35,20,.97),rgba(20,12,8,.96));border:2px ridge #d4af37;border-radius:8px 8px 14px 14px;box-shadow:inset 0 0 12px rgba(244,215,109,.15),0 4px 14px rgba(0,0,0,.65);font-family:'MedievalSharp',Georgia,serif;text-align:center;}
      .shared-countdown::before,.shared-countdown::after{content:'◆';position:absolute;top:50%;color:#d4af37;font:13px Georgia,serif;text-shadow:0 1px 2px #000;transform:translateY(-50%);}
      .shared-countdown.is-dm{width:190px;}
      .shared-countdown::before{left:-9px}.shared-countdown::after{right:-9px}
      .shared-countdown-display{display:flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:4px 13px;box-sizing:border-box;}
      .shared-countdown-hourglass{width:34px;height:42px;overflow:visible;filter:drop-shadow(0 1px 2px #000);}
      .shared-countdown-frame{fill:#b88732;stroke:#f4d76d;stroke-width:1.2}.shared-countdown-glass{fill:rgba(213,237,238,.16);stroke:#d7c899;stroke-width:1}.shared-countdown-sand{fill:#f4d76d}.shared-countdown-flow{fill:#f4d76d;opacity:0;}
      .shared-countdown.is-running .shared-countdown-flow{opacity:1;animation:hourglass-flow .8s linear infinite}.shared-countdown.is-running .shared-countdown-hourglass{animation:hourglass-tick 1s steps(2,end) infinite;}
      .shared-countdown.is-expired{border-color:#b73b2d;box-shadow:inset 0 0 13px rgba(183,59,45,.3),0 0 14px rgba(183,59,45,.65)}
      .shared-countdown-time{min-width:86px;color:#f4d76d;font-size:1.72rem;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:.04em;text-shadow:0 2px 2px #000;}
      .shared-countdown-status{display:block;margin-top:3px;color:#d8c7ac;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;}
      .shared-countdown-menu{position:relative;border-top:1px solid rgba(212,175,55,.38);}
      .shared-countdown-menu>summary{padding:5px 10px;color:#f4d76d;font-size:.72rem;letter-spacing:.04em;cursor:pointer;list-style:none;user-select:none;}
      .shared-countdown-menu>summary::-webkit-details-marker{display:none}.shared-countdown-menu>summary::after{content:' ▾';}.shared-countdown-menu[open]>summary::after{content:' ▴';}
      .shared-countdown-controls{position:absolute;top:calc(100% + 6px);left:0;width:190px;padding:9px;box-sizing:border-box;background:linear-gradient(180deg,rgba(58,35,20,.99),rgba(20,12,8,.99));border:2px ridge #d4af37;border-radius:7px 7px 11px 11px;box-shadow:0 7px 18px rgba(0,0,0,.7);}
      .shared-countdown-inputs{display:flex;align-items:end;justify-content:center;gap:5px;}
      .shared-countdown-inputs label{display:grid;gap:2px;color:#d8c7ac;font-size:.65rem;text-transform:uppercase;}
      .shared-countdown-inputs input{width:48px;padding:4px;box-sizing:border-box;color:#fff4d6;background:#160d08;border:1px solid #8a6643;border-radius:4px;font:15px 'MedievalSharp',Georgia,serif;text-align:center;}
      .shared-countdown-buttons{display:flex;justify-content:center;gap:5px;margin-top:6px;}
      .shared-countdown-buttons button{min-width:48px;padding:5px 7px;color:#f4d76d;background:#3d2718;border:1px solid #8a6643;border-radius:4px;font:12px 'MedievalSharp',Georgia,serif;cursor:pointer;}
      .shared-countdown-buttons button:hover{background:#5a3922;border-color:#f4d76d}.shared-countdown-buttons button:disabled{opacity:.45;cursor:default;}
      @keyframes hourglass-flow{0%{transform:translateY(-1px);opacity:.25}50%{opacity:1}100%{transform:translateY(3px);opacity:.3}}
      @keyframes hourglass-tick{50%{transform:rotate(.8deg)}}
      @media(max-width:600px){.shared-countdown{top:6px;min-width:138px}.shared-countdown-display{min-height:46px;padding:3px 9px}.shared-countdown-hourglass{width:29px;height:36px}.shared-countdown-time{min-width:76px;font-size:1.45rem}.shared-countdown-controls{padding:6px}.shared-countdown-buttons button{min-width:42px;padding:4px}}
    `;
    document.head.appendChild(style);
  }

  function hourglassMarkup() {
    return `<svg class="shared-countdown-hourglass" viewBox="0 0 44 54" aria-hidden="true">
      <path class="shared-countdown-frame" d="M6 2h32v5H6zM6 47h32v5H6zM9 7h4c0 10 3 14 9 19-6 5-9 9-9 21H9c0-11 3-17 8-21-5-5-8-10-8-19zm26 0h-4c0 10-3 14-9 19 6 5 9 9 9 21h4c0-11-3-17-8-21 5-5 8-10 8-19z"/>
      <path class="shared-countdown-glass" d="M14 8h16c-.5 8-3 12-8 16-5-4-7.5-8-8-16zm8 20c5 4 7.5 9 8 18H14c.5-9 3-14 8-18z"/>
      <path class="shared-countdown-sand" d="M16 10h12c-1 5-3 8-6 11-3-3-5-6-6-11zm6 23 6 11H16z"/>
      <rect class="shared-countdown-flow" x="21" y="22" width="2" height="12" rx="1"/>
      <circle class="shared-countdown-frame" cx="7" cy="4.5" r="3"/><circle class="shared-countdown-frame" cx="37" cy="4.5" r="3"/><circle class="shared-countdown-frame" cx="7" cy="49.5" r="3"/><circle class="shared-countdown-frame" cx="37" cy="49.5" r="3"/>
    </svg>`;
  }

  function setupSharedCountdownTimer({ db, firebase, isDm = false }) {
    if (!db) throw new Error("setupSharedCountdownTimer requires Firestore.");
    ensureTimerStyles();
    const timerRef = db.collection("shared").doc(TIMER_DOCUMENT);
    const widget = document.createElement("section");
    widget.id = "sharedCountdownTimer";
    widget.className = `shared-countdown${isDm ? " is-dm" : ""}`;
    widget.setAttribute("aria-label", isDm ? "Shared countdown timer controls" : "Shared countdown timer");
    widget.innerHTML = `<div class="shared-countdown-display">${hourglassMarkup()}<div><div class="shared-countdown-time" role="timer">00:00</div><span class="shared-countdown-status">Ready</span></div></div>${isDm ? `
      <details class="shared-countdown-menu"><summary>Set Timer</summary><div class="shared-countdown-controls">
        <div class="shared-countdown-inputs"><label>Minutes<input name="timerMinutes" type="number" min="0" max="999" value="5"></label><span>:</span><label>Seconds<input name="timerSeconds" type="number" min="0" max="59" value="0"></label></div>
        <div class="shared-countdown-buttons"><button type="button" data-timer-action="start">Start</button><button type="button" data-timer-action="pause">Pause</button><button type="button" data-timer-action="reset">Reset</button></div>
      </div></details>` : ""}`;
    document.body.appendChild(widget);

    function positionBesideMapTools() {
      const tools = document.getElementById("tokenSizeControls");
      if (!tools) return;
      const bounds = tools.getBoundingClientRect();
      widget.style.left = `${Math.round(bounds.right + 10)}px`;
      widget.style.top = `${Math.round(bounds.top)}px`;
    }
    positionBesideMapTools();
    root.addEventListener?.("resize", positionBesideMapTools);

    const timeOutput = widget.querySelector(".shared-countdown-time");
    const statusOutput = widget.querySelector(".shared-countdown-status");
    let state = { status: "idle", remainingSeconds: 0, endsAtMs: 0 };
    let lastRenderedSeconds = -1;

    function render() {
      const seconds = remainingTimerSeconds(state);
      if (seconds !== lastRenderedSeconds) {
        timeOutput.textContent = formatTimerSeconds(seconds);
        timeOutput.setAttribute("aria-label", `${seconds} second${seconds === 1 ? "" : "s"} remaining`);
        lastRenderedSeconds = seconds;
      }
      const expired = state.status === "running" && seconds === 0;
      widget.classList.toggle("is-running", state.status === "running" && !expired);
      widget.classList.toggle("is-expired", expired);
      statusOutput.textContent = expired ? "Time's up" : state.status === "running" ? "Running" : state.status === "paused" ? "Paused" : "Ready";
      if (isDm) {
        widget.querySelector('[data-timer-action="pause"]').textContent = state.status === "paused" ? "Resume" : "Pause";
        widget.querySelector('[data-timer-action="pause"]').disabled = state.status === "idle" || expired;
      }
    }

    const publish = fields => timerRef.set({
      ...fields,
      changedAt: firebase?.firestore?.FieldValue?.serverTimestamp?.() || null
    }, { merge: true });

    if (isDm) {
      widget.querySelector('[data-timer-action="start"]').addEventListener("click", () => {
        const minutes = clampInteger(widget.querySelector('[name="timerMinutes"]').value, 0, 999);
        const seconds = clampInteger(widget.querySelector('[name="timerSeconds"]').value, 0, 59);
        const duration = minutes * 60 + seconds;
        publish({ status: duration ? "running" : "idle", durationSeconds: duration, remainingSeconds: duration, endsAtMs: duration ? Date.now() + duration * 1000 : 0 });
      });
      widget.querySelector('[data-timer-action="pause"]').addEventListener("click", () => {
        if (state.status === "paused") {
          const seconds = remainingTimerSeconds(state);
          publish({ status: seconds ? "running" : "idle", remainingSeconds: seconds, endsAtMs: seconds ? Date.now() + seconds * 1000 : 0 });
        } else if (state.status === "running") {
          const seconds = remainingTimerSeconds(state);
          publish({ status: seconds ? "paused" : "idle", remainingSeconds: seconds, endsAtMs: 0 });
        }
      });
      widget.querySelector('[data-timer-action="reset"]').addEventListener("click", () => {
        publish({ status: "idle", durationSeconds: 0, remainingSeconds: 0, endsAtMs: 0 });
      });
    }

    const unsubscribe = timerRef.onSnapshot(snapshot => {
      state = snapshot.exists ? { ...state, ...snapshot.data() } : state;
      lastRenderedSeconds = -1;
      render();
    }, error => console.error("Failed to synchronize countdown timer:", error));
    const interval = root.setInterval(render, 1000);
    render();
    return { element: widget, render, dispose() { root.clearInterval(interval); root.removeEventListener?.("resize", positionBesideMapTools); unsubscribe?.(); widget.remove(); } };
  }

  if (typeof window !== "undefined") window.setupSharedCountdownTimer = setupSharedCountdownTimer;
  if (typeof module !== "undefined") module.exports = { formatTimerSeconds, remainingTimerSeconds };
})(typeof window === "undefined" ? globalThis : window);
