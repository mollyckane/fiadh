# Fiadh

**A bilingual (English/Irish) artist hub for neurodivergent creatives in Ireland.**

Fiadh (*fee-ah* – an Irish name coming from the word ‘fia’ which means deer representing the words “wild/free” which reflects the independent spirit of the self-employed artist), is a free, bilingual (English/Irish) web application designed as an all-in-one business toolkit for emerging and early-career freelance artists in Ireland.

---

## What It Does

**My Practice**
- Invoice generator with VAT toggle and payment status tracking
- Contract templates — pre-built Commission, Licensing and Collaboration contracts with fillable fields
- Income & expense tracker with Chart.js visualisations (monthly totals, trends, category breakdown)

**My Resources**
- Self-employment hub — plain-language guides on Irish sole trader registration, VAT, self-assessment tax, pricing and artist rights
- External resources directory — curated links to Irish artist grants and support organisations

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
fiadh/
├── server.js
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── invoices.js
│   ├── contracts.js
│   ├── income.js
│   ├── expenses.js
│   └── articles.js
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
git clone https://github.com/yourusername/fiadh.git
cd fiadh
npm install
```

Create a `.env` file in the root:

```
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=fiadh
JWT_SECRET=your_secret
```

To run the application:
- Cd into the folder containing the project.
- Run the server:

```bash
node server.js
```

---

## Project Management

- **Trello board:** [https://trello.com/b/1iRK5AXY/]
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
