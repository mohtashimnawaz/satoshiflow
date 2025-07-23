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
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          {/* 3D Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating 3D Elements */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-orange-500/30 to-yellow-400/30 rounded-3xl blur-xl animate-bounce transform rotate-12 shadow-2xl"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-400/20 rounded-full blur-lg animate-pulse transform -rotate-12 shadow-xl"></div>
            <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-gradient-to-br from-green-400/25 to-blue-500/25 rounded-2xl blur-md animate-spin transform rotate-45 shadow-lg" style={{animationDuration: '8s'}}></div>
            
            {/* 3D Geometric Shapes */}
            <div className="absolute top-1/2 left-10 w-16 h-16 border-2 border-orange-500/30 rounded-lg transform rotate-45 animate-pulse"></div>
            <div className="absolute top-1/4 right-10 w-12 h-12 border border-yellow-400/40 rounded-full animate-spin" style={{animationDuration: '6s'}}></div>
            <div className="absolute bottom-1/3 right-1/3 w-8 h-8 bg-orange-500/20 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
            
            {/* Large Background Blurs */}
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-yellow-400/20 rounded-full blur-3xl transform rotate-12 animate-pulse"></div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-tl from-orange-400/20 to-red-500/20 rounded-full blur-3xl transform -rotate-12 animate-pulse" style={{animationDelay: '1s'}}></div>
            
            {/* 3D Bitcoin Symbols */}
            <div className="absolute top-20 right-1/4 text-6xl text-orange-500/10 transform rotate-12 animate-float">₿</div>
            <div className="absolute bottom-20 left-1/4 text-4xl text-yellow-400/10 transform -rotate-12 animate-float" style={{animationDelay: '3s'}}>₿</div>
          </div>

          <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 transform hover:scale-105 transition-transform duration-500">
              <span className="block animate-fade-in-up">Accelerating the Future</span>
              <span className="block bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 bg-clip-text text-transparent animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                The Fastest Bitcoin Streaming Platform
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              Pushing the boundaries of Bitcoin technology through real-time streaming, 
              SatoshiFlow unlocks a brand new design space for instant payment applications.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <Link 
                to="/dashboard" 
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 flex items-center justify-center space-x-2 group"
              >
                <span>Start Streaming</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/ecosystem" 
                className="px-8 py-4 border border-gray-600 hover:border-gray-500 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 hover:bg-gray-800/50 hover:shadow-xl flex items-center justify-center space-x-2 group"
              >
                <span>Explore Ecosystem</span>
                <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>

            {/* 3D Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <div className="text-center group">
                <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 transform hover:scale-110 hover:rotate-2 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20">
                  <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2 group-hover:scale-110 transition-transform">{stats.timeToFinality}</div>
                  <div className="text-gray-400 uppercase tracking-wide text-sm">Time to Finality</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 transform hover:scale-110 hover:-rotate-2 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20">
                  <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2 group-hover:scale-110 transition-transform">{stats.transactionsPerSecond}</div>
                  <div className="text-gray-400 uppercase tracking-wide text-sm">Transactions per Second</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 transform hover:scale-110 hover:rotate-2 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20">
                  <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2 group-hover:scale-110 transition-transform">{stats.totalTransactions}</div>
                  <div className="text-gray-400 uppercase tracking-wide text-sm">Total Transactions</div>
                </div>
              </div>
              <div className="text-center group">
                <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 transform hover:scale-110 hover:-rotate-2 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20">
                  <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2 group-hover:scale-110 transition-transform">{stats.activeUsers}</div>
                  <div className="text-gray-400 uppercase tracking-wide text-sm">Active Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50 relative overflow-hidden">
        {/* 3D Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-yellow-400/10 rounded-3xl blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-gray-700/20 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 transform hover:scale-105 transition-transform duration-300">
              Supported by elite developers and institutions, SatoshiFlow stands at the forefront of Bitcoin innovation.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group transform hover:scale-105 hover:-translate-y-2 transition-all duration-500" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 h-full group-hover:border-orange-500/50 group-hover:shadow-2xl group-hover:shadow-orange-500/10 transition-all duration-300">
                  <blockquote className="text-gray-300 mb-6 text-lg leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* 3D Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent transform skew-y-12"></div>
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-orange-500/20 to-transparent"></div>
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-orange-500/20 to-transparent"></div>
          <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
          <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 transform hover:scale-105 transition-transform duration-300">
              Redefining High-Speed Bitcoin Technology
            </h2>
            <div className="flex justify-center">
              <Link 
                to="/contact" 
                className="px-6 py-2 border border-gray-600 rounded-lg hover:border-gray-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Get in touch
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group transform hover:scale-105 hover:-translate-y-4 transition-all duration-500" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-orange-500/50 group-hover:bg-gray-800/50 group-hover:shadow-2xl group-hover:shadow-orange-500/10 relative overflow-hidden">
                  {/* 3D Card Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="text-orange-500 mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 transform-gpu">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-orange-300 transition-colors duration-300">{feature.title}</h3>
                    <h4 className="text-orange-400 font-semibold mb-4 group-hover:text-orange-300 transition-colors duration-300">{feature.subtitle}</h4>
                    <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* 3D Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 right-10 text-8xl text-orange-500/5 transform rotate-12 animate-pulse">⚡</div>
          <div className="absolute bottom-10 left-10 text-6xl text-yellow-400/5 transform -rotate-12 animate-pulse" style={{animationDelay: '1s'}}>🚀</div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 transform hover:scale-105 transition-transform duration-300">
              Stream on the <span className="text-orange-500 animate-pulse">fastest</span><br />
              Bitcoin platform in the industry.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="transform hover:scale-105 transition-all duration-500">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 relative overflow-hidden group hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
                {/* 3D Card Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                      <Zap className="w-8 h-8 text-gray-900" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold group-hover:text-orange-300 transition-colors duration-300">Build with Speed</h3>
                      <p className="text-orange-400 group-hover:text-orange-300 transition-colors duration-300">Join the Speed Revolution</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    Start Streaming on SatoshiFlow, the fastest Bitcoin streaming platform in the industry, 
                    and elevate your projects with unparalleled speed and efficiency.
                  </p>
                  <Link 
                    to="/dashboard" 
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25 group"
                  >
                    <span>Start Building</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-xl p-6 text-center transform hover:scale-105 hover:-rotate-2 transition-all duration-300 hover:border-green-500/50 group">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold mb-2 group-hover:text-green-300 transition-colors">Highly Secure</h4>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Battle-tested security protocols</p>
                </div>
                <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-xl p-6 text-center transform hover:scale-105 hover:rotate-2 transition-all duration-300 hover:border-blue-500/50 group">
                  <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold mb-2 group-hover:text-blue-300 transition-colors">Massively Scalable</h4>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Unlimited growth potential</p>
                </div>
                <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-xl p-6 text-center transform hover:scale-105 hover:-rotate-2 transition-all duration-300 hover:border-purple-500/50 group">
                  <Layers className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold mb-2 group-hover:text-purple-300 transition-colors">Engineered to Evolve</h4>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Future-ready architecture</p>
                </div>
                <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700 rounded-xl p-6 text-center transform hover:scale-105 hover:rotate-2 transition-all duration-300 hover:border-orange-500/50 group">
                  <Server className="w-8 h-8 text-orange-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold mb-2 group-hover:text-orange-300 transition-colors">Developer Friendly</h4>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">Easy integration APIs</p>
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
