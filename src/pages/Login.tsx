
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';

export const LoginString = () => {
    return "Login Page Loaded"; // Debug marker
}

const LoginPage: React.FC = () => {
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (isLogin) {
                const success = await login(email, password);
                if (success) {
                    navigate('/');
                } else {
                    setError('Invalid credentials.\nTry: admin@company.com / admin');
                }
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setIsSubmitting(false);
                    return;
                }
                const success = await signup(name, email, password);
                if (success) {
                    navigate('/');
                } else {
                    // Logic flow: signup returns true or throws. If false returned (unlikely with throw), generic error.
                    setError('Signup failed. Please try again.');
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(isLogin ? `Login Error: ${err.message || 'Unknown Error'}` : `Signup Error: ${err.message || 'Unknown Error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                        <p className="text-slate-400">
                            {isLogin ? 'Sign in to access the IT Helpdesk' : 'Join the team and get support'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                                        placeholder="John Doe"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                                        placeholder="••••••••"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                <p className="text-red-400 text-sm font-medium whitespace-pre-line">{error}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all transform hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Sign Up'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                        <div className="text-xs text-slate-500 space-y-2 mb-6">
                            <p className="font-bold text-slate-400 mb-2">Demo Credentials (Click to Fill):</p>
                            <div className="grid grid-cols-3 gap-2 text-left bg-slate-800/50 p-3 rounded-lg">
                                <div
                                    className="cursor-pointer group hover:bg-slate-700/50 p-1 rounded transition-colors"
                                    onClick={() => { setEmail('superuser@company.com'); setPassword('super'); setIsLogin(true); }}
                                >
                                    <span className="block text-[10px] uppercase text-pink-400 font-bold mb-0.5">Superuser</span>
                                    <span className="block text-slate-300 truncate font-mono">superuser...</span>
                                    <span className="block text-slate-500 font-mono">pass: super</span>
                                </div>
                                <div
                                    className="cursor-pointer group hover:bg-slate-700/50 p-1 rounded transition-colors"
                                    onClick={() => { setEmail('admin@company.com'); setPassword('admin'); setIsLogin(true); }}
                                >
                                    <span className="block text-[10px] uppercase text-indigo-400 font-bold mb-0.5">Admin</span>
                                    <span className="block text-slate-300 truncate font-mono">admin@...</span>
                                    <span className="block text-slate-500 font-mono">pass: admin</span>
                                </div>
                                <div
                                    className="cursor-pointer group hover:bg-slate-700/50 p-1 rounded transition-colors"
                                    onClick={() => { setEmail('student@college.edu'); setPassword('user'); setIsLogin(true); }}
                                >
                                    <span className="block text-[10px] uppercase text-emerald-400 font-bold mb-0.5">User</span>
                                    <span className="block text-slate-300 truncate font-mono">student@...</span>
                                    <span className="block text-slate-500 font-mono">pass: user</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
