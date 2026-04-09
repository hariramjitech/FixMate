const express = require('express');
const { protect, admin } = require('../middleware');
const { User, Worker, Booking } = require('../models');

const router = express.Router();

/**
 * @desc    Get all users (customers)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all workers
 * @route   GET /api/admin/workers
 * @access  Private/Admin
 */
const getWorkers = async (req, res) => {
    try {
        const workers = await Worker.find({}).select('-password');
        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all bookings
 * @route   GET /api/admin/bookings
 * @access  Private/Admin
 */
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('userId', 'name email phone')
            .populate('workerId', 'name phone')
            .populate('serviceId', 'serviceName category')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Toggle Approve/Verify a worker
 * @route   PUT /api/admin/verify-worker/:id
 * @access  Private/Admin
 */
const verifyWorker = async (req, res) => {
    try {
        // First get current state, then toggle
        const current = await Worker.findById(req.params.id).select('isVerified name');
        if (!current) {
            return res.status(404).json({ message: 'Worker not found' });
        }
        const updatedWorker = await Worker.findByIdAndUpdate(
            req.params.id,
            { $set: { isVerified: !current.isVerified } },
            { new: true, select: '-password' }
        );
        res.json(updatedWorker);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Delete a worker
 * @route   DELETE /api/admin/workers/:id
 * @access  Private/Admin
 */
const deleteWorker = async (req, res) => {
    try {
        const worker = await Worker.findByIdAndDelete(req.params.id);
        if (worker) {
            res.json({ message: 'Worker removed' });
        } else {
            res.status(404).json({ message: 'Worker not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get platform-wide dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalWorkers = await Worker.countDocuments({});
        const totalBookings = await Booking.countDocuments({});
        const totalRevenue = await Booking.aggregate([
            { $match: { status: 'Finished' } },
            { $group: { _id: null, total: { $sum: '$finalPrice' } } },
        ]);

        res.json({
            totalUsers,
            totalWorkers,
            totalBookings,
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Assign worker to a booking
 * @route   PUT /api/admin/bookings/:id/assign
 * @access  Private/Admin
 */
const assignWorkerToBooking = async (req, res) => {
    try {
        const { workerId } = req.body;
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        const worker = await Worker.findById(workerId);
        if (!worker) return res.status(404).json({ message: 'Worker not found' });
        
        booking.workerId = workerId;
        booking.status = 'Worker On The Way'; // Or whichever status makes sense when assigned
        await booking.save();
        
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

router.get('/users', protect, admin, getUsers);
router.get('/workers', protect, admin, getWorkers);
router.get('/bookings', protect, admin, getBookings);
router.get('/stats', protect, admin, getStats);
router.put('/verify-worker/:id', protect, admin, verifyWorker);
router.put('/bookings/:id/assign', protect, admin, assignWorkerToBooking);
router.delete('/workers/:id', protect, admin, deleteWorker);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
