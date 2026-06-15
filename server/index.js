const express = require("express");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ── Claude API proxy ────────────────────────────────────
app.post("/api/summarize", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "No text provided." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfiguration: API key not set." });
  }

  const prompt = `You are an expert meeting assistant. Given the following meeting notes or transcript, produce a structured summary.

Format your response in clean HTML using only <h3>, <ul>, <li>, <p>, and <strong> tags. Structure it as:
<h3>Overview</h3>
<p>1–2 sentence meeting summary</p>
<h3>Key discussion points</h3>
<ul>...</ul>
<h3>Decisions made</h3>
<ul>...</ul>
<h3>Action items</h3>
<ul>List each with owner if mentioned, e.g. <li><strong>Alice</strong> — Send proposal by Friday</li></ul>
<h3>Next steps</h3>
<ul>...</ul>

If a section has nothing to report, omit it. Be concise. Do not add any text outside the HTML tags.

Meeting transcript:
${text}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 1000,
        messages:   [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err?.error?.message || "Anthropic API error." });
    }

    const data    = await response.json();
    const summary = (data.content || []).map(c => c.text || "").join("").trim();
    return res.json({ summary });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ── Fallback: serve index.html for any unknown route ───
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
