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

const fsSync = require('fs');
const originalLog = console.log;
const originalError = console.error;

const util = require('util');
console.log = function(...args) {
    const msg = args.map(arg => {
        if (arg instanceof Error) return arg.stack;
        if (typeof arg === 'object') return util.inspect(arg, { depth: null });
        return arg;
    }).join(' ');
    fsSync.writeSync(1, msg + '\n');
};
console.error = function(...args) {
    const msg = args.map(arg => {
        if (arg instanceof Error) return arg.stack;
        if (typeof arg === 'object') return util.inspect(arg, { depth: null });
        return arg;
    }).join(' ');
    fsSync.writeSync(2, msg + '\n');
};

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const tenderRoutes = require('./routes/tenderRoutes');
const tenderAdvisorRoutes = require('./routes/tenderAdvisor');
const tenderComparisonRoutes = require('./routes/tenderComparison');
const { startReminderScheduler } = require('./utils/reminderScheduler');
const TenderRecord = require('./models/tenderRecord');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/tender', tenderAdvisorRoutes);
app.use('/api/tender', tenderComparisonRoutes);

app.use(cors());



const port = process.env.PORT || 3000;

// Add connection event listeners with timestamps
mongoose.connection.on('connected', () => {
    console.log(`[${new Date().toISOString()}] 🟢 Mongoose connected to DB`);
});
mongoose.connection.on('disconnected', () => {
    console.log(`[${new Date().toISOString()}] 🔴 Mongoose disconnected from DB`);
});
mongoose.connection.on('reconnected', () => {
    console.log(`[${new Date().toISOString()}] 🟡 Mongoose reconnected to DB`);
});
mongoose.connection.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] ❌ Mongoose connection error:`, err);
});

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
    .then(() => console.log('mongoose get connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.listen(port, () => {
    console.log('app is listening to port ' + port);
    startReminderScheduler();
});





app.post('/insert-tenders', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'tender.json');

        // Check if tender.json exists
        try {
            await fs.access(filePath);
        } catch (err) {
            return res.status(404).json({ success: false, message: 'tender.json file not found' });
        }

        // Read tender.json
        const fileContent = await fs.readFile(filePath, 'utf-8');
        if (!fileContent.trim()) {
            return res.status(400).json({ success: false, message: 'tender.json file is empty' });
        }

        // Parse JSON
        const tendersData = JSON.parse(fileContent);
        const tendersArray = Array.isArray(tendersData) ? tendersData : [tendersData];

        if (tendersArray.length === 0) {
            return res.status(400).json({ success: false, message: 'No tender records to insert' });
        }

        // Helper to parse DD-MM-YYYY date strings to Date objects
        const parseDate = (dateStr) => {
            if (!dateStr) return null;
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // 0-indexed month
                const year = parseInt(parts[2], 10);
                return new Date(Date.UTC(year, month, day));
            }
            return null;
        };

        // Prepare bulk write operations for duplicate handling
        const bulkOps = tendersArray.map(tender => {
            if (!tender.id || !tender.title) {
                throw new Error('Each tender must contain at least a valid id and title');
            }

            const closingDate = parseDate(tender.closingDate);
            const bidOpeningDate = parseDate(tender.bidOpeningDate);

            return {
                updateOne: {
                    filter: { id: tender.id },
                    update: {
                        $set: {
                            title: tender.title,
                            referenceNumber: tender.referenceNumber,
                            department: tender.department,
                            category: tender.category,
                            industry: tender.industry,
                            state: tender.state,
                            city: tender.city,
                            estimatedValue: tender.estimatedValue,
                            emd: tender.emd,
                            turnoverRequired: tender.turnoverRequired,
                            experienceRequired: tender.experienceRequired,
                            requiredLicenses: tender.requiredLicenses,
                            closingDate,
                            bidOpeningDate,
                            summary: tender.summary,
                            sourceUrl: tender.sourceUrl
                        }
                    },
                    upsert: true
                }
            };
        });

        const result = await TenderRecord.bulkWrite(bulkOps);

        return res.status(200).json({
            success: true,
            message: 'Tenders successfully inserted/updated',
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            upsertedCount: result.upsertedCount
        });
    } catch (error) {
        console.error('Error inserting tenders:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process tenders',
            error: error.message
        });
    }
});


