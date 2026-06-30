// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const userRoutes = require('./routes/userRoutes');
// const tenderRoutes = require('./routes/tenderRoutes');

// const app = express();

// app.use(express.json());
// app.use(cors());
// app.use('/api/users', userRoutes);
// app.use('/api/tenders', tenderRoutes);

// const port = process.env.PORT || 3000;

// // Choose SRV URI if present, otherwise fallback to standard URI
// const mongoUri = process.env.MONGO_URI2 || process.env.MONGO_URI;
// console.log('Connecting to MongoDB URI:', mongoUri);

// async function connectMongo() {
//     const srvUri = process.env.MONGO_URI2;
//     const stdUri = process.env.MONGO_URI;
//     try {
//         await mongoose.connect(srvUri, { serverSelectionTimeoutMS: 60000 });
//         console.log('mongoose connected (SRV)');
//     } catch (err) {
//         console.warn('SRV connection failed, attempting standard URI:', err.message);
//         await mongoose.connect(stdUri, { serverSelectionTimeoutMS: 60000 });
//         console.log('mongoose connected (standard)');
//     }
// }
// connectMongo().catch(e => console.error('MongoDB connection error:', e));

// app.listen(port, () => {
//     console.log('app is listening to port ' + port);
// });


require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const tenderRoutes = require('./routes/tenderRoutes');
const tenderAdvisorRoutes = require('./routes/tenderAdvisor');
const tenderComparisonRoutes = require('./routes/tenderComparison');
const { startReminderScheduler } = require('./utils/reminderScheduler');
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/tender', tenderAdvisorRoutes);
app.use('/api/tender', tenderComparisonRoutes);

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('mongoose get connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.listen(port, () => {
    console.log('app is listening to port ' + port);
    startReminderScheduler();
});
