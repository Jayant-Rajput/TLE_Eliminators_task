import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import cron from 'node-cron';

import { connectDB } from './lib/db.js';

import authRoutes from './routes/auth.route.js';    
import contestRoutes from "./routes/contest.route.js";

import { fetchDataAndUpdateDB } from './lib/utils.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);  


app.use("/api/auth", authRoutes);
app.use("/api/contest", contestRoutes);


cron.schedule('*/2 * * * *', async () => {
    try {
        console.log('Inside cron job try block');
        await fetchDataAndUpdateDB();
        console.log('Update completed');
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

app.listen(PORT, ()=>{
    console.log(`server running at port: ${PORT}`);
    connectDB();
})