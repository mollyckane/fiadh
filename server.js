require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

//frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use('/libs', express.static(path.join(__dirname, 'node_modules')));

//routes
const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
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

//home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if(require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;