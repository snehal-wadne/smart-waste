import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { fetchCitizenRequestsByPhone } from '../api/client';
import CategoryIcon from '../components/CategoryIcon';
import { useToast } from '../context/ToastContext';
import {
  Phone,
  Search,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Inbox,
  CheckCircle2,
  Clock3,
  Truck,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

const STATUS_BADGES = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  ASSIGNED: {
    label: 'Assigned',
    className: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  COLLECTED: {
    label: 'Collected',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 border-red-300',
  },
};

export default function PickupHistoryPage({ onOpenRequestModal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const initialPhone = searchParams.get('phone') || '';

  const [phone, setPhone] = useState(initialPhone);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(Boolean(initialPhone));

  useEffect(() => {
    if (initialPhone) {
      handleSearch(initialPhone);
    }
  }, [initialPhone]);

  const handleSearch = async (phoneToSearch) => {
    const query = (phoneToSearch || phone).trim();
    if (!query || query.length < 5) {
      setError('Please enter a valid phone number (at least 5 digits).');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setHasSearched(true);
      const res = await fetchCitizenRequestsByPhone(query);
      setRequests(res.data);
      setSearchParams({ phone: query });
      if (res.data.length > 0) {
        showToast(`Found ${res.data.length} pickup request(s) for ${query}`, 'success');
      }
    } catch (err) {
      console.error('History fetch error:', err);
      setError("We couldn't load your requests. Please try again.");
      showToast("We couldn't load your requests. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-eco-light px-3.5 py-1.5 rounded-full text-xs font-bold text-eco-dark mb-4 border border-eco-primary/20">
          <Clock3 className="w-3.5 h-3.5 text-eco-primary" />
          <span>Citizen Service History</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-eco-dark tracking-tight">
          Your Pickup History
        </h1>
        <p className="text-sm sm:text-base text-eco-charcoal/70 mt-2">
          Enter your registered mobile number to review all previous and scheduled waste collection requests.
        </p>
      </div>

      {/* Phone Search Bar */}
      <div className="max-w-xl mx-auto mb-12">
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-eco-border shadow-eco hover:border-eco-primary/40 transition-all"
        >
          <div className="relative flex-1">
            <Phone className="w-5 h-5 text-eco-muted absolute left-3.5 top-3" />
            <input
              type="tel"
              placeholder="Enter Phone Number (e.g. 9876543210)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-eco-primary hover:bg-eco-dark text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-sm transition-all shrink-0 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>View History</span>
          </button>
        </form>

        {/* Quick Test Phone Numbers */}
        <div className="mt-4 p-3.5 bg-white rounded-2xl border border-eco-border/80 shadow-xs text-center">
          <p className="text-xs text-eco-muted font-medium mb-2">
            Instant Test Citizen Numbers (Click to load history):
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { phone: '9876543210', label: '9876543210 (Aarav • 3 Pickups)', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' },
              { phone: '9765432190', label: '9765432190 (Rajesh • 1 Pickup)', color: 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100' },
              { phone: '9812345678', label: '9812345678 (Neha • 1 Pickup)', color: 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100' },
              { phone: '9988776655', label: '9988776655 (Baner Route • 2 Pickups)', color: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' },
            ].map((sample) => (
              <button
                key={sample.phone}
                type="button"
                onClick={() => {
                  setPhone(sample.phone);
                  handleSearch(sample.phone);
                }}
                className={`text-xs px-2.5 py-1 rounded-xl border font-mono font-semibold transition-all shadow-xs ${sample.color}`}
              >
                {sample.label}
              </button>
            ))}
          </div>
          {localStorage.getItem('ecocollect_last_phone') && (
            <div className="mt-2.5 pt-2 border-t border-gray-100 text-xs text-eco-dark">
              <span>Your recently used phone: </span>
              <button
                type="button"
                onClick={() => {
                  const lastPh = localStorage.getItem('ecocollect_last_phone');
                  setPhone(lastPh);
                  handleSearch(lastPh);
                }}
                className="font-mono font-bold text-eco-primary underline ml-1"
              >
                {localStorage.getItem('ecocollect_last_phone')} (Load Mine)
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="bg-white rounded-3xl border border-eco-border p-12 text-center text-eco-muted shadow-sm animate-pulse">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-eco-primary" />
          <p className="text-sm font-semibold text-eco-dark">Loading collection requests...</p>
        </div>
      )}

      {/* RESULTS / EMPTY STATE */}
      {!loading && hasSearched && (
        <div>
          {requests.length === 0 ? (
            /* EXACT REQUIRED EMPTY STATE */
            <div className="bg-white rounded-3xl border border-eco-border p-12 text-center max-w-md mx-auto shadow-sm">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-eco-dark mb-1">No pickup requests yet.</h3>
              <p className="text-xs text-eco-charcoal/70 mb-6 leading-relaxed">
                Schedule your first collection and help keep your community clean.
              </p>
              <button
                onClick={() => onOpenRequestModal && onOpenRequestModal()}
                className="inline-flex items-center gap-2 bg-eco-primary hover:bg-eco-dark text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-eco transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Schedule your first collection</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-eco-dark">
                  Requests for {phone} ({requests.length})
                </h2>
                <Link
                  to="/track"
                  className="text-xs font-semibold text-eco-primary hover:underline flex items-center gap-1"
                >
                  <span>Track with Request Number</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((req) => {
                  const reqNum = req.requestNumber || req.trackingCode;
                  const statusConf = STATUS_BADGES[req.status] || STATUS_BADGES.PENDING;
                  const pickupLoc = req.city || req.pickupAddress || 'Pune';
                  const pickupDate = req.preferredDate || req.pickupDate || 'Scheduled';

                  return (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl border border-eco-border/80 p-6 flex flex-col justify-between hover:shadow-eco hover:border-eco-primary/40 transition-all duration-200"
                    >
                      <div>
                        {/* Category Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                              style={{
                                backgroundColor: `${req.wasteCategory?.color}18`,
                                color: req.wasteCategory?.color || '#16A34A',
                              }}
                            >
                              <CategoryIcon name={req.wasteCategory?.icon} className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs uppercase font-bold text-eco-muted block">
                                Waste Stream
                              </span>
                              <h3 className="text-sm font-bold text-eco-dark">
                                {req.wasteCategory?.name}
                              </h3>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusConf.className}`}
                          >
                            {statusConf.label}
                          </span>
                        </div>

                        {/* Request Number */}
                        <div className="bg-eco-bg rounded-xl p-3 border border-eco-border/60 mb-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-eco-muted block">
                            Request Number
                          </span>
                          <span className="text-base font-extrabold font-mono text-eco-dark">
                            {reqNum}
                          </span>
                        </div>

                        {/* Pickup Info details */}
                        <div className="space-y-2 text-xs mb-6">
                          <div className="flex items-start gap-2 text-eco-charcoal/80">
                            <Calendar className="w-4 h-4 text-eco-primary shrink-0 mt-0.5" />
                            <div>
                              <span className="text-eco-muted block text-[11px]">Pickup:</span>
                              <span className="font-semibold text-eco-dark">{pickupDate}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-eco-charcoal/80">
                            <MapPin className="w-4 h-4 text-eco-primary shrink-0 mt-0.5" />
                            <div>
                              <span className="text-eco-muted block text-[11px]">Location:</span>
                              <span className="font-semibold text-eco-dark truncate block max-w-[200px]">
                                {pickupLoc}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => navigate(`/track?code=${encodeURIComponent(reqNum)}`)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs border border-eco-primary text-eco-primary hover:bg-eco-primary hover:text-white transition-all shadow-sm group"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
