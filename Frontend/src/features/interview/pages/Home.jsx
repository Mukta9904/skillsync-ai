import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Target, Briefcase, User, Upload, AlertCircle, Play, Sun, Moon, FileText, ChevronRight } from 'lucide-react';
import { useInterview } from '../hooks/useInterview.js';

// --- Framer Motion Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

const Home = () => {
    const { loading, generateReport, reports } = useInterview();
    const [jobDescription, setJobDescription] = useState("");
    const [selfDescription, setSelfDescription] = useState("");
    const [fileName, setFileName] = useState("");
    
    // Initialize theme from localStorage or default to dark
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });
    
    const resumeInputRef = useRef(null);
    const navigate = useNavigate();

    // Sync theme with HTML document root for Tailwind CSS
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Form Validation: Prevent submission without required data
    const canSubmit = jobDescription.trim().length > 10 && (fileName || selfDescription.trim().length > 5);

    const handleGenerateReport = async () => {
        if (!canSubmit) return;
        
        const resumeFile = resumeInputRef.current?.files[0];
        const data = await generateReport({ jobDescription, selfDescription, resumeFile });
        
        if (data && data._id) {
            navigate(`/interview/${data._id}`);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    // --- Loading State UI ---
    if (loading) {
        return (
            <main className="min-h-screen w-full bg-gray-50 dark:bg-[#0d1117] flex flex-col items-center justify-center text-gray-900 dark:text-white transition-colors duration-500">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-6"
                >
                    <motion.div 
                        animate={{ 
                            boxShadow: ["0px 0px 0px rgba(255,45,120,0)", "0px 0px 40px rgba(255,45,120,0.5)", "0px 0px 0px rgba(255,45,120,0)"],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-20 h-20 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#ff2d78] rounded-2xl flex items-center justify-center shadow-lg"
                    >
                        <Target className="w-10 h-10 text-[#ff2d78]" />
                    </motion.div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Analyzing Profile</h1>
                        <p className="text-gray-500 dark:text-[#7d8590] text-sm animate-pulse">Cross-referencing your skills with the role...</p>
                    </div>
                    <div className="w-64 h-2 bg-gray-200 dark:bg-[#1c2230] rounded-full overflow-hidden relative">
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute inset-0 w-1/2 bg-linear-to-r from-transparent via-[#ff2d78] to-transparent"
                        />
                    </div>
                </motion.div>
            </main>
        );
    }

    // --- Main UI ---
    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3] font-sans flex flex-col items-center py-10 px-4 sm:px-6 transition-colors duration-500 relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <motion.div 
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#ff2d78]/10 blur-[120px] rounded-full pointer-events-none" 
            />

            {/* Theme Toggle Button */}
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme} 
                className="absolute top-6 right-6 p-2.5 rounded-full bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-[#2a3348] shadow-sm hover:shadow-md dark:hover:bg-[#2a3348] transition-all z-50 text-gray-700 dark:text-gray-300"
                aria-label="Toggle Theme"
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Header Section */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="text-center mb-10 z-10 pt-8"
            >
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight text-gray-900 dark:text-white">
                    Craft Your Custom <br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-linear-to-r from-[#ff2d78] to-[#ff6b9d]">Interview Strategy</span>
                </h1>
                <p className="text-gray-600 dark:text-[#7d8590] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                    Our AI deeply analyzes your target job description and unique profile to generate a tailored preparation roadmap, technical questions, and skill gap analysis.
                </p>
            </motion.header>

            {/* Main Interactive Card */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                className="w-full max-w-5xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#2a3348] rounded-2xl overflow-hidden shadow-xl z-10 transition-colors duration-300"
            >
                <div className="flex flex-col md:flex-row min-h-125">
                    
                    {/* --- Left Panel (Job Description) --- */}
                    <div className="flex-1 flex flex-col gap-4 p-6 sm:p-8 relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#ff2d78]/10 rounded-lg">
                                    <Briefcase className="w-5 h-5 text-[#ff2d78]" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Job Description</h2>
                            </div>
                            <span className="bg-[#ff2d78]/10 text-[#ff2d78] border border-[#ff2d78]/30 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="flex-1 w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#2a3348] rounded-xl p-4 text-gray-900 dark:text-[#e6edf3] text-sm resize-none outline-none transition-all focus:border-[#ff2d78] focus:ring-2 focus:ring-[#ff2d78]/20 placeholder:text-gray-400 dark:placeholder:text-[#7d8590] shadow-inner"
                            placeholder="Paste the full job description here...&#10;&#10;e.g. 'We are looking for a Senior Frontend Engineer proficient in React, TypeScript, and large-scale system design...'"
                            maxLength={5000}
                        />
                        <div className="absolute bottom-10 right-10 text-xs font-medium text-gray-400 dark:text-[#7d8590]">
                            {jobDescription.length} / 5000
                        </div>
                    </div>

                    {/* Desktop Divider */}
                    <div className="hidden md:block w-px bg-gray-100 dark:bg-[#2a3348]" />
                    {/* Mobile Divider */}
                    <div className="block md:hidden h-px w-full bg-gray-100 dark:bg-[#2a3348]" />

                    {/* --- Right Panel (Profile Details) --- */}
                    <div className="flex-1 flex flex-col gap-6 p-6 sm:p-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <User className="w-5 h-5 text-blue-500" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Profile</h2>
                        </div>

                        {/* Dropzone */}
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Upload Resume
                                <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Recommended</span>
                            </label>
                            <label htmlFor="resume" className="relative overflow-hidden border-2 border-dashed border-gray-300 dark:border-[#2a3348] hover:border-[#ff2d78] dark:hover:border-[#ff2d78] hover:bg-[#ff2d78]/5 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group bg-gray-50 dark:bg-[#0d1117]">
                                {fileName ? (
                                    <FileText className="w-8 h-8 text-[#ff2d78] mb-2 transition-transform group-hover:scale-110" />
                                ) : (
                                    <Upload className="w-8 h-8 text-gray-400 dark:text-[#7d8590] group-hover:text-[#ff2d78] mb-2 transition-all group-hover:-translate-y-1" />
                                )}
                                <p className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] text-center line-clamp-1">
                                    {fileName ? fileName : "Click to upload or drag & drop"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-[#7d8590] mt-1">PDF or DOCX up to 5MB</p>
                                <input onChange={handleFileChange} ref={resumeInputRef} hidden type="file" id="resume" accept=".pdf,.docx" />
                            </label>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 text-gray-400 dark:text-[#7d8590] text-xs font-bold uppercase tracking-widest">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a3348]" />
                            OR
                            <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a3348]" />
                        </div>

                        {/* Manual Entry */}
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="selfDescription">Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                id="selfDescription"
                                className="w-full h-full min-h-25 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#2a3348] rounded-xl p-4 text-gray-900 dark:text-[#e6edf3] text-sm resize-none outline-none transition-all focus:border-[#ff2d78] focus:ring-2 focus:ring-[#ff2d78]/20 placeholder:text-gray-400 dark:placeholder:text-[#7d8590]"
                                placeholder="Briefly describe your years of experience, core tech stack, and key achievements..."
                            />
                        </div>
                    </div>
                </div>

                {/* --- Footer Action Bar --- */}
                <div className="flex items-center justify-between p-5 px-6 sm:px-8 border-t border-gray-200 dark:border-[#2a3348] bg-gray-50 dark:bg-[#161b22] transition-colors">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
                        <span className="text-xs text-gray-600 dark:text-[#7d8590] font-medium hidden sm:block">
                            AI-Powered Analysis &bull; ~30 seconds
                        </span>
                    </div>
                    
                    <motion.button
                        whileHover={canSubmit ? { scale: 1.02 } : {}}
                        whileTap={canSubmit ? { scale: 0.98 } : {}}
                        onClick={handleGenerateReport}
                        disabled={!canSubmit}
                        className={`ml-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 w-full sm:w-auto ${
                            canSubmit 
                                ? "bg-linear-to-r from-[#ff2d78] to-[#d20d3b] text-white shadow-lg shadow-[#ff2d78]/25 hover:shadow-xl cursor-pointer" 
                                : "bg-gray-200 dark:bg-[#2a3348] text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        }`}
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Generate Strategy
                    </motion.button>
                </div>
            </motion.div>

            {/* --- Recent Reports List (Animated) --- */}
            <AnimatePresence>
                {reports && reports.length > 0 && (
                    <motion.section 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="w-full max-w-5xl mt-16 flex flex-col gap-6 z-10"
                    >
                        <h2 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3] flex items-center gap-2">
                            Recent Strategies
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {reports.map((report) => (
                                <motion.div 
                                    variants={itemVariants}
                                    key={report._id} 
                                    onClick={() => navigate(`/interview/${report._id}`)}
                                    className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#2a3348] hover:border-[#ff2d78] dark:hover:border-[#ff2d78] rounded-xl p-5 cursor-pointer transition-all duration-300 group flex flex-col relative overflow-hidden shadow-sm hover:shadow-md"
                                >
                                    {/* Hover Flare */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-[#ff2d78]/10 to-transparent rounded-bl-full transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
                                    
                                    <h3 className="font-bold text-base group-hover:text-[#ff2d78] transition-colors text-gray-900 dark:text-white line-clamp-1 mb-1 pr-4">
                                        {report.title || 'Untitled Position'}
                                    </h3>
                                    <p className="text-xs font-medium text-gray-500 dark:text-[#7d8590] mb-5">
                                        {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#2a3348]">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-0.5">Match Score</span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${report.matchScore >= 80 ? 'bg-[#3fb950]' : report.matchScore >= 60 ? 'bg-[#f5a623]' : 'bg-[#ff4d4d]'}`} />
                                                <span className={`text-sm font-extrabold ${report.matchScore >= 80 ? 'text-[#3fb950]' : report.matchScore >= 60 ? 'text-[#f5a623]' : 'text-[#ff4d4d]'}`}>
                                                    {report.matchScore || 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#0d1117] flex items-center justify-center group-hover:bg-[#ff2d78] transition-colors duration-300">
                                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;