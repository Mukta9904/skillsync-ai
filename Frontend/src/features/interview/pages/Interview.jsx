import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useInterview } from '../hooks/useInterview.js';
import { Code, MessageSquare, Map, ChevronDown, ArrowLeft, FileText, Sun, Moon } from 'lucide-react';

const CircularProgress = ({ value = 0, isDark }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const [offset, setOffset] = useState(circumference);
    const color = value >= 80 ? '#3fb950' : value >= 60 ? '#f5a623' : '#ff4d4d';
    const trackColor = isDark ? '#2a3348' : '#e5e7eb'; // Adjusts track color based on theme

    useEffect(() => {
        const progressOffset = circumference - (value / 100) * circumference;
        setTimeout(() => setOffset(progressOffset), 300);
    }, [value, circumference]);

    return (
        <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="transform -rotate-90 w-full h-full">
                <circle cx="48" cy="48" r={radius} stroke={trackColor} strokeWidth="6" fill="transparent" className="transition-colors duration-300" />
                <motion.circle 
                    cx="48" cy="48" r={radius} 
                    stroke={color} 
                    strokeWidth="6" 
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-[#e6edf3] leading-none transition-colors">{value}</span>
                <span className="text-[10px] text-gray-500 dark:text-[#7d8590] uppercase mt-1 transition-colors">Score</span>
            </div>
        </div>
    );
};

const Interview = () => {
    const [activeTab, setActiveTab] = useState('tech');
    const [expandedQ, setExpandedQ] = useState(0);
    const [theme, setTheme] = useState('dark'); // Theme state
    
    const { report, loading, getResumePdf } = useInterview();
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    if (loading || !report) {
        return (
            <div className={theme === 'dark' ? 'dark' : ''}>
                <main className="min-h-screen w-full bg-gray-50 dark:bg-[#0d1117] flex flex-col items-center justify-center text-gray-900 dark:text-white transition-colors duration-300">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <motion.div 
                            animate={{ boxShadow: ["0px 0px 0px #ff2d78", "0px 0px 40px #ff2d78", "0px 0px 0px #ff2d78"] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-20 h-20 bg-white dark:bg-[#161b22] border-2 border-[#ff2d78] rounded-2xl flex items-center justify-center"
                        >
                            <div className="w-10 h-10 border-4 border-[#ff2d78] border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold mb-2">Loading Report</h1>
                            <p className="text-gray-500 dark:text-[#7d8590] text-sm">Fetching your personalized interview strategy...</p>
                        </div>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className={theme === 'dark' ? 'dark' : ''}>
            <div className="min-h-screen w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-[#e6edf3] font-sans p-4 lg:p-6 flex flex-col transition-colors duration-300">
                
                <div className="flex justify-between items-center w-full max-w-7xl mx-auto mb-4">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 dark:text-[#7d8590] hover:text-gray-900 dark:hover:text-[#e6edf3] text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    
                    <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-[#1c2230] hover:bg-gray-300 dark:hover:bg-[#2a3348] transition-colors text-gray-700 dark:text-gray-300">
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#2a3348] rounded-2xl overflow-hidden shadow-2xl flex-1 h-full max-h-[85vh] transition-colors duration-300">
                    
                    {/* 1. Left Sidebar Navigation */}
                    <div className="w-full lg:w-[220px] shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-[#2a3348] p-4 lg:p-6 flex flex-col justify-between transition-colors">
                        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto">
                            <div className="hidden lg:block text-xs font-bold text-gray-500 dark:text-[#7d8590] uppercase tracking-wider mb-2 px-3">Report Menu</div>
                            {[
                                { id: 'tech', icon: Code, label: 'Technical' },
                                { id: 'behavioral', icon: MessageSquare, label: 'Behavioral' },
                                { id: 'roadmap', icon: Map, label: 'Roadmap' },
                            ].map((tab) => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                                        ${activeTab === tab.id 
                                            ? 'bg-[#ff2d78]/10 text-[#ff2d78]' 
                                            : 'text-gray-600 dark:text-[#7d8590] hover:bg-gray-100 dark:hover:bg-[#1c2230] hover:text-gray-900 dark:hover:text-[#e6edf3]'
                                        }`}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'stroke-[#ff2d78]' : ''}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => getResumePdf(interviewId)}
                            className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-[#ff2d78] to-[#d20d3b] hover:opacity-90 transition-opacity text-white text-sm font-semibold rounded-lg shadow-lg"
                        >
                            <FileText className="w-4 h-4" /> Download Resume
                        </button>
                    </div>

                    {/* 2. Center Content Area */}
                    <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gray-50/50 dark:bg-[#0d1117]/50 scrollbar-hide transition-colors">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-[#2a3348] transition-colors">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">
                                    {activeTab === 'tech' && 'Technical Questions'}
                                    {activeTab === 'behavioral' && 'Behavioral Questions'}
                                    {activeTab === 'roadmap' && 'Preparation Roadmap'}
                                </h2>
                                <span className="text-xs text-gray-600 dark:text-[#7d8590] bg-gray-100 dark:bg-[#1c2230] px-2 py-0.5 rounded-full border border-gray-200 dark:border-[#2a3348] transition-colors">
                                    {activeTab === 'roadmap' ? `${report.preparationPlan?.length || 0} Days` : 
                                    activeTab === 'tech' ? `${report.technicalQuestions?.length || 0} Items` : 
                                    `${report.behavioralQuestions?.length || 0} Items`}
                                </span>
                            </div>

                            {(activeTab === 'tech' || activeTab === 'behavioral') && (
                                <div className="flex flex-col gap-4 pb-12">
                                    {(activeTab === 'tech' ? report.technicalQuestions : report.behavioralQuestions)?.map((q, idx) => (
                                        <div key={idx} className="bg-white dark:bg-[#1c2230] border border-gray-200 dark:border-[#2a3348] hover:border-gray-300 dark:hover:border-[#3a4560] rounded-xl overflow-hidden transition-colors">
                                            <div 
                                                onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                                                className="flex items-start gap-3 p-4 cursor-pointer select-none"
                                            >
                                                <span className="shrink-0 text-[10px] font-bold text-[#ff2d78] bg-[#ff2d78]/10 border border-[#ff2d78]/20 rounded px-1.5 py-0.5 mt-0.5">
                                                    Q{idx + 1}
                                                </span>
                                                <p className="flex-1 text-sm font-medium text-gray-900 dark:text-[#e6edf3] leading-relaxed">{q.question}</p>
                                                <motion.div animate={{ rotate: expandedQ === idx ? 180 : 0 }}>
                                                    <ChevronDown className="w-5 h-5 text-gray-400 dark:text-[#7d8590]" />
                                                </motion.div>
                                            </div>

                                            <AnimatePresence>
                                                {expandedQ === idx && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="px-4 pb-4 overflow-hidden"
                                                    >
                                                        <div className="pt-4 border-t border-gray-100 dark:border-[#2a3348] flex flex-col gap-4 transition-colors">
                                                            <div className="flex flex-col gap-1.5">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 px-1.5 py-0.5 rounded w-fit">Interviewer Intent</span>
                                                                <p className="text-xs text-gray-600 dark:text-[#7d8590] leading-relaxed">{q.intention}</p>
                                                            </div>
                                                            <div className="flex flex-col gap-1.5">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3fb950] bg-[#3fb950]/10 border border-[#3fb950]/20 px-1.5 py-0.5 rounded w-fit">How to Answer</span>
                                                                <p className="text-xs text-gray-600 dark:text-[#7d8590] leading-relaxed">{q.answer}</p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'roadmap' && (
                                <div className="relative pl-7 pb-12 flex flex-col gap-0 border-l-2 border-gradient-to-b from-[#ff2d78] to-[#ff2d78]/10 border-[#ff2d78]/30 ml-2">
                                    {report.preparationPlan?.map((day, idx) => (
                                        <div key={idx} className="relative py-4 pl-6 flex flex-col gap-2">
                                            <div className="absolute -left-[32px] top-[1.2rem] w-[14px] h-[14px] rounded-full bg-white dark:bg-[#161b22] border-2 border-[#ff2d78] transition-colors" />
                                            
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-[#ff2d78] bg-[#ff2d78]/10 border border-[#ff2d78]/30 px-2 py-0.5 rounded-full">Day {day.day}</span>
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">{day.focus}</h3>
                                            </div>
                                            <ul className="flex flex-col gap-1.5 mt-1">
                                                {day.tasks?.map((task, tIdx) => (
                                                    <li key={tIdx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-[#7d8590]">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-[#7d8590] mt-1 shrink-0 transition-colors" />
                                                        {task}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* 3. Right Sidebar Overview */}
                    <div className="w-full lg:w-[260px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-[#2a3348] p-6 flex flex-col gap-8 bg-gray-50 dark:bg-[#161b22] transition-colors">
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-xs font-bold text-gray-500 dark:text-[#7d8590] uppercase tracking-wider self-start">Match Score</span>
                            <CircularProgress value={report.matchScore || 0} isDark={theme === 'dark'} />
                            <p className="text-xs text-center text-[#f5a623] px-2">Focus on identified skill gaps to improve your chances.</p>
                        </div>

                        <div className="h-[1px] w-full bg-gray-200 dark:bg-[#2a3348] transition-colors" />

                        <div className="flex flex-col gap-3">
                            <span className="text-xs font-bold text-gray-500 dark:text-[#7d8590] uppercase tracking-wider">Identified Gaps</span>
                            <div className="flex flex-wrap gap-2">
                                {report.skillGaps?.map((gap, idx) => {
                                    const styles = 
                                        gap.severity === 'high' ? 'text-[#ff4d4d] bg-[#ff4d4d]/10 border-[#ff4d4d]/30' :
                                        gap.severity === 'medium' ? 'text-[#f5a623] bg-[#f5a623]/10 border-[#f5a623]/30' :
                                        'text-[#3fb950] bg-[#3fb950]/10 border-[#3fb950]/30';

                                    return (
                                        <span key={idx} className={`text-xs font-medium px-2.5 py-1 rounded-md border ${styles}`}>
                                            {gap.skill}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Interview;
