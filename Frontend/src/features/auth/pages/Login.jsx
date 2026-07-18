import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Note: Ensure it's react-router-dom
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = await handleLogin({ email, password });
        if (user) {
            navigate('/');
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen w-full flex justify-center items-center bg-[#161616] text-white">
                <motion.h1 
                    animate={{ opacity: [0.5, 1, 0.5] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-2xl font-semibold text-[#e1034d]"
                >
                    Loading...
                </motion.h1>
            </main>
        );
    }

    return (
        <main className="min-h-screen w-full flex bg-[#161616] text-slate-100 font-sans">
            {/* Left Side: Image / Branding (Hidden on small screens) */}
            <div className="hidden lg:flex w-1/2 relative justify-center items-center overflow-hidden">
                <div className="absolute inset-0 bg-[#e1034d]/20 mix-blend-multiply z-10"></div>
                <img 
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" 
                    alt="Technology Background" 
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="z-20 text-center backdrop-blur-sm bg-black/30 p-8 rounded-3xl border border-white/10">
                    <h2 className="text-4xl font-bold mb-4 text-white">Welcome Back</h2>
                    <p className="text-lg text-gray-300 max-w-md">Continue your journey and analyze your skills to build the perfect career routine.</p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex justify-center items-center p-6">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-md flex flex-col gap-6"
                >
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Login</h1>
                        <p className="text-gray-400">Enter your details to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <motion.div 
                            className="flex flex-col gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email" 
                                id="email" 
                                name='email' 
                                placeholder='name@example.com' 
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:bg-white/10 focus:border-[#e1034d] focus:ring-1 focus:ring-[#e1034d] transition-all duration-300"
                                required
                            />
                        </motion.div>

                        <motion.div 
                            className="flex flex-col gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                type="password" 
                                id="password" 
                                name='password' 
                                placeholder='••••••••' 
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:bg-white/10 focus:border-[#e1034d] focus:ring-1 focus:ring-[#e1034d] transition-all duration-300"
                                required
                            />
                        </motion.div>

                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full mt-2 px-6 py-3 bg-[#e1034d] hover:bg-[#d20d3b] text-white font-semibold rounded-xl transition-colors duration-300 border-none outline-none"
                            type="submit"
                        >
                            Login
                        </motion.button>
                    </form>

                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center text-gray-400 mt-4"
                    >
                        Don't have an account?{' '}
                        <Link to="/register" className="text-[#e1034d] font-medium hover:text-[#d20d3b] hover:underline transition-all">
                            Register
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </main>
    );
};

export default Login;
