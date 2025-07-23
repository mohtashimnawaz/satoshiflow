import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Users,
  Clock,
  Bitcoin,
  DollarSign,
  Layers,
  Server,
  CheckCircle
} from 'lucide-react';

const LandingPage = () => {
  const [stats, setStats] = useState({
    timeToFinality: "400ms",
    transactionsPerSecond: "100k",
    totalTransactions: "10M+",
    activeUsers: "50k+"
  });

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      subtitle: "Real-time Bitcoin Streaming",
      description: "Experience instant Bitcoin transfers with 400ms finality, perfect for real-time applications and high-frequency streaming."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Highly Secure",
      subtitle: "Battle-tested Security",
      description: "Built on proven Internet Computer Protocol with advanced cryptographic security ensuring your Bitcoin streams are protected."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Massively Scalable",
      subtitle: "Unlimited Growth Potential",
      description: "SatoshiFlow supports unlimited scalability, enabling your streaming projects to grow exponentially without constraints."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Engineered to Evolve",
      subtitle: "Future-Ready Technology",
      description: "Built to adapt and evolve, ensuring your Bitcoin streaming applications remain cutting-edge in the rapidly changing crypto landscape."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Developer Friendly",
      subtitle: "Easy Integration",
      description: "Comprehensive APIs and tools make it simple to integrate Bitcoin streaming into any application or platform."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Streaming",
      subtitle: "Always Available",
      description: "Round-the-clock Bitcoin streaming with 99.9% uptime, ensuring your payments and streams never stop flowing."
    }
  ];

  const testimonials = [
    {
      quote: "SatoshiFlow revolutionizes how we handle Bitcoin payments in our DeFi protocols. The speed and reliability are unmatched.",
      author: "Alex Chen",
      role: "CTO at DeFi Labs",
      company: "DeFi Labs"
    },
    {
      quote: "The real-time streaming capabilities have transformed our micropayment infrastructure. It's exactly what Bitcoin needed.",
      author: "Sarah Martinez",
      role: "Lead Developer",
      company: "Crypto Payments Inc"
    },
    {
      quote: "We've seen 10x improvement in transaction throughput since integrating SatoshiFlow. The developer experience is exceptional.",
      author: "Michael Zhang",
      role: "Blockchain Architect",
      company: "BitStream Solutions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="relative z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Bitcoin className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
                SatoshiFlow
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/developers" className="text-gray-300 hover:text-white transition-colors">Developers</Link>
              <Link to="/ecosystem" className="text-gray-300 hover:text-white transition-colors">Ecosystem</Link>
              <Link to="/docs" className="text-gray-300 hover:text-white transition-colors">Documentation</Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition-colors"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -left-10 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-yellow-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-gradient-to-tl from-orange-400/20 to-red-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="block">Accelerating the Future</span>
              <span className="block bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 bg-clip-text text-transparent">
                The Fastest Bitcoin Streaming Platform
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Pushing the boundaries of Bitcoin technology through real-time streaming, 
              SatoshiFlow unlocks a brand new design space for instant payment applications.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link 
                to="/dashboard" 
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start Streaming</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/ecosystem" 
                className="px-8 py-4 border border-gray-600 hover:border-gray-500 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Explore Ecosystem</span>
                <Globe className="w-5 h-5" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stats.timeToFinality}</div>
                <div className="text-gray-400 uppercase tracking-wide text-sm">Time to Finality</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stats.transactionsPerSecond}</div>
                <div className="text-gray-400 uppercase tracking-wide text-sm">Transactions per Second</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stats.totalTransactions}</div>
                <div className="text-gray-400 uppercase tracking-wide text-sm">Total Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stats.activeUsers}</div>
                <div className="text-gray-400 uppercase tracking-wide text-sm">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Supported by elite developers and institutions, SatoshiFlow stands at the forefront of Bitcoin innovation.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8">
                <blockquote className="text-gray-300 mb-6 text-lg leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-gray-900 font-bold text-lg">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Redefining High-Speed Bitcoin Technology
            </h2>
            <div className="flex justify-center">
              <Link 
                to="/contact" 
                className="px-6 py-2 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
              >
                Get in touch
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-orange-500/50 group-hover:bg-gray-800/50">
                  <div className="text-orange-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <h4 className="text-orange-400 font-semibold mb-4">{feature.subtitle}</h4>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stream on the <span className="text-orange-500">fastest</span><br />
              Bitcoin platform in the industry.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-2xl flex items-center justify-center">
                    <Zap className="w-8 h-8 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Build with Speed</h3>
                    <p className="text-orange-400">Join the Speed Revolution</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Start Streaming on SatoshiFlow, the fastest Bitcoin streaming platform in the industry, 
                  and elevate your projects with unparalleled speed and efficiency.
                </p>
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition-colors"
                >
                  <span>Start Building</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-xl p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Highly Secure</h4>
                  <p className="text-gray-400 text-sm">Battle-tested security protocols</p>
                </div>
                <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-xl p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Massively Scalable</h4>
                  <p className="text-gray-400 text-sm">Unlimited growth potential</p>
                </div>
                <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-xl p-6 text-center">
                  <Layers className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Engineered to Evolve</h4>
                  <p className="text-gray-400 text-sm">Future-ready architecture</p>
                </div>
                <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-xl p-6 text-center">
                  <Server className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Developer Friendly</h4>
                  <p className="text-gray-400 text-sm">Easy integration APIs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bitcoin className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-bold">SatoshiFlow</span>
              </div>
              <p className="text-gray-400">
                The fastest Bitcoin streaming platform for the next generation of financial applications.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Developers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/api" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link to="/sdk" className="hover:text-white transition-colors">SDK</Link></li>
                <li><Link to="/github" className="hover:text-white transition-colors">GitHub</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Ecosystem</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/ecosystem" className="hover:text-white transition-colors">Ecosystem Hub</Link></li>
                <li><Link to="/grants" className="hover:text-white transition-colors">Grants</Link></li>
                <li><Link to="/partners" className="hover:text-white transition-colors">Partners</Link></li>
                <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/research" className="hover:text-white transition-colors">Research</Link></li>
                <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link to="/status" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SatoshiFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
