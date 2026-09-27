import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import { fetchWasteCategories, fetchHealth } from '../api/client';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Recycle,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  BarChart2,
  RotateCw,
  Trash2,
  Layers,
} from 'lucide-react';

export default function LandingPage({ onRequestPickup }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cats, health] = await Promise.allSettled([
          fetchWasteCategories(),
          fetchHealth(),
        ]);

        if (cats.status === 'fulfilled') {
          setCategories(cats.value);
        } else {
          throw new Error('Failed to load waste categories from server.');
        }

        if (health.status === 'fulfilled') {
          setHealthStatus(health.value);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError("We couldn't load your requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top Civic Health Banner */}
      {healthStatus && (
        <div className="bg-eco-light/60 border-b border-eco-primary/20 py-1.5 px-4 text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-semibold text-eco-dark">
            <span className="w-2 h-2 rounded-full bg-eco-primary animate-ping inline-block"></span>
            <span>Civic Waste Network Active</span>
            <span className="text-eco-muted">•</span>
            <span>Service Status: {healthStatus.status.toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-24">
        {/* Environmental graphic blur accents */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-eco-light/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Pill tag */}
            <div className="inline-flex items-center gap-2 bg-eco-light px-3.5 py-1.5 rounded-full text-xs font-bold text-eco-dark mb-6 border border-eco-primary/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-eco-primary" />
              <span>FIT FEST 2026 — Waste Management Platform</span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-eco-dark tracking-tight leading-[1.15] mb-6">
              Smarter Waste Collection.{' '}
              <span className="text-eco-primary block sm:inline">Cleaner Communities.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-eco-charcoal/80 mb-10 leading-relaxed font-normal">
              Request the right collection service, schedule a pickup, and track it from one place.
              Connecting citizens with verified municipal collection workflows.
            </p>

            {/* Call To Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onRequestPickup()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-eco-primary hover:bg-eco-dark text-white text-base font-semibold px-8 py-3.5 rounded-2xl shadow-eco hover:shadow-eco-lg transition-all transform active:scale-95"
              >
                <Calendar className="w-5 h-5" />
                <span>Request a Pickup</span>
              </button>
              <button
                onClick={() => scrollToSection('problem-section')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-eco-bg text-eco-dark text-base font-semibold px-8 py-3.5 rounded-2xl border border-eco-border shadow-sm transition-all"
              >
                <HelpCircle className="w-5 h-5 text-eco-primary" />
                <span>How It Works</span>
              </button>
            </div>

            {/* Trust points */}
            <div className="mt-12 pt-8 border-t border-eco-border/80 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-eco-dark">7 Streams</div>
                <div className="text-xs text-eco-muted font-medium mt-0.5">Segregated Guidance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-eco-primary">100%</div>
                <div className="text-xs text-eco-muted font-medium mt-0.5">Transparent Tracking</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-eco-dark">Zero</div>
                <div className="text-xs text-eco-muted font-medium mt-0.5">Illegal Dumping</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION: "Where does this waste go?" + CATEGORY CARDS */}
      <section id="problem-section" className="py-20 bg-white border-t border-eco-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-eco-primary">
                Civic Disposal Guidance
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-eco-dark mt-2 tracking-tight">
                Where does this waste go?
              </h2>
              <p className="text-sm sm:text-base text-eco-charcoal/70 mt-2 max-w-2xl">
                Different materials demand different collection handling. Select a category below to
                understand segregation rules and book certified municipal pickup.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-eco-bg border border-eco-border text-eco-dark">
                <ShieldCheck className="w-4 h-4 text-eco-primary" />
                Live Database Synchronized
              </span>
            </div>
          </div>

          {/* Error notification */}
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-sm font-semibold">{error}</div>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-eco-muted mb-6">Loading collection requests...</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-eco-border p-6 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
                    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-4/5 mb-6" />
                    <div className="h-14 bg-gray-50 rounded-xl mb-4" />
                    <div className="h-10 bg-gray-200 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Category Cards from DB */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onRequestPickup={onRequestPickup}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. "HOW IT WORKS" SECTION: Select Waste, Schedule Pickup, Track Collection */}
      <section id="how-it-works" className="py-20 bg-eco-bg border-y border-eco-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-eco-primary">
              Streamlined Service
            </span>
            <h2 className="text-3xl font-extrabold text-eco-dark mt-2">How It Works</h2>
            <p className="text-sm text-eco-charcoal/70 mt-2">
              From doorstep segregation to certified municipal processing in three seamless steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1: Select Waste */}
            <div className="bg-white p-7 rounded-3xl border border-eco-border/80 shadow-sm relative group hover:border-eco-primary/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-eco-light flex items-center justify-center text-eco-dark font-extrabold text-lg mb-5 shadow-eco-sm">
                1
              </div>
              <h3 className="text-xl font-bold text-eco-dark mb-2">Select Waste</h3>
              <p className="text-sm text-eco-charcoal/70 leading-relaxed">
                Choose from 7 segregated waste streams and review instant preparation and packaging guidelines.
              </p>
            </div>

            {/* Step 2: Schedule Pickup */}
            <div className="bg-white p-7 rounded-3xl border border-eco-border/80 shadow-sm relative group hover:border-eco-primary/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-eco-light flex items-center justify-center text-eco-dark font-extrabold text-lg mb-5 shadow-eco-sm">
                2
              </div>
              <h3 className="text-xl font-bold text-eco-dark mb-2">Schedule Pickup</h3>
              <p className="text-sm text-eco-charcoal/70 leading-relaxed">
                Enter your street location and select a convenient morning, afternoon, or evening pickup slot.
              </p>
            </div>

            {/* Step 3: Track Collection */}
            <div className="bg-white p-7 rounded-3xl border border-eco-border/80 shadow-sm relative group hover:border-eco-primary/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-eco-light flex items-center justify-center text-eco-dark font-extrabold text-lg mb-5 shadow-eco-sm">
                3
              </div>
              <h3 className="text-xl font-bold text-eco-dark mb-2">Track Collection</h3>
              <p className="text-sm text-eco-charcoal/70 leading-relaxed">
                Receive your unique Request Number (<span className="font-mono font-semibold text-eco-dark">WC-2026-XXXX</span>) to follow real-time truck dispatch and collection completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "BUILT FOR CLEANER COMMUNITIES" SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-eco-primary">
              Core Principles
            </span>
            <h2 className="text-3xl font-extrabold text-eco-dark mt-2">
              Built for Cleaner Communities
            </h2>
            <p className="text-sm text-eco-charcoal/70 mt-2">
              A comprehensive civic framework engineered to eliminate illegal dumping and maximize circular resource recovery.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Responsible Disposal */}
            <div className="p-6 rounded-3xl bg-eco-bg border border-eco-border/80 text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mb-4">
                ♻️
              </div>
              <h4 className="text-base font-bold text-eco-dark mb-1.5">Responsible Disposal</h4>
              <p className="text-xs text-eco-charcoal/70 leading-relaxed">
                Material-specific preparation checklists protect collection workers and ensure maximum recyclability.
              </p>
            </div>

            {/* Pillar 2: Easy Pickup Scheduling */}
            <div className="p-6 rounded-3xl bg-eco-bg border border-eco-border/80 text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl mb-4">
                📍
              </div>
              <h4 className="text-base font-bold text-eco-dark mb-1.5">Easy Pickup Scheduling</h4>
              <p className="text-xs text-eco-charcoal/70 leading-relaxed">
                Book home or business pickups in under 60 seconds with customizable time slots and location notes.
              </p>
            </div>

            {/* Pillar 3: Transparent Tracking */}
            <div className="p-6 rounded-3xl bg-eco-bg border border-eco-border/80 text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl mb-4">
                🔄
              </div>
              <h4 className="text-base font-bold text-eco-dark mb-1.5">Transparent Tracking</h4>
              <p className="text-xs text-eco-charcoal/70 leading-relaxed">
                Live lifecycle stepper gives citizens total visibility from municipal intake to facility weigh-in.
              </p>
            </div>

            {/* Pillar 4: Organized Collection */}
            <div className="p-6 rounded-3xl bg-eco-bg border border-eco-border/80 text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl mb-4">
                📊
              </div>
              <h4 className="text-base font-bold text-eco-dark mb-1.5">Organized Collection</h4>
              <p className="text-xs text-eco-charcoal/70 leading-relaxed">
                Centralized dispatch console equips municipal operators with route prioritization and analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5 MUNICIPAL OPERATIONS & FLEET DISPATCH SHOWCASE */}
      <section className="py-16 bg-white border-y border-eco-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-eco-charcoal rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl text-left">
                <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 border border-purple-400/30">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Administrative & Fleet Dispatch Portal</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                  How Municipalities Manage & Track City Pickups
                </h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
                  Every citizen pickup request flows directly into the centralized Municipal Command Console. Fleet controllers verify materials, allocate specialized trucks (<span className="text-emerald-400 font-mono">EcoTruck #01</span>, <span className="text-purple-300 font-mono">EcoVan #03</span>), attach dispatch notes, and monitor real-time diversion analytics.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-300 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Real-time Dispatching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Vehicle & Crew Allocation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Live Diversion Analytics</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition-all transform active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Access Admin Portal (Demo)</span>
                    <span className="bg-purple-800 text-purple-200 text-[10px] px-2 py-0.5 rounded uppercase font-extrabold">
                      Staff
                    </span>
                  </Link>
                  <Link
                    to="/track?code=WC-2026-0001"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-4 py-3 rounded-xl border border-white/20 transition-colors"
                  >
                    <span>Inspect Sample Live Dispatch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual console preview card */}
              <div className="w-full lg:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-left shadow-2xl shrink-0">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 text-xs">
                  <span className="font-bold text-purple-300 uppercase tracking-wider">Live Route Queue</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">Active</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between font-mono font-bold text-white text-[11px]">
                      <span>WC-2026-0027</span>
                      <span className="text-amber-400 text-[10px]">PENDING</span>
                    </div>
                    <span className="text-[11px] text-gray-300 block mt-0.5">Recyclable • Baner Sector</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between font-mono font-bold text-white text-[11px]">
                      <span>WC-2026-0012</span>
                      <span className="text-purple-300 text-[10px]">EcoTruck #05</span>
                    </div>
                    <span className="text-[11px] text-gray-300 block mt-0.5">Paper & Cardboard • Lotus Blvd</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between font-mono font-bold text-white text-[11px]">
                      <span>WC-2026-0001</span>
                      <span className="text-emerald-400 text-[10px]">COLLECTED</span>
                    </div>
                    <span className="text-[11px] text-gray-300 block mt-0.5">Organic (12.5 kg composted)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION (CTA) */}
      <section className="py-16 bg-gradient-to-br from-eco-dark via-[#14532d] to-[#0f4021] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-eco-light mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-eco-light" />
            <span>Join 10,000+ Responsible Households</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to Dispose Responsibly?
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            Schedule a certified municipal collection in your neighborhood today. Segregate your materials, select your pickup window, and track the truck in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onRequestPickup()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-eco-primary hover:bg-emerald-500 text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-xl transition-all transform active:scale-95"
            >
              <Calendar className="w-5 h-5" />
              <span>Schedule a Pickup</span>
            </button>
            <Link
              to="/track"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-3.5 rounded-2xl border border-white/20 transition-all backdrop-blur-sm"
            >
              <Truck className="w-5 h-5 text-eco-light" />
              <span>Track Existing Pickup</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-eco-charcoal text-white/80 py-14 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1 */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-eco-primary flex items-center justify-center text-white">
                  <Recycle className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">EcoCollect</span>
              </div>
              <p className="text-xs text-white/70 max-w-md leading-relaxed mb-4">
                Empowering cleaner communities through transparent, scheduled civic waste management, certified material diversion, and real-time municipal fleet tracking.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-eco-light">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>FIT FEST 2026 Solo Hackathon MVP</span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Citizen Services</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => onRequestPickup()} className="hover:text-eco-primary transition-colors">Schedule a Pickup</button></li>
                <li><Link to="/track" className="hover:text-eco-primary transition-colors">Track Request Status</Link></li>
                <li><Link to="/history" className="hover:text-eco-primary transition-colors">Pickup History Lookup</Link></li>
                <li><a href="#problem-section" className="hover:text-eco-primary transition-colors">Disposal Guidelines</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">Municipal Operations</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/admin" className="text-purple-300 hover:text-white font-semibold flex items-center gap-1.5 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>Admin Portal (Demo)</span>
                  </Link>
                </li>
                <li><a href="http://localhost:5001/api/health" target="_blank" rel="noreferrer" className="hover:text-eco-primary transition-colors">System Health Ping</a></li>
                <li><span className="text-white/40">Pune Municipal Pilot v1.0</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
            <div>&copy; 2026 EcoCollect Platform. Built for FIT FEST 2026.</div>
            <div className="flex items-center gap-4">
              <span>PostgreSQL 18</span>
              <span>•</span>
              <span>Express API</span>
              <span>•</span>
              <span>React 18 + Vite</span>
              <span>•</span>
              <span>Cloud Run Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
