require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoice');
const expenseRoutes = require('./routes/expenses');
const incomeRoutes = require('./routes/income');
const contractRoutes = require('./routes/contracts');
const articleRoutes = require('./routes/articles');

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/articles', articleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});