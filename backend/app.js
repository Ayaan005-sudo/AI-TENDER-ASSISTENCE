require('dotenv').config()
const express = require("express");
const app = express();

const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const tenderRoutes = require('./routes/tenderRoutes');

app.use(express.json());
app.use(cors());

// Mount the user profile routes
app.use("/api/users", userRoutes);
app.use('/api/tenders', tenderRoutes);

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
}
main()
    .then(() => console.log("mongoose get connected"))
    .catch((e) => console.log(e.message))

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("app is listening to port " + port);
})

