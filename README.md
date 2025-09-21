# 📊 Full Survey Programming Project

**Project Name**: *Global Consumer Survey Simulator*

### 🎯 Goal

Build a **multi-language online survey system** that:

* Collects responses via **web browser** (desktop + mobile).
* Uses **vanilla JavaScript, HTML, CSS** for dynamic survey logic.
* Mimics **survey platforms** (like Verint/Qualtrics) with custom JS conditions.
* Stores/exports data for analysis.
* Demonstrates **project management** and **data accuracy/validation** skills.
* Handles **multi-country deployment** with privacy compliance.

---

## 🛠 Tech Stack & Why

* **HTML + CSS** → Build survey UI, ensure responsive (mobile/tablet).
* **Vanilla JavaScript** → Core logic: branching, validation, randomization, timers.
* **JSON** → Define surveys/questions in a structured format (simulate how Verint stores).
* **Node.js + Express** → (Optional but strong) Backend to serve surveys, collect data, and export to CSV/JSON.
* **SQLite / Flat-file storage** → Simple data persistence (mimics survey data pipeline).
* **i18n (JSON files)** → Multi-country, multi-language survey support.

---

## 🔨 Features to Implement

1. **Survey Loader**

   * Load survey structure from a `survey.json` file.
   * Support multiple languages (`en.json`, `pt.json`, `es.json`).

2. **Question Types**

   * Single choice (radio).
   * Multiple choice (checkboxes).
   * Free text (input/textarea).
   * Matrix/Grid (rows + columns).

3. **Survey Logic**

   * Conditional branching (*if Q1 = “Yes” → show Q2, else skip*).
   * Randomize order of answer options.
   * Hide/show questions dynamically with JS.

4. **Validation**

   * Required fields.
   * Email/phone format check with regex.
   * Min/max characters for text answers.

5. **Data Capture**

   * Store responses in browser first (localStorage).
   * Send data to backend (Node.js API).
   * Export as CSV/JSON for analysis.

6. **Privacy & Security**

   * Do not store personal data unless necessary.
   * Add **consent checkbox** at start (GDPR style).
   * Anonymous submission option.

7. **Analytics Dashboard (Optional, Bonus)**

   * Simple web page with charts (using Chart.js or vanilla canvas).
   * Show total responses, distribution per answer, country comparison.

---

## 📂 Project Structure

```
/survey-app
  /public
    index.html
    style.css
    app.js
    /i18n
      en.json
      pt.json
      es.json
    /surveys
      consumer_survey.json
  /server
    server.js   (Node.js + Express)
    responses.db (SQLite or JSON file)
```

---

## 🚀 Example Workflow

1. User opens survey at `/`.
2. `app.js` loads survey definition (`consumer_survey.json`) + language file.
3. JS dynamically renders questions with HTML.
4. User answers → validation runs.
5. On submit → responses stored locally + POST to `/api/submit`.
6. Backend saves to SQLite.
7. Optional dashboard at `/dashboard` shows response stats.

---

## 🎯 Why This Prepares You

* Shows **JS mastery** in DOM, events, validation, logic.
* Shows **survey-specific knowledge** (branching, randomization, conditional flows).
* Shows **data processing awareness** (export, accuracy, privacy).
* Shows **multi-country/multi-language readiness** (like NIQ’s 15+ countries).
* Shows **project management mindset** (end-to-end delivery, not just coding).

---

👉 This will make you stand out because instead of just practicing coding puzzles, you’ll demonstrate: *“I built a working survey engine similar to what NielsenIQ uses.”*

---

Do you want me to **start coding the base version of this project for you** (HTML+JS dynamic survey with JSON definition), so you can expand it step by step before your interview?
