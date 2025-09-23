# Consumer Survey App

A full-stack, multi-language survey project built with vanilla JavaScript, HTML, CSS, Node.js, and SQLite. It renders surveys dynamically from JSON, supports conditional logic and validation, and provides a simple dashboard to review responses across countries and devices.

---


## 🚀 Features

- **Dynamic Survey Rendering**: Loads survey structure from JSON and renders all question types (single, multiple, matrix, ranked, text, email, phone, consent) dynamically.
- **Multi-language Support**: Language switcher (English, Spanish, Portuguese) updates the UI and URL (`?lang=xx`).
- **Validation**: Required fields, **regex** for email/phone, visual error feedback.
- **Randomized Questions**: Any section (block) with `"randomizeQuestions": true` in the JSON will display its questions in a random order each time the survey loads.
- **Branching Logic**: Questions can define `branches` in the JSON. If a user selects a specific answer (e.g., "Yes"), a follow-up question will appear immediately below. This enables conditional flows (e.g., "If you answered Yes, show question X; if No, show question Y").
- **Backend API**: Node.js + Express server with SQLite for persistent response storage.
- **Dashboard**: View all survey responses.

---

## 📂 Project Structure

```
survey-app/
├── public/
│   ├── app.js           # Main survey logic (dynamic rendering, validation, submission)
│   ├── style.css        # All UI styles (responsive, language switcher, etc.)
│   ├── index.html       # Main survey page
│   ├── dashboard.html   # Dashboard for viewing responses
│   ├── surveys/
│       └── consumer_survey.json  # Survey definition (questions, logic, etc.)

├── server/
│   ├── index.js         # Express server (API, static files, SQLite integration)
│   ├── db.js            # SQLite helper
│   └── responses.db     # SQLite database file
├── package.json         # Project dependencies and scripts
└── README.md            # This file
```

---

## 🛠️ How It Works


### 1. Survey UI (Frontend)

- Loads survey definition from `/public/surveys/consumer_survey.json`.
- Renders all questions dynamically based on type and language.
- Language switcher at the top updates the `lang` URL param and reloads the survey in the selected language.
- Required fields are marked with an asterisk and block submission if empty.
- Email and phone fields use regex validation (with error messages).
- **Randomized Questions**: If a block in the JSON has `randomizeQuestions: true`, its questions will be shuffled each time the survey loads. This can be enabled for any section.
- **Branching Logic**: Some questions have follow-up logic. For example, if you answer "Yes" to a question, a related follow-up question will appear directly below. This is controlled by the `branches` array in the JSON. Branching works for any answer value and can show different follow-ups for different responses.
- On submit, responses are POSTed to the backend API.
- Success and error dialogs provide user feedback.

### 2. Backend API (Node.js + Express)

- Serves static files from `/public`.
- POST `/api/submit`: Receives and saves survey responses to SQLite.
- GET `/api/responses`: Returns all responses as JSON for the dashboard.
- Ensures the SQLite table exists on startup.
- CORS enabled for local development.

### 3. Dashboard

- `/public/dashboard.html` fetches all responses from the backend.
- Displays responses in a scrollable, responsive table.
- Each response shows ID, timestamp, and answers (pretty-printed key-value list).

---

## 🏁 Getting Started

### Install & Run

1. Clone the repo and `cd` into the project folder.
2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```
3. Start the backend server:
   ```bash
   bun run start
   # or
   npm run start
   ```
4. Open your browser at [http://localhost:3000](http://localhost:3000)

---

## 🌐 Multi-language Support

- Use the language switcher at the top of the survey to toggle between English, Spanish, and Portuguese.
- The selected language is reflected in the URL as `?lang=en`, `?lang=es`, or `?lang=pt`.
- All question labels and options update instantly.

---

## 🎨 Customization

- To change the survey, edit `/public/surveys/consumer_survey.json`.
   - To randomize questions in a section, set `"randomizeQuestions": true` in that block.
   - To add branching (conditional follow-up questions), add a `branches` array to a question. Example:
      ```json
      {
         "id": "q1",
         "type": "single",
         "label": { "en": "Do you shop online?" },
         "options": [ ... ],
         "branches": [
            { "when": { "equals": "yes" }, "goto": "q2" },
            { "when": { "equals": "no" }, "goto": "q3" }
         ]
      }
      ```
- To change styles, edit `/public/style.css`.