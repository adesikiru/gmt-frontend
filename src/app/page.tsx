'use client';

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { isLoggedIn, logout } = useAuth();
  const mediaItems = [
    {
      tag: 'Press Release',
      title: 'GMT Ogun State Digital Grassroots Portal Officially Unveiled',
      date: 'October 2026',
      readTime: '3 min read',
      summary: 'Grassroots Movement for Tinubu activates full digital membership registration across all 20 LGAs and 236 Wards in Ogun State.',
      categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      tag: 'Community News',
      title: 'Youth & Women Empowerment Tour Concludes in Abeokuta',
      date: 'November 2026',
      readTime: '4 min read',
      summary: 'Over 1,200 micro-entrepreneurs received digital tools, vocational equipment, and business startup grants under the GMT umbrella.',
      categoryColor: 'bg-green-50 text-green-700 border-green-200',
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      tag: 'Voter Education',
      title: 'Ward-by-Ward Voter Sensitization & Verification Drive',
      date: 'December 2026',
      readTime: '2 min read',
      summary: 'Ensuring all citizens confirm their 20-digit Voter Identification Numbers (VIN) and polling units ahead of upcoming elections.',
      categoryColor: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const events = [
    {
      title: 'Ogun State GMT Annual Leadership Congress',
      date: 'Saturday, Nov 15, 2026',
      time: '10:00 AM WAT',
      venue: 'June 12 Cultural Centre, Kuto, Abeokuta',
      badge: 'State Summit',
      desc: 'Bringing together ward coordinators, LGA directors, and state executives to align strategic community goals.',
    },
    {
      title: 'Ward Coordinators Training & Digital Onboarding',
      date: 'Wednesday, Nov 25, 2026',
      time: '11:00 AM WAT',
      venue: 'Ijebu-Ode Town Hall, Ijebu-Ode',
      badge: 'Training Workshop',
      desc: 'Hands-on training session for ward administrators on managing member verifications and voter record tracking.',
    },
    {
      title: 'Grassroots Farmers & SME Cooperative Symposium',
      date: 'Thursday, Dec 10, 2026',
      time: '09:30 AM WAT',
      venue: 'Sango-Ota Community Centre, Ota',
      badge: 'Empowerment',
      desc: 'Distribution of farm inputs and cooperative seed capital to rural ward farmers and market associations.',
    },
  ];

  const empowerments = [
    {
      title: 'Youth Tech & Digital Skills Initiative',
      desc: 'Providing subsidized laptops, coding training, and internet stipends for 2,000 youth across Ogun State wards.',
      icon: '💻',
      stat: '2,000+ Youths Targeted',
    },
    {
      title: 'Market Women & SME Support Grants',
      desc: 'Direct micro-grants and point-of-sale equipment provided to trade cooperatives to expand local businesses.',
      icon: '🏪',
      stat: '₦50M Micro-Fund',
    },
    {
      title: 'Grassroots Agri-Seedling Distribution',
      desc: 'High-yield hybrid seeds, eco-friendly fertilizers, and farming implements distributed to rural farmer clusters.',
      icon: '🌾',
      stat: '20 LGAs Covered',
    },
    {
      title: 'Community Healthcare & Wellness Outreach',
      desc: 'Free hypertension screening, blood sugar checks, and distribution of prescription eyeglasses at ward centres.',
      icon: '🩺',
      stat: '10,000 Beneficiaries',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-green-100 selection:text-green-800">
      {/* Top Notice Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
        🇳🇬 Grassroots Movement for Tinubu (GMT) — Pilot Phase Active in Ogun State across 20 LGAs & 236 Wards
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-green-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <BrandLogo size="md" showSubtitle={true} href="/" />

            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600">
              <Link href="#about" className="hover:text-emerald-600 transition-colors">About Us</Link>
              <Link href="#events" className="hover:text-emerald-600 transition-colors">Events</Link>
              <Link href="#empowerments" className="hover:text-emerald-600 transition-colors">Empowerment</Link>
              <Link href="#media" className="hover:text-emerald-600 transition-colors">Media & News</Link>
            </div>

            <div className="flex items-center space-x-3">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-emerald-700 hover:text-emerald-800 px-4 py-2 text-sm font-semibold transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-emerald-200 shadow-emerald-100 hover:-translate-y-0.5"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-emerald-700 hover:text-emerald-800 px-4 py-2 text-sm font-semibold transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-emerald-200 shadow-emerald-100 hover:-translate-y-0.5"
                  >
                    Join Movement
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-36 bg-gradient-to-b from-emerald-50/60 via-white to-white">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-200 blur-3xl"></div>
          <div className="absolute top-60 -left-20 w-80 h-80 rounded-full bg-green-100 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Uniting Grassroots Citizens from Ward to National Level</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-900 leading-[1.1] mb-8">
            Empowering Every Ward.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
              Transforming Nigeria.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            The Grassroots Movement for Tinubu (GMT) connects voters, community leaders, and visionaries. 
            Starting from Ogun State, we build an organized, audited, and progressive movement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5 text-center"
            >
              Register as a Member
            </Link>
            <Link
              href="#about"
              className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-bold text-base hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm text-center"
            >
              Explore Our Mission
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 pt-12 border-t border-emerald-100/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">20</div>
              <div className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Ogun State LGAs</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">236</div>
              <div className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Electoral Wards</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">5,000+</div>
              <div className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Polling Units</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700">100%</div>
              <div className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Grassroots Driven</div>
            </div>
          </div>
        </div>
      </section>

      {/* About & Structure Section */}
      <section id="about" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Our Organizational Blueprint
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-4">
              Structured for Authentic Representation
            </h2>
            <p className="text-gray-600">
              GMT operates on a decentralized hierarchical model, guaranteeing every verified Nigerian citizen has a direct voice in national governance and community development.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-emerald-50/40 p-8 rounded-2xl border border-emerald-100/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-6 shadow-sm">
                01
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ward & Polling Unit Focus</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Empowerment begins where real citizens reside. Every member is verified with their respective polling unit and voter identification for maximum authenticity.
              </p>
            </div>

            <div className="bg-emerald-50/40 p-8 rounded-2xl border border-emerald-100/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-6 shadow-sm">
                02
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Auditable & Transparent</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Role-based administrative controls (RBAC) and immutable audit logging ensure that leadership appointments and community decisions remain accountable.
              </p>
            </div>

            <div className="bg-emerald-50/40 p-8 rounded-2xl border border-emerald-100/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-6 shadow-sm">
                03
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Renewed Hope in Action</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Direct economic initiatives, vocational sponsorships, and agricultural grants delivered straight into the hands of local youths, women, and families.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="events" className="py-24 bg-emerald-50/30 border-t border-b border-emerald-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100">
                Community Calendar
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4">
                Upcoming GMT Events
              </h2>
            </div>
            <Link
              href="/register"
              className="mt-4 md:mt-0 text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
            >
              <span>Register to attend any event</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {events.map((evt, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-emerald-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                      {evt.badge}
                    </span>
                    <span className="text-xs font-medium text-gray-400">{evt.time}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                    {evt.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {evt.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs font-semibold text-emerald-700 mb-1">{evt.date}</div>
                  <div className="text-xs text-gray-500 mb-4">{evt.venue}</div>
                  <Link
                    href="/register"
                    className="block text-center bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-semibold text-sm py-2.5 rounded-xl transition-colors"
                  >
                    RSVP / Join In
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Empowerment Programs Section */}
      <section id="empowerments" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Grassroots Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-4">
              GMT Empowerment Schemes
            </h2>
            <p className="text-gray-600">
              We empower grassroots communities by investing directly in our members through skills, funding, tools, and social intervention.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {empowerments.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-b from-white to-emerald-50/40 p-6 rounded-2xl border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-emerald-100/80">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                    {item.stat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GMT Media & News Section */}
      <section id="media" className="py-24 bg-emerald-50/20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100">
              Newsroom & Insights
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-4">
              GMT Media & Press Releases
            </h2>
            <p className="text-gray-600">
              Stay informed with official announcements, field updates, and multimedia highlights from our grassroots activities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {mediaItems.map((item, idx) => (
              <article
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="p-7">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${item.categoryColor}`}>
                      {item.tag}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{item.date}</span>
                  </div>
                  <div className="mb-4 p-3 bg-emerald-50 rounded-xl inline-block">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-emerald-600 transition-colors cursor-pointer">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>
                <div className="px-7 py-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">{item.readTime}</span>
                  <Link href="/register" className="text-emerald-700 font-bold hover:underline">
                    Read Story &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl font-black mb-6">
            Become a Registered GMT Voice Today
          </h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
            Take part in shaping policies, receiving grassroots empowerment, and securing democratic engagement across Ogun State and Nigeria.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-white text-emerald-800 font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Sign Up Now (Free)
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-emerald-800/60 border border-emerald-400 text-white font-bold px-8 py-4 rounded-xl hover:bg-emerald-800 transition-colors"
            >
              Already Registered? Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="mb-4">
                <BrandLogo size="md" variant="light" showSubtitle={true} href="/" />
              </div>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                A unified, technologically-driven platform mobilizing Nigerian citizens at the polling unit, ward, local government, and national tiers.
              </p>
            </div>

            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#about" className="hover:text-emerald-400 transition-colors">About Movement</Link></li>
                <li><Link href="#events" className="hover:text-emerald-400 transition-colors">Events & Congress</Link></li>
                <li><Link href="#empowerments" className="hover:text-emerald-400 transition-colors">Empowerment Funds</Link></li>
                <li><Link href="#media" className="hover:text-emerald-400 transition-colors">Press & Media</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="hover:text-emerald-400 transition-colors">Join as Member</Link></li>
                <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Member Sign In</Link></li>
                <li><Link href="/admin" className="hover:text-emerald-400 transition-colors">Admin Portal</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
            <p>&copy; 2026 Grassroots Movement for Tinubu (GMT). All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-gray-300">Privacy Policy</a>
              <a href="#" className="hover:text-gray-300">Terms of Service</a>
              <a href="#" className="hover:text-gray-300">Ogun State Chapter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
