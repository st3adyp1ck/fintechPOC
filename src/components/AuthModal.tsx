import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, Loader2, CheckCircle2, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'main' | 'magic-link' | 'magic-sent' | 'google'>('main');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleStep, setGoogleStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, mode]);

  const handleMagicLink = () => {
    if (!email || !email.includes('@')) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setMode('magic-sent');
    }, 1500);
  };

  const handleGoogle = () => {
    setMode('google');
    setGoogleStep(0);
    setIsLoading(true);

    // Simulate Google OAuth flow
    setTimeout(() => setGoogleStep(1), 800);
    setTimeout(() => setGoogleStep(2), 1800);
    setTimeout(() => setGoogleStep(3), 2800);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
      setMode('main');
    }, 3500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-cream-50 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Decorative top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-gold-400 via-teal-400 to-gold-400" />

            <div className="p-8">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-200 transition-colors"
              >
                <X className="w-4 h-4 text-navy-400" />
              </button>

              <AnimatePresence mode="wait">
                {/* Main Auth Screen */}
                {mode === 'main' && (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="text-center mb-8">
                      <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-6 h-6 text-gold-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-navy-900 mb-2">Welcome back</h2>
                      <p className="text-sm text-navy-400">Sign in to access your debt settlement dashboard</p>
                    </div>

                    {/* Google Button */}
                    <button
                      onClick={handleGoogle}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-cream-300 rounded-xl hover:border-navy-300 hover:shadow-md transition-all mb-4 group"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-sm font-medium text-navy-800 group-hover:text-navy-900">Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 h-px bg-cream-300" />
                      <span className="text-xs text-navy-400 font-medium uppercase tracking-wider">or</span>
                      <div className="flex-1 h-px bg-cream-300" />
                    </div>

                    {/* Magic Link Button */}
                    <button
                      onClick={() => setMode('magic-link')}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-navy-900 text-cream-50 rounded-xl hover:bg-navy-800 transition-all mb-6"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Sign in with email</span>
                    </button>

                    <p className="text-xs text-navy-400 text-center">
                      By signing in, you agree to our{' '}
                      <a href="#" className="underline hover:text-navy-600">Terms</a> and{' '}
                      <a href="#" className="underline hover:text-navy-600">Privacy Policy</a>
                    </p>
                  </motion.div>
                )}

                {/* Magic Link Email Input */}
                {mode === 'magic-link' && (
                  <motion.div
                    key="magic-link"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <button
                      onClick={() => setMode('main')}
                      className="flex items-center gap-1 text-xs text-navy-400 hover:text-navy-600 mb-6"
                    >
                      <ArrowRight className="w-3 h-3 rotate-180" />
                      Back
                    </button>

                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-navy-900 mb-2">Magic Link</h2>
                      <p className="text-sm text-navy-400">We'll send a secure sign-in link to your email. No password needed.</p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">Email address</label>
                      <input
                        ref={inputRef}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 placeholder:text-navy-300 transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleMagicLink()}
                      />
                    </div>

                    <button
                      onClick={handleMagicLink}
                      disabled={isLoading || !email.includes('@')}
                      className="w-full py-3.5 bg-navy-900 text-cream-50 rounded-xl text-sm font-medium hover:bg-navy-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending link...
                        </>
                      ) : (
                        <>
                          Send Magic Link
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {/* Magic Link Sent */}
                {mode === 'magic-sent' && (
                  <motion.div
                    key="magic-sent"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                      className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-navy-900 mb-2">Check your inbox</h2>
                    <p className="text-sm text-navy-500 mb-2">We sent a secure sign-in link to</p>
                    <p className="text-sm font-semibold text-navy-800 mb-6">{email}</p>
                    <p className="text-xs text-navy-400 mb-6">
                      Click the link in the email to sign in. If you don't see it, check your spam folder.
                    </p>
                    <button
                      onClick={() => { setMode('magic-link'); setIsLoading(false); }}
                      className="text-sm text-navy-500 hover:text-navy-700 underline"
                    >
                      Use a different email
                    </button>
                  </motion.div>
                )}

                {/* Google OAuth Simulation */}
                {mode === 'google' && (
                  <motion.div
                    key="google"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <div className="relative w-16 h-16 mx-auto mb-6">
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-navy-100"
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-t-gold-400 border-r-transparent border-b-transparent border-l-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {googleStep === 0 && (
                        <motion.p key="step0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm text-navy-500">
                          Connecting to Google...
                        </motion.p>
                      )}
                      {googleStep === 1 && (
                        <motion.p key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm text-navy-500">
                          Verifying account...
                        </motion.p>
                      )}
                      {googleStep === 2 && (
                        <motion.p key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm text-navy-500">
                          Fetching profile...
                        </motion.p>
                      )}
                      {googleStep === 3 && (
                        <motion.p key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-navy-500">
                          Redirecting to dashboard...
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Simulated progress bar */}
                    <div className="mt-4 h-1 bg-cream-200 rounded-full overflow-hidden max-w-[200px] mx-auto">
                      <motion.div
                        className="h-full bg-gold-400 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(googleStep + 1) * 25}%` }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
