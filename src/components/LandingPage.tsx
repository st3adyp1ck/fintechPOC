import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, DIFFERENTIATORS, HOW_IT_WORKS } from '../data';
import AuthModal from './AuthModal';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Scale,
  Lock,
  Activity,
  TrendingUp,
  Percent,
  Menu,
  X,
  ChevronDown,
  Star,
  Users,
  Award,
  Phone,
  Mail,
  MapPin,

} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Shield, Scale, Lock, Activity, TrendingUp, Percent,
};

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function LandingPage() {
  const { setCurrentView, setOnboardingStep } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calculatorDebt, setCalculatorDebt] = useState(30000);
  const [showFaqs, setShowFaqs] = useState<Record<string, boolean>>({});
  const [authOpen, setAuthOpen] = useState(false);
  const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleGetStarted = () => {
    setAuthSuccessCallback(() => () => {
      setOnboardingStep('basic-info');
      setCurrentView('onboarding');
    });
    setAuthOpen(true);
  };

  const handleSignIn = () => {
    setAuthSuccessCallback(() => () => {
      setCurrentView('dashboard');
    });
    setAuthOpen(true);
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    authSuccessCallback?.();
  };

  const faqs = [
    { q: 'Will this hurt my credit score?', a: 'Entering a debt settlement program typically causes a temporary dip in your credit score because you stop making payments to creditors while we negotiate. However, most clients see their scores begin recovering within 6-12 months of completing the program. Our included Credit Rebuilding Program is specifically designed to accelerate this recovery.' },
    { q: 'How is this different from debt consolidation?', a: 'Debt consolidation requires you to take out a new loan to pay off old debts — which means you need good credit to qualify. Our program is for people who do not qualify for consolidation loans. We negotiate directly with your creditors to reduce the total amount you owe, often settling for 40-60% of the balance.' },
    { q: 'What if a creditor sues me?', a: 'Every client is enrolled in our Legal Protection Plan at no extra cost. If a creditor files a lawsuit, our network of attorneys will respond and defend you. This protection is included because lawsuits are a reality of the settlement process — and we have your back.' },
    { q: 'Can I withdraw money from escrow?', a: 'Yes. Your escrow account is in your name. You can withdraw funds at any time for any reason, though doing so may delay settlements. There are no penalties for withdrawal — it is your money.' },
    { q: 'How long does the program take?', a: 'Most clients complete the program in 24-48 months, depending on their total debt and monthly deposit amount. The more you can deposit each month, the faster we can settle your accounts.' },
  ];

  return (
    <div className="min-h-screen bg-cream-50 text-navy-900">
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 left-0 right-0 z-50 bg-cream-50/80 backdrop-blur-xl border-b border-cream-300/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center gap-2.5"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-gold-400" />
              </div>
              <span className="text-lg font-bold text-navy-900 tracking-tight">DebtOptimize</span>
            </motion.div>
            <div className="hidden md:flex items-center gap-8">
              {['How It Works', 'Why Us', 'Calculator', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="link-underline text-sm font-medium text-navy-500 hover:text-navy-900 transition-colors"
                >
                  {item}
                </a>
              ))}
              <button
                onClick={handleSignIn}
                className="text-sm font-medium text-navy-500 hover:text-navy-900 transition-colors"
              >
                Sign In
              </button>
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 bg-navy-900 text-cream-50 text-sm font-medium rounded-xl hover:bg-navy-800 transition-colors"
              >
                Check Eligibility
              </motion.button>
            </div>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden bg-cream-50 border-b border-cream-300 px-4 py-4 space-y-3">
            {['How It Works', 'Why Us', 'Calculator', 'FAQ'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="block text-sm font-medium text-navy-600">{item}</a>
            ))}
            <button onClick={handleSignIn} className="w-full px-4 py-2.5 bg-white border border-cream-300 text-navy-900 text-sm font-medium rounded-xl">Sign In</button>
            <button onClick={handleGetStarted} className="w-full px-4 py-2.5 bg-navy-900 text-cream-50 text-sm font-medium rounded-xl">Check Eligibility</button>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden bg-navy-950 grain-dark min-h-screen flex items-center">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-navy-800/30 rounded-full blur-3xl" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 pt-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-300 text-xs font-medium mb-8"
              >
                <Star className="w-3 h-3" />
                Trusted by 50,000+ Americans
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-5xl lg:text-7xl font-bold text-cream-50 leading-[1.1] mb-8"
              >
                Stop drowning
                <br />
                in{' '}
                <span className="text-gold-400 italic">debt.</span>
                <br />
                Start living.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-navy-200 mb-10 max-w-lg leading-relaxed"
              >
                The middle class deserves better than 29% APR. We negotiate your credit card debt down by an average of{' '}
                <span className="text-gold-400 font-semibold">52%</span> — with no upfront fees, legal protection included, and a credit rebuilding program that actually works.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <motion.button
                  onClick={handleGetStarted}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group px-8 py-4 bg-gold-500 text-navy-950 font-bold rounded-xl hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
                >
                  Check If I Qualify
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 bg-white/5 text-cream-50 font-semibold rounded-xl hover:bg-white/10 transition-colors border border-white/10 backdrop-blur-sm"
                >
                  Calculate My Savings
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-8 text-sm text-navy-300"
              >
                {['No upfront fees', 'Soft credit pull', 'Takes 2 minutes'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gold-400" />
                    {item}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, x: 60, rotateY: 5 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="hidden lg:block perspective-1000"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-cream-50 font-semibold text-sm">Real Client Result</p>
                      <p className="text-navy-300 text-xs">Sarah K. from Austin, TX</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                      <p className="text-navy-300 text-xs mb-2 uppercase tracking-wider">Debt Before</p>
                      <p className="text-3xl font-bold text-rose-400">$34,200</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                      <p className="text-navy-300 text-xs mb-2 uppercase tracking-wider">Settled For</p>
                      <p className="text-3xl font-bold text-emerald-400">$16,400</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Amex', before: '$14,200', after: '$6,800', pct: 52 },
                      { label: 'Chase', before: '$12,000', after: '$5,600', pct: 53 },
                      { label: 'Citi', before: '$8,000', after: '$4,000', pct: 50 },
                    ].map((card) => (
                      <div key={card.label} className="flex items-center gap-3">
                        <span className="text-xs text-navy-300 w-12">{card.label}</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${card.pct}%` }}
                            transition={{ delay: 1.2, duration: 1.5, ease: 'easeOut' }}
                            className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-emerald-400 font-medium">{card.pct}% off</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-navy-400 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-navy-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section ref={statsRef} className="bg-navy-900 py-14 border-y border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 2100, prefix: '$', suffix: 'B+', label: 'Debt Negotiated' },
              { value: 52, prefix: '', suffix: '%', label: 'Avg. Reduction' },
              { value: 50000, prefix: '', suffix: '+', label: 'Clients Served' },
              { value: 48, prefix: '', suffix: '/5', label: 'Trustpilot Rating' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-4xl lg:text-5xl font-bold text-cream-50 mb-2">
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
                <p className="text-navy-300 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <p className="text-gold-600 text-sm font-semibold uppercase tracking-widest mb-4">The Problem</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-6 leading-tight">
              The Middle Class
              <br />
              <span className="italic text-navy-500">Debt Trap</span>
            </h2>
            <p className="text-lg text-navy-400 leading-relaxed">
              You earn too much for bankruptcy help, but not enough to keep up with 29% interest. Banks will not consolidate your debt because your credit score took a hit. You are stuck — and that is exactly where they want you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'The Working Class', desc: 'Struggling to make minimum payments. Often targeted by predatory lenders. Bankruptcy may be the only option — but it destroys credit for 7-10 years.', color: 'bg-rose-50 text-rose-600 border-rose-200' },
              { icon: Award, title: 'The Upper Class', desc: 'Access to low-interest consolidation loans, financial advisors, and tax strategies. They do not need our help — they already have options.', color: 'bg-navy-50 text-navy-600 border-navy-200' },
              { icon: Star, title: 'The Middle Class', desc: 'That is you. Earn $50K-$150K. Too much debt to manage, not enough to pay it off. Denied for consolidation. This is who we built DebtOptimize for.', color: 'bg-gold-50 text-gold-600 border-gold-200' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className={`bg-cream-50 rounded-2xl p-8 border shadow-sm transition-shadow hover:shadow-lg ${item.color}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${item.color.split(' ')[0]}`}>
                  <item.icon className={`w-7 h-7 ${item.color.split(' ')[1]}`} />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">{item.title}</h3>
                <p className="text-navy-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-4">The Process</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-6">How It Works</h2>
            <p className="text-lg text-navy-400">No loans. No new credit checks. Just expert negotiators fighting to reduce what you owe.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative group"
              >
                <div className="text-7xl font-bold text-cream-300 mb-4 group-hover:text-gold-300 transition-colors duration-500">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-3">{item.title}</h3>
                <p className="text-navy-500 text-sm leading-relaxed">{item.description}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 right-0 w-full h-px">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-px bg-cream-300" />
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-cream-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section id="why-us" className="py-24 bg-navy-950 grain-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-4">Why Us</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-cream-50 mb-6">Built Different</h2>
            <p className="text-lg text-navy-300">Most debt settlement companies hide fees, ignore your calls, and leave you exposed to lawsuits. We fixed every broken part.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DIFFERENTIATORS.map((d, i) => {
              const Icon = iconMap[d.icon] || Shield;
              return (
                <motion.div
                  key={d.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                  className="spotlight-card bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  <div className="w-11 h-11 bg-gold-500/15 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <h3 className="text-lg font-bold text-cream-50 mb-2">{d.title}</h3>
                  <p className="text-navy-300 text-sm leading-relaxed">{d.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="py-24 bg-cream-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-cream-50 rounded-3xl shadow-2xl shadow-navy-900/5 border border-cream-300 p-8 lg:p-14 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="text-center mb-10">
                <p className="text-gold-600 text-sm font-semibold uppercase tracking-widest mb-3">Savings Calculator</p>
                <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-3">See How Much You Could Save</h2>
                <p className="text-navy-400">Move the slider to match your total unsecured debt.</p>
              </div>

              <div className="mb-10">
                <input
                  type="range"
                  min="5000"
                  max="100000"
                  step="1000"
                  value={calculatorDebt}
                  onChange={(e) => setCalculatorDebt(Number(e.target.value))}
                  aria-label="Total unsecured debt"
                  className="w-full mb-6"
                />
                <div className="flex justify-between text-sm text-navy-400">
                  <span>$5,000</span>
                  <span className="text-3xl font-bold text-navy-900">{formatCurrency(calculatorDebt)}</span>
                  <span>$100,000</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { label: 'Total Debt', value: formatCurrency(calculatorDebt), bg: 'bg-cream-200' },
                  { label: 'Est. Settlement', value: formatCurrency(calculatorDebt * 0.48), bg: 'bg-emerald-50 border border-emerald-200' },
                  { label: 'You Save', value: formatCurrency(calculatorDebt * 0.52), bg: 'bg-gold-50 border border-gold-200' },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ y: -2 }}
                    className={`text-center p-5 rounded-2xl ${item.bg}`}
                  >
                    <p className="text-xs text-navy-400 mb-2 uppercase tracking-wider font-medium">{item.label}</p>
                    <p className="text-2xl font-bold text-navy-900">{item.value}</p>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-navy-900 text-cream-50 font-bold rounded-xl hover:bg-navy-800 transition-colors flex items-center justify-center gap-2"
              >
                Get My Free Savings Estimate
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <p className="text-center text-xs text-navy-400 mt-4">
                Based on average settlement of 48% of enrolled debt. Results vary. Free consultation.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-teal-600 text-sm font-semibold uppercase tracking-widest mb-4">Testimonials</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-navy-900">Real People. Real Relief.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Marcus T.', location: 'Phoenix, AZ', debt: '$28,400', saved: '$15,200', quote: 'I was paying $900 a month in minimum payments and my balances were going UP. DebtOptimize settled all 4 cards for less than half. I am debt-free in 3 years instead of never.' },
              { name: 'Jennifer L.', location: 'Atlanta, GA', debt: '$41,600', saved: '$22,800', quote: 'The legal protection was a lifesaver. One creditor sued me and DebtOptimize attorneys handled everything. I did not pay a dime extra. Best decision I ever made.' },
              { name: 'David R.', location: 'Denver, CO', debt: '$19,200', saved: '$9,800', quote: 'I was embarrassed about my debt. The team never made me feel judged. They explained everything, showed me the dashboard, and I watched my settlements happen in real time.' },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="bg-cream-50 rounded-2xl p-8 shadow-sm border border-cream-300 hover:shadow-xl hover:border-cream-400 transition-all"
              >
                <div className="flex items-center gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-gold-400 fill-gold-400" />
                  ))}
                </div>
                <p className="text-navy-600 text-sm leading-relaxed mb-8">"{t.quote}"</p>
                <div className="flex items-center justify-between pt-6 border-t border-cream-300">
                  <div>
                    <p className="text-sm font-bold text-navy-900">{t.name}</p>
                    <p className="text-xs text-navy-400">{t.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-navy-400">Saved</p>
                    <p className="text-sm font-bold text-emerald-600">{t.saved}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-cream-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-gold-600 text-sm font-semibold uppercase tracking-widest mb-4">FAQ</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-navy-900">Questions? Answered.</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-cream-50 rounded-2xl border border-cream-300 overflow-hidden"
              >
                <button
                  onClick={() => setShowFaqs((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className="w-full flex items-center justify-between p-6 text-left group"
                >
                  <span className="font-semibold text-navy-900 pr-4 group-hover:text-navy-700 transition-colors">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: showFaqs[i] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-navy-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {showFaqs[i] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-sm text-navy-500 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy-950 grain-dark relative">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-cream-50 mb-6">
              Ready to Take
              <br />
              <span className="italic text-gold-400">Control?</span>
            </h2>
            <p className="text-lg text-navy-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join 50,000+ middle-class Americans who refused to let credit card debt define their lives. Your free eligibility check takes 2 minutes and does not affect your credit score.
            </p>
            <motion.button
              onClick={handleGetStarted}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-12 py-5 bg-gold-500 text-navy-950 font-bold rounded-xl hover:bg-gold-400 transition-colors shadow-xl shadow-gold-500/20 text-lg"
            >
              Check My Eligibility — Free
            </motion.button>
            <p className="text-navy-400 text-sm mt-5">No upfront fees. No obligation. No hard credit inquiry.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-navy-300 py-16 border-t border-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-gold-400" />
                </div>
                <span className="text-lg font-bold text-cream-50">DebtOptimize</span>
              </div>
              <p className="text-sm text-navy-400 leading-relaxed">
                Helping middle-class Americans break free from high-interest credit card debt through negotiation, not loans.
              </p>
            </div>
            <div>
              <h4 className="text-cream-50 font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-sm">
                {['About Us', 'How It Works', 'Pricing', 'Careers'].map((item) => (
                  <li key={item}><a href="#" className="link-underline hover:text-cream-50 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-cream-50 font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3 text-sm">
                {['Help Center', 'Contact Us', 'Legal Protection', 'Credit Rebuilding'].map((item) => (
                  <li key={item}><a href="#" className="link-underline hover:text-cream-50 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-cream-50 font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-navy-500" /> (800) 555-DEBT</li>
                <li className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-navy-500" /> help@debtoptimize.com</li>
                <li className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-navy-500" /> Austin, TX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-navy-900 pt-8 text-xs text-center text-navy-500">
            <p className="mb-2">
              DebtOptimize is a debt settlement company. We do not provide loans, credit repair, or bankruptcy services. Results vary and are not guaranteed. Not available in all states.
            </p>
            <p>
              This site is not a part of the Facebook website or Facebook Inc. Testimonials are from actual clients. Individual results will vary.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
