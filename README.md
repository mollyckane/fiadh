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
- Node.js (LTS)
- MySQL database (local instance recommended; Railway was used during development but is not required)

### Installation

```bash
git clone https://github.com/YOUR-USERNAME/fiadh.git
cd fiadh
npm install
```

### Environment variables

This project uses a `.env` file for database and JWT configuration.

1. Copy the example file:

```bash
cp .env.example .env
```

2. Edit `.env` and update the values to match your local MySQL setup:

- `DB_HOST` and `DB_PORT`
- `DB_USER` and `DB_PASSWORD`
- `DB_NAME` (for example `fiadh`)
- `JWT_SECRET` (any random string)

### Database setup

1. Create the database and tables using the provided `schema.sql`:

- Open your MySQL client and run:

```sql
SOURCE path/to/schema.sql;
```

2. Optionally, use the Register form in the app to create your first user account.

### Running the project

Make sure your terminal is in the project folder and your MySQL server is running.

Start the server:

```bash
node server.js
```

Then open the app in your browser at:

```text
http://localhost:3000
```

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
