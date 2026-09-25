const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not defined in environment variables');
        return null;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            family: 4, // Force IPv4
            serverSelectionTimeoutMS: 8000,
        };

        cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((m) => {
            console.log(`MongoDB Connected: ${m.connection.host}`);
            return m;
        }).catch((err) => {
            console.error(`MongoDB Connection Error: ${err.message}`);
            cached.promise = null;
            if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
                process.exit(1);
            }
            return null;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

module.exports = connectDB;

