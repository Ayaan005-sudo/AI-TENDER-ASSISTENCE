require('dotenv').config();
const { sendConfirmationEmail } = require('./utils/emailService');

console.log('Starting test...');

sendConfirmationEmail('ayaanah0786@gmail.com', 'Test Tender', [], new Date(), 'Test message')
    .then(() => console.log('SUCCESS'))
    .catch(err => console.error('FAILED:', err.message));

