# Giorria

**A bilingual (English/Irish) artist hub for neurodivergent creatives in Ireland.**

Giorria (from *an giorria* — Irish for "the hare," a symbol of prosperity and intuition) is a free web application that helps neurodivergent artists manage both the business side of their creative practice and their personal wellbeing in one place.

---

## What It Does

**My Practice**
- Invoice generator with VAT toggle and payment status tracking
- Self-employment hub — plain-language guides on Irish sole trader registration, VAT, self-assessment tax, pricing, and artist rights
- External resources directory — curated links to Irish artist grants and support organisations

**My Wellbeing**
- Mental health check — daily log for mood, anxiety, and energy
- Physical health / chronic flare tracker — daily log for pain, migraine severity, and fatigue
- Journal — free-text, dated, keyword-searchable private notes
- Pattern view — weekly and monthly visualisations of health data alongside business activity

**Accessibility**
- Full English / Irish language toggle — switches at runtime, no page reload
- Designed with neurodivergent users in mind — clean layout, minimal cognitive load

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL (Railway) |
| Data Visualisation | Chart.js |
| Auth | bcrypt + JWT |
| i18n | Custom EN/GA JSON files |
| Hosting | Railway |

---

## Project Structure

```
giorria/
├── server.js
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── invoices.js
│   ├── logs.js
│   └── journal.js
├── public/
│   ├── css/
│   ├── js/
│   └── lang/
└── tests/
```

---

## Getting Started

### Prerequisites
- Node.js
- MySQL database (Railway free tier recommended)

### Installation

```bash
git clone https://github.com/yourusername/giorria.git
cd giorria
npm install
```

Create a `.env` file in the root:

```
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=giorria
JWT_SECRET=your_secret
```

Run the server:

```bash
node server.js
```

---

## Project Management

- **Trello board:** [https://trello.com/b/1iRK5AXY/summer-project-nci-2026]
- **GitHub:** [this repository]

---

## Academic Context

This project was developed as part of the HDip in Science in Computing (Software Development) at National College of Ireland, 2025–2026.

---

## Author

- **Name:** Molly Kane
- **Student ID:** 25132539
- **Module:** Summer Project (Semester 3)
- **Institution:** National College of Ireland
