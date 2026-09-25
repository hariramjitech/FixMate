const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    // Ignore DNS override errors in serverless containers
}
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config');
const logger = require('./logger');
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const workerRoutes = require('./routes/workerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Connect to database in background
connectDB().catch(err => console.error('Initial DB connect error:', err));

// Ensure default admin exists automatically
const { User } = require('./models');
let adminCreated = false;
const ensureAdmin = async () => {
    if (adminCreated) return;
    try {
        const adminEmail = 'admin@fixmate.com';
        const exists = await User.findOne({ email: adminEmail });
        if (exists) {
            if (exists.password !== 'Admin@1234') {
                exists.password = 'Admin@1234';
                await exists.save();
                console.log('Admin password reset to default.');
            }
        } else {
            await User.create({
                name: 'FixMate Admin',
                email: adminEmail,
                phone: '9000000000',
                password: 'Admin@1234',
                address: 'FixMate HQ',
                role: 'admin',
            });
            console.log('Default Admin created.');
        }
        adminCreated = true;
    } catch (e) {
        console.error('Error ensuring admin:', e.message);
    }
};

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: '*', // Allows frontend on any port to connect
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

io.on('connection', (socket) => {
    // Join a room based on the user's or worker's ID to receive specific notifications
    socket.on('join', (userId) => {
        socket.join(userId);
    });

    socket.on('disconnect', () => {
        // Handle disconnect if needed
    });
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Ensure DB connected on each request
app.use(async (req, res, next) => {
    await connectDB();
    ensureAdmin().catch(() => {});
    req.io = io;
    next();
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('FixMate API is running with Socket.io...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;

