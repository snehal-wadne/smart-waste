import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchRequestByTrackingCode } from '../api/client';
import CategoryIcon from '../components/CategoryIcon';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Truck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock3,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileText,
  Weight,
  Sparkles,
  ChevronRight,
  XCircle,
  Check,
  Circle,
  HelpCircle,
  Inbox,
  PlusCircle,
} from 'lucide-react';

const STATUS_RANK = {
  PENDING: 1,
  CONFIRMED: 2,
  ASSIGNED: 3,
  COLLECTED: 4,
  CANCELLED: -1,
};

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

const STAGES = [
  { key: 'PENDING', label: 'Request Submitted', rank: 1 },
  { key: 'CONFIRMED', label: 'Confirmed', rank: 2 },
  { key: 'ASSIGNED', label: 'Pickup Assigned', rank: 3 },
  { key: 'COLLECTED', label: 'Collected', rank: 4 },
];

export default function TrackRequestPage({ onOpenRequestModal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCode = searchParams.get('code') || searchParams.get('requestNumber') || '';
  const { showToast } = useToast();

  const lastSearchedRef = useRef('');
  const lastCreatedCode = localStorage.getItem('ecocollect_last_request') || '';

  const [inputCode, setInputCode] = useState(urlCode || lastCreatedCode || '');
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(Boolean(urlCode));

  const executeSearch = async (codeToSearch) => {
    const raw = (codeToSearch !== undefined ? codeToSearch : inputCode) || '';
    const query = String(raw).trim();
    if (!query) {
      setError('Please enter a Request Number (e.g. WC-2026-0001) or 10-digit phone number.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setHasSearched(true);
      lastSearchedRef.current = query.toUpperCase();

      const res = await fetchRequestByTrackingCode(query);
      setRequest(res.data);

      const resolvedNumber = res.data?.requestNumber || query;
      setInputCode(resolvedNumber);

      if (searchParams.get('code') !== resolvedNumber) {
        setSearchParams({ code: resolvedNumber }, { replace: true });
      }

      showToast(`Loaded collection request ${resolvedNumber}`, 'success');
    } catch (err) {
      console.error('Tracking search error:', err);
      const serverMsg = err.response?.data?.message;
      setError(serverMsg || "We couldn't load your requests. Please try again.");
      showToast(serverMsg || "We couldn't load your requests. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlCode && urlCode.toUpperCase() !== lastSearchedRef.current) {
      executeSearch(urlCode);
    }
  }, [urlCode]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const currentStatus = request?.status || 'PENDING';
  const currentRank = STATUS_RANK[currentStatus] || 1;
  const isCancelled = currentStatus === 'CANCELLED';

  const getStageTimestamp = (stageKey) => {
    if (!request || !request.statusHistory) return null;
    const historyItem = request.statusHistory.find((h) => h.newStatus === stageKey);
    if (historyItem) {
      const d = new Date(historyItem.changedAt);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (stageKey === 'PENDING' && request.createdAt) {
      const d = new Date(request.createdAt);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return null;
  };

  const reqNumber = request?.requestNumber || request?.trackingCode;
  const pickupLoc = request?.pickupAddress
    ? `${request.pickupAddress}, ${request.city || 'Pune'}`
    : request?.city || 'Pune';
  const scheduledDate = request?.preferredDate || request?.pickupDate || 'Scheduled';
  const scheduledTime = request?.preferredTime || request?.pickupTimeSlot || 'Standard window';
  const statusBadge = STATUS_BADGES[currentStatus] || STATUS_BADGES.PENDING;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-eco-light px-3.5 py-1.5 rounded-full text-xs font-bold text-eco-dark mb-4 border border-eco-primary/20">
          <Truck className="w-3.5 h-3.5 text-eco-primary" />
          <span>Real-time Civic Collection Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-eco-dark tracking-tight">
          Track Collection Request
        </h1>
        <p className="text-sm sm:text-base text-eco-charcoal/70 mt-2">
          Enter your Request Number to verify real-time dispatch progress, collection vehicle, and arrival window.
        </p>
      </div>

      {/* Request Number Search Bar */}
      <div className="max-w-xl mx-auto mb-10">
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-eco-border shadow-eco hover:border-eco-primary/40 transition-all"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-eco-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter Request Number (e.g. WC-2026-0001)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm font-mono uppercase focus:outline-none placeholder:font-sans placeholder:normal-case"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-eco-primary hover:bg-eco-dark text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-sm transition-all shrink-0 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Track</span>
          </button>
        </form>

        {/* Quick Test Codes */}
        <div className="mt-4 p-3.5 bg-white rounded-2xl border border-eco-border/80 shadow-xs text-center">
          <p className="text-xs text-eco-muted font-medium mb-2">
            Instant Test Codes (Click any to track):
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              {
                code: 'WC-2026-0001',
                label: 'WC-2026-0001 (Collected)',
                color: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
              },
              {
                code: 'WC-2026-0012',
                label: 'WC-2026-0012 (Assigned)',
                color: 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100',
              },
              {
                code: 'WC-2026-0018',
                label: 'WC-2026-0018 (Confirmed)',
                color: 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100',
              },
              {
                code: 'WC-2026-0027',
                label: 'WC-2026-0027 (Pending)',
                color: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100',
              },
            ].map((sample) => (
              <button
                key={sample.code}
                type="button"
                onClick={() => {
                  setInputCode(sample.code);
                  executeSearch(sample.code);
                }}
                className={`text-xs px-2.5 py-1 rounded-xl border font-mono font-semibold transition-all shadow-xs ${sample.color}`}
              >
                {sample.label}
              </button>
            ))}
          </div>
          {lastCreatedCode && (
            <div className="mt-2.5 pt-2 border-t border-gray-100 text-xs text-eco-dark">
              <span>Your recently scheduled request: </span>
              <button
                type="button"
                onClick={() => {
                  setInputCode(lastCreatedCode);
                  executeSearch(lastCreatedCode);
                }}
                className="font-mono font-bold text-eco-primary underline ml-1"
              >
                {lastCreatedCode} (Track Now)
              </button>
            </div>
          )}
        </div>

        {/* Quick link to history */}
        <div className="text-center mt-3">
          <Link
            to="/history"
            className="text-xs text-eco-primary hover:underline font-semibold inline-flex items-center gap-1"
          >
            <span>Don't have your Request Number? Lookup by phone number</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Error State */}
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

      {/* EMPTY STATE */}
      {!loading && !request && hasSearched && !error && (
        <div className="bg-white rounded-3xl border border-eco-border p-12 text-center max-w-md mx-auto shadow-sm">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-eco-dark mb-1">No pickup requests yet.</h3>
          <p className="text-xs text-eco-charcoal/70 mb-6">
            Schedule your first collection and help keep your community clean.
          </p>
          <button
            onClick={() => onOpenRequestModal && onOpenRequestModal()}
            className="inline-flex items-center gap-2 bg-eco-primary hover:bg-eco-dark text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-eco transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule a Pickup</span>
          </button>
        </div>
      )}

      {/* TRACKED REQUEST DETAILS & STATUS TIMELINE */}
      {!loading && request && (
        <div className="bg-white rounded-3xl border border-eco-border shadow-eco-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-eco-dark to-[#0f4021] text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-eco-light tracking-wider block mb-1">
                  Collection Request
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-wide">
                  {reqNumber}
                </h2>
                <p className="text-xs text-white/70 mt-1">
                  Citizen: <strong className="text-white">{request.userName}</strong> • Phone: {request.userPhone}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${statusBadge.className}`}
                >
                  {statusBadge.label}
                </span>
                <button
                  onClick={() => handleSearch(reqNumber)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Refresh Status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Required Details Grid */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 bg-eco-bg p-5 rounded-2xl border border-eco-border/80">
              {/* Waste Category */}
              <div>
                <span className="text-[11px] uppercase font-bold text-eco-muted block mb-1">
                  Waste Category
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${request.wasteCategory?.color}20`,
                      color: request.wasteCategory?.color || '#16A34A',
                    }}
                  >
                    <CategoryIcon name={request.wasteCategory?.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-eco-dark">
                    {request.wasteCategory?.name}
                  </span>
                </div>
              </div>

              {/* Pickup Location */}
              <div>
                <span className="text-[11px] uppercase font-bold text-eco-muted block mb-1">
                  Pickup Location
                </span>
                <div className="flex items-start gap-1.5 text-xs text-eco-charcoal/80">
                  <MapPin className="w-4 h-4 text-eco-primary shrink-0 mt-0.5" />
                  <span className="font-semibold text-eco-dark truncate block">
                    {pickupLoc}
                  </span>
                </div>
              </div>

              {/* Scheduled Date */}
              <div>
                <span className="text-[11px] uppercase font-bold text-eco-muted block mb-1">
                  Scheduled Date
                </span>
                <div className="flex items-center gap-1.5 text-xs text-eco-charcoal/80">
                  <Calendar className="w-4 h-4 text-eco-primary shrink-0" />
                  <span className="font-semibold text-eco-dark">{scheduledDate}</span>
                </div>
              </div>

              {/* Scheduled Time */}
              <div>
                <span className="text-[11px] uppercase font-bold text-eco-muted block mb-1">
                  Scheduled Time
                </span>
                <div className="flex items-center gap-1.5 text-xs text-eco-charcoal/80">
                  <Clock className="w-4 h-4 text-eco-primary shrink-0" />
                  <span className="font-semibold text-eco-dark truncate">{scheduledTime}</span>
                </div>
              </div>
            </div>

            {/* VISUAL STATUS TIMELINE */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-eco-dark">
                  Visual Status Timeline
                </h3>
                {request.collectorName && (
                  <span className="text-xs bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 rounded-xl font-medium">
                    🚛 Vehicle / Team: <strong>{request.collectorName}</strong>
                  </span>
                )}
              </div>

              {/* Cancelled Alert if Cancelled */}
              {isCancelled ? (
                <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Collection Request Cancelled</h4>
                    <p className="text-xs text-red-700 mt-1">
                      {request.dispatchNotes || 'This request has been cancelled by citizen request or dispatch.'}
                    </p>
                    {getStageTimestamp('CANCELLED') && (
                      <span className="text-[11px] text-red-600 block mt-1 font-mono">
                        Cancelled on: {getStageTimestamp('CANCELLED')}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* Vertical & Connected Progress Timeline */
                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-eco-border">
                  {STAGES.map((stage, idx) => {
                    const isPassed = currentRank > stage.rank;
                    const isCurrent = currentRank === stage.rank;
                    const isUpcoming = currentRank < stage.rank;
                    const timestamp = getStageTimestamp(stage.key);

                    return (
                      <div key={stage.key} className="relative group">
                        {/* Visual Status Indicator */}
                        <div
                          className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                            isPassed
                              ? 'bg-eco-primary text-white ring-4 ring-eco-light'
                              : isCurrent
                              ? 'bg-eco-primary text-white ring-4 ring-emerald-200 animate-pulse'
                              : 'bg-white border-2 border-gray-300 text-gray-400'
                          }`}
                        >
                          {isPassed ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : isCurrent ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-white block" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-gray-300 block" />
                          )}
                        </div>

                        {/* Stage Content */}
                        <div
                          className={`p-4 rounded-2xl border transition-all ${
                            isCurrent
                              ? 'bg-eco-light/40 border-eco-primary ring-1 ring-eco-primary/30 shadow-sm'
                              : isPassed
                              ? 'bg-white border-eco-border/80'
                              : 'bg-gray-50/70 border-gray-200 opacity-60'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-eco-dark">
                                {stage.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] bg-eco-primary text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Current Stage
                                </span>
                              )}
                            </div>

                            {timestamp && (
                              <span className="text-xs text-eco-muted font-mono">
                                {timestamp}
                              </span>
                            )}
                          </div>

                          {/* Stage description */}
                          <p className="text-xs text-eco-charcoal/70 mt-1">
                            {stage.key === 'PENDING' &&
                              'Citizen collection request logged into municipal intake system.'}
                            {stage.key === 'CONFIRMED' &&
                              'Municipal route controller verified request details and confirmed schedule.'}
                            {stage.key === 'ASSIGNED' &&
                              (request.collectorName
                                ? `Allocated to ${request.collectorName} for neighborhood pickup route.`
                                : 'Collection vehicle and personnel allocated for collection route.')}
                            {stage.key === 'COLLECTED' &&
                              'Waste successfully picked up and routed to certified treatment or composting facility.'}
                          </p>

                          {/* Notes if applicable */}
                          {stage.key === currentStatus && request.dispatchNotes && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-white/80 border border-eco-border/70 text-xs text-eco-charcoal/80">
                              <span className="font-semibold text-eco-dark block mb-0.5">Dispatch Note:</span>
                              {request.dispatchNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-eco-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to={`/history?phone=${encodeURIComponent(request.userPhone)}`}
                className="text-xs font-semibold text-eco-primary hover:underline flex items-center gap-1.5"
              >
                <Clock3 className="w-4 h-4" />
                <span>View all requests for {request.userPhone}</span>
              </Link>

              <button
                onClick={() => onOpenRequestModal && onOpenRequestModal()}
                className="inline-flex items-center gap-2 bg-eco-primary hover:bg-eco-dark text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-eco transition-all"
              >
                <span>Schedule Another Pickup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
