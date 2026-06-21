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

Before running Fiadh locally, make sure you have:

- Node.js
- npm
- MySQL Server installed and running locally

Fiadh currently uses a **local MySQL database** for development and demonstration.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/YOUR-USERNAME/fiadh.git
cd fiadh
npm install
```

### Environment Variables

Create a `.env` file in the project root and add the following:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-local-mysql-password
DB_NAME=fiadh
JWT_SECRET=your-secret-key
```

These values must match your local MySQL setup.

### Database Setup

Create the local database:

```sql
CREATE DATABASE fiadh;
USE fiadh;
```

Then import the schema file.

Example using MySQL command line:

```bash
mysql -u root -p fiadh < database/schema.sql
```

This will create the required tables for users, invoices, invoice items, contracts, income, expenses and articles.

### Running the Project

Make sure MySQL is running and your terminal is in the project folder.

Start the server:

```bash
node server.js
```

Then open the app in your browser at:

```text
http://localhost:3000
```

You can then register a user account and log in through the application.

---

## Development Note

Fiadh currently uses a **local MySQL database** to make development, testing and demonstration simpler and more reliable across different machines.

A potential future upgrade would be to reconnect the project to a remote MySQL service such as Railway for deployment, once the environment setup and remote connection flow are fully stable.

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
