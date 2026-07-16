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
| Database | MySQL |
| Data Visualisation | Chart.js |
| Auth | bcrypt + JWT |
| i18n | Custom EN/GA JSON files |
| Hosting | Railway |

---

## Project Structure

```
fiadh/
├── server.js
├── database/
│   └── schema.sql
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── invoices.js
│   ├── income.js
│   ├── expenses.js
│   └── contracts.js
├── public/
│   ├── css/
│   ├── js/
│   ├── lang/
│   ├── index.html
│   ├── contracts.html
│   ├── income-expenses.html
│   ├── dashboard.html
│   ├── resources.html
│   ├── settings.html
│   └── invoices.html
└── tests/
```

---
## Live deployment on Render

A deployed version of the project is available at: 

[https://fiadh.onrender.com](https://fiadh.onrender.com)

### Important note about Render availability

This deployment may be unavailable, slow to wake, or temporarily down at times. The hosted version is kept mainly for demonstration purposes but the most reliable way to review the project is to run it locally.

During the examination period, the intention is to have the Render deployment available where possible. If the link does not load immediately, please alow time for Render to wake the service, or use local setup instructions below.

## Accessing Fiadh on Render

1. Open [https://fiadh.onrender.com](https://fiadh.onrender.com)
2. Wait for the app to load fully, as the service may need time to wake
3. Register a new account through the sign-up form, or log in with an existing account if one has already been created
4. After logging in, use the dashboard and navigation to access invoices, income and expenses

## Run Fiadh locally

Before running Fiadh locally, make sure you have:

- Node.js
- npm
- MySQL Server installed and running locally

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
DB_PORT=3000
DB_USER=root
DB_PASSWORD=your-local-mysql-password
DB_NAME=fiadh
DB_SSL=false
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

You can then: 
- register a new user account
- log in securely
- create and manage invoices
- log income entries
- log expense entries

### Running tests

Thi project uses Jest and Supertest for route tesing.

To run full tset suite:

```bash
npm test
```
---

## Development Note

 **Local MySQL database** is more reliable for development, testing and demonstration across different machines.

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
