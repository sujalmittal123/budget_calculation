import { useEffect, useState } from 'react';
import {
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiCheck,
  FiCreditCard,
  FiDollarSign,
  FiPieChart,
  FiPlay,
  FiShield,
  FiSmartphone,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/app/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: FiDollarSign,
      title: 'Smart Expense Tracking',
      description: 'Automatically categorize and track every expense with AI-powered insights.',
      color: 'from-primary/20 to-primary/5',
      image: '💰',
    },
    {
      icon: FiTrendingUp,
      title: 'Budget Intelligence',
      description: 'Set budgets, get alerts, and never overspend with predictive analytics.',
      color: 'from-primary/15 to-secondary',
      image: '📊',
    },
    {
      icon: FiPieChart,
      title: 'Visual Reports',
      description: 'Beautiful charts and graphs that make your financial data easy to understand.',
      color: 'from-secondary to-primary/10',
      image: '📈',
    },
    {
      icon: FiZap,
      title: 'Recurring Transactions',
      description: 'AI detects patterns and automates your recurring payments and income.',
      color: 'from-primary/20 to-muted',
      image: '⚡',
    },
  ];

  const stats = [
    { value: '25M+', label: 'Users Worldwide', icon: FiUsers },
    { value: '$5B+', label: 'Money Managed', icon: FiDollarSign },
    { value: '4.9/5', label: 'User Rating', icon: FiStar },
    { value: '99.9%', label: 'Uptime', icon: FiShield },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Freelance Designer',
      avatar: '👩‍💼',
      rating: 5,
      text: 'This app completely transformed how I manage my finances. I saved $3,000 in just 3 months!',
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      avatar: '👨‍💻',
      rating: 5,
      text: 'The AI-powered insights are incredible. It caught spending patterns I never noticed before.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Small Business Owner',
      avatar: '👩‍🔧',
      rating: 5,
      text: "Best budget tracker I've ever used. Clean interface, powerful features, and super easy to use.",
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Unlimited transactions',
        'Basic reports',
        '3 bank accounts',
        'Mobile app access',
        'Email support',
      ],
      popular: false,
      cta: 'Get Started Free',
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      features: [
        'Everything in Free',
        'Advanced analytics',
        'Unlimited bank accounts',
        'AI-powered insights',
        'Recurring transactions',
        'Export to Excel/PDF',
        'Priority support',
        'Custom categories',
      ],
      popular: true,
      cta: 'Start Free Trial',
    },
    {
      name: 'Business',
      price: '$29.99',
      period: 'per month',
      features: [
        'Everything in Pro',
        'Multi-user access',
        'Team collaboration',
        'API access',
        'White-label reports',
        'Dedicated account manager',
        'Custom integrations',
      ],
      popular: false,
      cta: 'Contact Sales',
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground antialiased">
      {/* Animated Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-chart-3/10 blur-3xl animate-pulse" />
        <div className="absolute right-20 top-40 h-96 w-96 rounded-full bg-chart-1/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 h-80 w-80 rounded-full bg-chart-2/10 blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl font-bold">
              💸
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              BudgetTracker
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Reviews
            </a>
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link
              to="/login"
              className="rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-lg"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Link
            to="/login"
            className="md:hidden px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pb-24 pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm">
                <FiZap className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary/80">AI-Powered Budget Management</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                Make Your Money
                <span className="block text-primary">Work Harder</span>
              </h1>

              {/* Subheading */}
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Track spending, hit savings goals, and see clear insights in one simple dashboard.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-xl"
                >
                  Get Started Free
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button className="flex items-center gap-2 rounded-xl border border-border bg-card/70 px-8 py-4 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/60">
                  <FiPlay className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-3 pt-4">
                <div className="flex -space-x-2">
                  {['👤', '👤', '👤', '👤'].map((emoji, i) => (
                    <div
                      key={i}
                        className="w-10 h-10 rounded-full bg-secondary border-2 border-border flex items-center justify-center"
                      >
                        {emoji}
                      </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="w-4 h-4 fill-chart-4 text-chart-4" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Loved by 25 million+ users</p>
                </div>
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="relative">
              {/* Floating Cards */}
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="relative z-10 rounded-3xl border border-border/70 bg-card/90 p-8 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Dashboard</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive"></div>
                      <div className="w-3 h-3 rounded-full bg-chart-4"></div>
                      <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                    </div>
                  </div>

                  {/* Balance Card */}
                  <div className="bg-primary rounded-2xl p-6 mb-6 text-primary-foreground">
                    <p className="text-primary-foreground/80 text-sm mb-2">Total Balance</p>
                    <h2 className="text-4xl font-bold mb-4">$9,450.00</h2>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-primary-foreground">+12.5%</span>
                      <span className="text-primary-foreground/80">vs last month</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-card/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-chart-2 mb-2">
                        <FiTrendingUp className="w-4 h-4" />
                        <span className="text-xs">Income</span>
                      </div>
                      <p className="text-2xl font-bold">$5,502.45</p>
                    </div>
                    <div className="bg-card/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-destructive mb-2">
                        <FiDollarSign className="w-4 h-4" />
                        <span className="text-xs">Expenses</span>
                      </div>
                      <p className="text-2xl font-bold">$3,234.12</p>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="flex items-end gap-2 h-20">
                    {[40, 65, 45, 80, 60, 90, 70].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating Badge 1 - Top Right */}
                <div className="absolute -top-4 -right-4 bg-card border border-border rounded-2xl px-6 py-3 shadow-lg animate-float">
                  <div className="flex items-center gap-2">
                    <FiTarget className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Savings Goal</p>
                      <p className="text-lg font-bold">85%</p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2 - Bottom Left */}
                <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl px-6 py-3 shadow-lg animate-float-delayed">
                  <div className="flex items-center gap-2">
                    <FiAward className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Budget Score</p>
                      <p className="text-lg font-bold">92/100</p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 3 - Middle Right */}
                <div className="absolute top-1/2 -right-8 bg-card border border-border rounded-2xl px-5 py-3 shadow-lg animate-bounce-slow">
                  <div className="text-center">
                    <p className="text-2xl mb-1">🔥</p>
                    <p className="text-xs text-muted-foreground">15 Day Streak</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 border-y border-border/50 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="group cursor-pointer rounded-2xl border border-border/60 bg-card/60 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                  {stat.value}
                </h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features for
              <span className="block text-primary">
                Smart Money Management
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to take control of your finances in one beautiful app
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setActiveFeature(index)}
                className={`group relative bg-card backdrop-blur-xl rounded-2xl p-6 border transition-all duration-300 hover:scale-105 cursor-pointer ${ activeFeature === index ? 'border-primary/40 shadow-xl' : 'border-border hover:border-border' }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}
                ></div>

                <div className="relative">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-4 text-2xl`}
                  >
                    {feature.image}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 bg-secondary/20 px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Thousands
              <span className="block text-primary">
                of Happy Users
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">See what our users are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border/70 bg-card/90 p-8 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 fill-chart-4 text-chart-4" />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-chart-3 to-chart-5 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent
              <span className="block text-primary">
                Pricing
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">Choose the plan that's right for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl border bg-card/90 p-8 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.popular ? 'scale-[1.03] border-primary/40 shadow-xl' : 'border-border/70'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.price !== '$0' && (
                      <span className="text-muted-foreground">/{plan.period.split(' ')[0]}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.period}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <FiCheck className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/login"
                  className={`block w-full py-3 rounded-xl font-semibold text-center transition-all duration-300 ${ plan.popular ? 'bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg' : 'bg-card hover:bg-accent text-foreground border border-border' }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-card to-card/80 p-12 shadow-xl backdrop-blur-xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Take Control of
              <span className="block text-primary">
                Your Finances?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join millions of users who are already managing their money smarter
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-lg"
            >
              Get Started Free
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-lg">
                  💸
                </div>
                <span className="text-lg font-bold">BudgetTracker</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Making personal finance simple and accessible for everyone.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">© 2024 BudgetTracker. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <FiSmartphone className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <FiShield className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <FiUsers className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;
