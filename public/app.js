// ============================
//  AI Meeting Notes Summarizer
//  public/app.js
//
//  No API key here — all Claude calls are proxied
//  through the Express backend at /api/summarize
// ============================

let mediaRecorder = null;
let audioChunks   = [];
let timerInterval = null;
let seconds       = 0;
let isRecording   = false;
let waveInterval  = null;
let recognition   = null;
let transcript    = "";

const DEFAULT_HEIGHTS = [8,14,20,12,28,10,24,18,32,16,22,9,15,26,10,19,30,13,21,8];

// ── Tab switching ───────────────────────────────────────
function switchTab(tab) {
  document.getElementById("panel-record").style.display = tab === "record" ? "" : "none";
  document.getElementById("panel-paste").style.display  = tab === "paste"  ? "" : "none";
  document.getElementById("tab-record").classList.toggle("active", tab === "record");
  document.getElementById("tab-paste").classList.toggle("active",  tab === "paste");
}

// ── Status pill ─────────────────────────────────────────
function setStatus(label, live) {
  document.getElementById("status-text").textContent = label;
  document.getElementById("status-dot").className = "dot" + (live ? " live" : "");
}

// ── Timer ───────────────────────────────────────────────
function updateTimer() {
  seconds++;
  const m = Math.floor(seconds / 60), s = seconds % 60;
  document.getElementById("timer").textContent = m + ":" + String(s).padStart(2, "0");
}

// ── Waveform animation ──────────────────────────────────
function animateWaveform(active) {
  const bars = document.querySelectorAll("#waveform .bar");
  clearInterval(waveInterval);
  if (active) {
    waveInterval = setInterval(() => {
      bars.forEach(b => { b.style.height = (Math.random() * 36 + 6) + "px"; });
    }, 120);
  } else {
    bars.forEach((b, i) => { b.style.height = DEFAULT_HEIGHTS[i] + "px"; });
  }
}

// ── Speech recognition ──────────────────────────────────
function startSpeechRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return;

  recognition = new SpeechRec();
  recognition.continuous     = true;
  recognition.interimResults = true;
  recognition.lang           = "en-US";

  let finalText = "";

  recognition.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
      else interim += e.results[i][0].transcript;
    }
    transcript = finalText + interim;
    const box = document.getElementById("transcript-box");
    box.textContent = transcript || "Listening…";
    box.className   = "transcript-area" + (transcript ? " has-text" : "");
  };

  recognition.onerror = () => {};
  recognition.start();
}

// ── Record toggle ───────────────────────────────────────
async function toggleRecord() {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      isRecording = true; transcript = "";

      document.getElementById("transcript-box").textContent = "Listening…";
      document.getElementById("transcript-box").className   = "transcript-area";
      document.getElementById("rec-error").textContent      = "";
      document.getElementById("btn-record").classList.remove("stopped");
      document.getElementById("rec-icon").className         = "ti ti-player-stop";
      document.getElementById("recorder-card").classList.add("recording");
      document.getElementById("btn-reset").disabled         = true;
      document.getElementById("btn-summarize-rec").disabled = true;

      setStatus("Recording", true);
      seconds = 0;
      document.getElementById("timer").textContent = "0:00";
      timerInterval = setInterval(updateTimer, 1000);
      animateWaveform(true);
      startSpeechRecognition();

      audioChunks   = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
      mediaRecorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); };
      mediaRecorder.start();
    } catch (_) {
      document.getElementById("rec-error").textContent =
        "Microphone access denied. Please allow microphone permission.";
    }
  } else {
    isRecording = false;
    if (recognition) { try { recognition.stop(); } catch (_) {} }
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
    clearInterval(timerInterval);
    clearInterval(waveInterval);
    animateWaveform(false);

    document.getElementById("btn-record").classList.add("stopped");
    document.getElementById("rec-icon").className = "ti ti-microphone";
    document.getElementById("recorder-card").classList.remove("recording");
    setStatus("Stopped", false);
    document.getElementById("btn-reset").disabled         = false;
    document.getElementById("btn-summarize-rec").disabled = seconds < 2;

    if (!transcript) {
      document.getElementById("transcript-box").textContent =
        "No speech detected. Try the Paste notes tab instead.";
    }
  }
}

// ── Reset ───────────────────────────────────────────────
function resetRecording() {
  if (isRecording) return;
  transcript = ""; seconds = 0;
  document.getElementById("timer").textContent             = "0:00";
  document.getElementById("transcript-box").textContent    = "Transcript will appear here as you speak…";
  document.getElementById("transcript-box").className      = "transcript-area";
  document.getElementById("btn-reset").disabled            = true;
  document.getElementById("btn-summarize-rec").disabled    = true;
  document.getElementById("rec-error").textContent         = "";
  document.getElementById("summary-section").style.display = "none";
  setStatus("Ready", false);
  document.getElementById("btn-record").classList.remove("stopped");
}

// ── Backend API call (key stays on server) ──────────────
async function callSummarizeAPI(text) {
  const response = await fetch("/api/summarize", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ text })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Server error");
  return data.summary;
}

// ── Loading / summary display ───────────────────────────
function showLoading() {
  const sec = document.getElementById("summary-section");
  sec.style.display = "";
  document.getElementById("summary-content").innerHTML =
    '<div class="loading-row"><div class="spinner"></div> Generating summary…</div>';
  sec.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showSummary(html) {
  document.getElementById("summary-content").innerHTML = html;
}

// ── Summarize from recording ────────────────────────────
async function summarizeFromRecording() {
  const text = transcript.trim();
  if (!text) {
    document.getElementById("rec-error").textContent =
      "No transcript captured. Try the Paste notes tab.";
    return;
  }
  document.getElementById("rec-error").textContent = "";
  showLoading();
  try {
    const html = await callSummarizeAPI(text);
    showSummary(html);
  } catch (e) {
    showSummary(`<p class="error-msg">Error: ${e.message}</p>`);
  }
}

// ── Summarize from pasted text ──────────────────────────
async function summarizeManual() {
  const text = document.getElementById("manual-input").value.trim();
  if (!text) return;
  showLoading();
  try {
    const html = await callSummarizeAPI(text);
    showSummary(html);
  } catch (e) {
    showSummary(`<p class="error-msg">Error: ${e.message}</p>`);
  }
}
