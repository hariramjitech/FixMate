import React, { useState } from 'react';
import { Download, FileText, PieChart, Activity, CheckCircle2, Clock } from 'lucide-react';
import { getSummaryReportData, getBookingReportData } from '../../../api';
import toast from 'react-hot-toast';

const ReportsTab = () => {
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingBookings, setLoadingBookings] = useState(false);

    const downloadCSV = (data, fileName) => {
        if (!data || data.length === 0) {
            toast.error("No data available to export");
            return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','), // Header row
            ...data.map(row => 
                headers.map(fieldName => {
                    const value = row[fieldName];
                    // Handle objects (like populated fields) or strings with commas
                    const cell = value && typeof value === 'object' ? JSON.stringify(value) : String(value || '');
                    return `"${cell.replace(/"/g, '""')}"`;
                }).join(',')
            )
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSummaryExport = async () => {
        setLoadingSummary(true);
        try {
            const res = await getSummaryReportData();
            // Wrap object in array for CSV function
            downloadCSV([res.data], 'Platform_Summary_Report');
            toast.success('Summary report downloaded!');
        } catch (err) {
            toast.error('Failed to generate summary report');
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleBookingsExport = async () => {
        setLoadingBookings(true);
        try {
            const res = await getBookingReportData();
            // Transform populated fields for better CSV readability
            const flatBookings = res.data.map(b => ({
                ID: b._id,
                Customer: b.userId?.name || 'N/A',
                CustomerEmail: b.userId?.email || 'N/A',
                Worker: b.workerId?.name || 'N/A',
                Service: b.serviceId?.serviceName || 'N/A',
                Status: b.status,
                Price: b.finalPrice,
                PlatformFee: b.platformFee,
                PartsCost: b.partsCost,
                WorkerEarnings: b.workerEarnings,
                Date: new Date(b.createdAt).toLocaleDateString(),
            }));
            downloadCSV(flatBookings, 'Detailed_Bookings_Report');
            toast.success('Bookings report downloaded!');
        } catch (err) {
            toast.error('Failed to generate bookings report');
        } finally {
            setLoadingBookings(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in p-2">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-indigo-600" />
                        Executive Intelligence Reports
                    </h2>
                    <p className="text-gray-500 font-medium mt-1">Generate high-precision datasets for platform auditing and growth analysis.</p>
                </div>
                <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                    <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">Real-time Data Ready</span>
                </div>
            </div>

            {/* Report Generation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Summary Report Card */}
                <div className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-12 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
                    
                    <div className="relative p-8 flex flex-col h-full">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
                            <PieChart className="w-7 h-7 text-white" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Platform Summary</h3>
                        <p className="text-sm text-gray-500 mb-8 flex-grow">
                            An executive overview of platform health, including total user base, active workforce, 
                            cumulative bookings, and gross platform revenue. Perfect for quarterly reviews.
                        </p>

                        <div className="space-y-4 mb-8">
                            {[
                                { icon: CheckCircle2, text: 'Consolidated performance metrics' },
                                { icon: CheckCircle2, text: 'Historical revenue aggregation' },
                                { icon: Clock, text: 'Instant generation' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs font-bold text-gray-400">
                                    <item.icon className="w-4 h-4 text-indigo-500" />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleSummaryExport}
                            disabled={loadingSummary}
                            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loadingSummary ? (
                                <span className="flex items-center gap-2">Generating... <Activity className="w-4 h-4 animate-spin" /></span>
                            ) : (
                                <>Download Executive Summary <Download className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </div>

                {/* Detailed Bookings Card */}
                <div className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-12 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                    
                    <div className="relative p-8 flex flex-col h-full">
                        <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-600/20">
                            <Activity className="w-7 h-7 text-white" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Transaction Ledger</h3>
                        <p className="text-sm text-gray-500 mb-8 flex-grow">
                            Deep-dive into every transaction. Includes granular split details (fees, parts, worker pay), 
                            customer identities, and service categories. Essential for tax and audit logs.
                        </p>

                        <div className="space-y-4 mb-8">
                            {[
                                { icon: CheckCircle2, text: 'Full transaction transparency' },
                                { icon: CheckCircle2, text: 'Worker & Service population' },
                                { icon: Clock, text: 'Filtered by lifetime status' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs font-bold text-gray-400">
                                    <item.icon className="w-4 h-4 text-emerald-500" />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleBookingsExport}
                            disabled={loadingBookings}
                            className="w-full flex items-center justify-center gap-3 bg-emerald-950 text-white font-black py-4 rounded-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loadingBookings ? (
                                <span className="flex items-center gap-2">Compiling... <Activity className="w-4 h-4 animate-spin" /></span>
                            ) : (
                                <>Export Detailed Ledger <Download className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Warning / Audit Trace */}
            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4 items-start">
               <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-amber-600" />
               </div>
               <div>
                  <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Audit Trace Active</h4>
                  <p className="text-xs text-amber-700 leading-relaxed font-bold">
                     All report generation activities are logged for administrative transparency. Ensure downloaded CSV exports are stored in secure, encrypted environments as per platform PII policy.
                  </p>
               </div>
            </div>
        </div>
    );
};

export default ReportsTab;
