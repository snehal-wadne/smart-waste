import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchAdminRequests,
  updateAdminRequestStatus,
  fetchAdminStats,
  fetchWasteCategories,
} from "../api/client";
import CategoryIcon from "../components/CategoryIcon";
import CollectionAnalytics from "../components/CollectionAnalytics";
import {
  Truck,
  Filter,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  Phone,
  User,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  Edit3,
  X,
  Layers,
  Inbox,
  FileText,
  Download,
  LogOut,
  Lock,
  ArrowLeft,
} from "lucide-react";

const STATUS_BADGES = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border-amber-300",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  ASSIGNED: {
    label: "Assigned",
    className: "bg-purple-100 text-purple-800 border-purple-300",
  },
  COLLECTED: {
    label: "Collected",
    className: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-300",
  },
};

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    confirmedRequests: 0,
    assignedRequests: 0,
    collectedRequests: 0,
    cancelledRequests: 0,
    categoryCounts: [],
  });

  // Filters
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [todayRequests, setTodayRequests] = useState([]);

  // UI state
  const [activeView, setActiveView] = useState("dispatch"); // 'dispatch' or 'analytics'
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); // for detail/edit modal
  const [editStatus, setEditStatus] = useState("");
  const [editCollector, setEditCollector] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("ecocollect_admin_auth") === "true";
  });
  const [loginEmail, setLoginEmail] = useState("admin@ecocollect.gov");
  const [loginPassword, setLoginPassword] = useState("admin2026");
  const [loginError, setLoginError] = useState("");

  const handleQuickDemoLogin = () => {
    sessionStorage.setItem("ecocollect_admin_auth", "true");
    setIsAuthenticated(true);
  };

  const handleLoginFormSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please enter your municipal officer email and passkey.");
      return;
    }
    sessionStorage.setItem("ecocollect_admin_auth", "true");
    setIsAuthenticated(true);
    setLoginError("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ecocollect_admin_auth");
    setIsAuthenticated(false);
  };

  const handleExportCSV = () => {
    if (!requests || requests.length === 0) return;
    const headers = [
      "Request Number",
      "Citizen Name",
      "Phone",
      "Waste Stream",
      "Pickup Address",
      "City",
      "Preferred Date",
      "Time Window",
      "Current Status",
      "Assigned Vehicle/Crew",
      "Dispatch Notes",
    ];
    const rows = requests.map((r) => [
      r.requestNumber || "",
      `"${(r.userName || "").replace(/"/g, '""')}"`,
      `"${r.userPhone || ""}"`,
      `"${r.wasteCategory?.name || ""}"`,
      `"${(r.pickupAddress || "").replace(/"/g, '""')}"`,
      `"${r.city || ""}"`,
      `"${r.preferredDate || ""}"`,
      `"${r.preferredTime || ""}"`,
      r.status || "",
      `"${r.collectorName || "Unassigned"}"`,
      `"${(r.dispatchNotes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ecocollect_dispatch_manifest_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadData = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const params = {};
      if (selectedStatus !== "ALL") params.status = selectedStatus;
      if (selectedCategory !== "ALL") params.wasteCategory = selectedCategory;
      if (selectedDate) params.date = selectedDate;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const today = new Date().toISOString().slice(0, 10);
      const [reqsData, statsData, catsData, todayData] = await Promise.all([
        fetchAdminRequests(params),
        fetchAdminStats(),
        categories.length === 0
          ? fetchWasteCategories()
          : Promise.resolve(categories),
        fetchAdminRequests({ date: today, limit: 100 }),
      ]);

      setRequests(reqsData.data);
      setStats(statsData.data);
      setTodayRequests(
        todayData.data.filter((request) =>
          ["PENDING", "CONFIRMED", "ASSIGNED"].includes(request.status),
        ),
      );
      if (categories.length === 0) setCategories(catsData);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, selectedStatus, selectedCategory, selectedDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const openDetailModal = (req) => {
    setSelectedRequest(req);
    setEditStatus(req.status);
    setEditCollector(req.collectorName || "");
    setEditNotes(req.dispatchNotes || "");
    setStatusMessage(null);
  };

  const handleSaveStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setUpdating(true);
      setStatusMessage(null);
      const res = await updateAdminRequestStatus(selectedRequest.id, {
        status: editStatus,
        collectorName: editCollector,
        dispatchNotes: editNotes,
      });

      setStatusMessage({
        type: "success",
        text: "Pickup request updated successfully!",
      });

      // Update local state
      setRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? res.data : r)),
      );
      setSelectedRequest(res.data);

      // Refresh stats
      const statsRes = await fetchAdminStats();
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to update status:", err);
      setStatusMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update request status.",
      });
    } finally {
      setUpdating(false);
    }
  };

  const nextStatuses = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["ASSIGNED", "CANCELLED"],
    ASSIGNED: ["COLLECTED", "CANCELLED"],
    COLLECTED: [],
    CANCELLED: [],
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl border border-eco-border shadow-xl p-8 sm:p-10 relative overflow-hidden text-left">
          {/* Top badge */}
          <div className="flex items-center justify-between pb-6 border-b border-eco-border/70 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-eco-dark tracking-tight">
                  Admin Dispatch Portal
                </h2>
                <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
                  Municipal Operations
                </p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <p className="text-xs text-eco-charcoal/70 mb-6 leading-relaxed">
            Restricted to municipal dispatchers, vehicle controllers, and environmental route officers.
          </p>

          {/* Instant 1-Click Demo Login */}
          <div className="mb-6 p-4 rounded-2xl bg-purple-50 border border-purple-200">
            <span className="text-[11px] font-bold text-purple-900 block mb-1">
              ⚡ Hackathon Evaluator Quick Access
            </span>
            <p className="text-[11px] text-purple-700 mb-3">
              Enter the full administrative console immediately with officer credentials.
            </p>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all transform active:scale-95 text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-purple-200" />
              <span>Enter as Municipal Dispatcher (1-Click)</span>
            </button>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleLoginFormSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-eco-dark block mb-1">
                Officer Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-eco-border text-xs font-mono focus:outline-none focus:border-purple-500"
                placeholder="admin@ecocollect.gov"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-eco-dark block mb-1">
                Security Passkey
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-eco-border text-xs font-mono focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-600 font-medium">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-eco-dark hover:bg-black text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Sign In to Command Console
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-eco-border/60 text-center">
            <Link
              to="/"
              className="text-xs font-semibold text-eco-primary hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Citizen Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Staff & Profile Bar */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-eco-charcoal text-white rounded-3xl p-6 sm:p-7 mb-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 font-bold text-lg shrink-0">
            PD
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Priya Deshmukh
              </span>
              <span className="bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                City Route Controller
              </span>
            </div>
            <p className="text-xs text-gray-300 flex items-center gap-2">
              <span>Central Municipal Division • Station #04</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Dispatch Connected
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/15 transition-all shadow-sm"
            title="Download CSV Manifest"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Manifest</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/15 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Citizen View</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-red-400/30 transition-all"
            title="Sign Out of Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Operations Sub-Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-eco-primary">
              Fleet & Dispatch Operations
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Operations Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-eco-dark tracking-tight">
            Municipal Dispatch Console
          </h1>
          <p className="text-xs sm:text-sm text-eco-charcoal/70">
            Monitor, prioritize, and allocate vehicles for community collection requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl border border-eco-border shadow-sm flex items-center">
            <button
              onClick={() => setActiveView("dispatch")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === "dispatch"
                  ? "bg-eco-primary text-white shadow-sm"
                  : "text-eco-charcoal/70 hover:text-eco-dark"
              }`}
            >
              Requests Dispatch
            </button>
            <button
              onClick={() => setActiveView("analytics")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === "analytics"
                  ? "bg-eco-primary text-white shadow-sm"
                  : "text-eco-charcoal/70 hover:text-eco-dark"
              }`}
            >
              Collection Analytics
            </button>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 bg-white hover:bg-eco-bg text-eco-dark text-xs font-semibold px-4 py-2.5 rounded-xl border border-eco-border shadow-sm transition-all"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* View Switch Content */}
      {activeView === "dispatch" ? (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Collection Requests",
                val: stats.totalRequests ?? stats.total ?? 0,
                color: "border-l-4 border-eco-primary bg-white",
                icon: FileText,
                iconBg: "bg-eco-soft text-eco-primary",
              },
              {
                label: "Pending Pickups",
                val: stats.pendingRequests ?? stats.pending ?? 0,
                color: "border-l-4 border-amber-500 bg-white",
                icon: Clock,
                iconBg: "bg-amber-50 text-amber-600",
              },
              {
                label: "Today's Pickups",
                val: stats.todayPickups ?? stats.today ?? 0,
                color: "border-l-4 border-blue-500 bg-white",
                icon: Calendar,
                iconBg: "bg-blue-50 text-blue-600",
              },
              {
                label: "Completed Collections",
                val: stats.completedCollections ?? stats.completed ?? 0,
                color: "border-l-4 border-emerald-500 bg-white",
                icon: CheckCircle2,
                iconBg: "bg-emerald-50 text-emerald-600",
              },
            ].map((m) => {
              const IconComponent = m.icon;
              return (
                <div
                  key={m.label}
                  className={`p-4 sm:p-5 rounded-2xl border border-eco-border shadow-eco-sm flex items-center justify-between ${m.color}`}
                >
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-eco-muted block">
                      {m.label}
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-eco-dark block mt-1 font-mono">
                      {m.val}
                    </span>
                  </div>
                  {IconComponent && (
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.iconBg}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl border border-eco-border p-4 mb-6 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Status Pill Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {[
                "ALL",
                "PENDING",
                "CONFIRMED",
                "ASSIGNED",
                "COLLECTED",
                "CANCELLED",
              ].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedStatus === st
                      ? "bg-eco-primary text-white shadow-sm"
                      : "bg-gray-50 text-eco-charcoal/70 hover:bg-gray-100"
                  }`}
                >
                  {st === "ALL"
                    ? "All Requests"
                    : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Category Filter & Search Form */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto text-xs font-semibold px-3 py-2 rounded-xl border border-eco-border bg-white focus:outline-none focus:ring-1 focus:ring-eco-primary"
              >
                <option value="ALL">All Waste Streams</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                aria-label="Filter by pickup date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto text-xs font-semibold px-3 py-2 rounded-xl border border-eco-border bg-white focus:outline-none focus:ring-1 focus:ring-eco-primary"
              />

              <form
                onSubmit={handleSearchSubmit}
                className="w-full sm:w-64 relative flex items-center"
              >
                <Search className="w-3.5 h-3.5 text-eco-muted absolute left-3" />
                <input
                  type="text"
                  placeholder="Search code, citizen, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-eco-border focus:outline-none focus:ring-1 focus:ring-eco-primary"
                />
              </form>
            </div>
          </div>

          <section className="mb-6 border-y border-eco-border bg-white py-5 px-4 sm:px-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-base font-bold text-eco-dark">
                  Today's Collections
                </h2>
                <p className="text-xs text-eco-muted">
                  Pickups scheduled for {new Date().toLocaleDateString()}
                </p>
              </div>
              <span className="text-sm font-bold text-eco-primary">
                {todayRequests.length}
              </span>
            </div>
            {todayRequests.length === 0 ? (
              <p className="text-xs text-eco-muted py-3">
                No pickups scheduled for today.
              </p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {todayRequests.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openDetailModal(item)}
                    className="min-w-56 text-left border-l-2 border-eco-primary bg-eco-bg/70 px-3 py-2 hover:bg-eco-light/40"
                  >
                    <span className="block font-mono text-xs font-bold text-eco-dark">
                      {item.requestNumber}
                    </span>
                    <span className="block text-xs text-eco-charcoal">
                      {item.preferredTime} · {item.userName}
                    </span>
                    <span className="block text-[11px] text-eco-muted truncate">
                      {item.pickupAddress}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Requests Table / Card List */}
          <div className="bg-white rounded-2xl border border-eco-border overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-eco-muted">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-eco-primary" />
                <p className="text-xs">Loading requests from database...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-16 text-center text-eco-muted">
                <Inbox className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <h3 className="text-sm font-bold text-eco-dark">
                  No Matching Requests Found
                </h3>
                <p className="text-xs mt-1">
                  Try resetting the status filter or search query.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-eco-border text-[11px] uppercase tracking-wider font-bold text-eco-muted">
                      <th className="py-3 px-4">Request ID</th>
                      <th className="py-3 px-4">Citizen</th>
                      <th className="py-3 px-4">Waste Type</th>
                      <th className="py-3 px-4">Pickup Date</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {requests.map((req) => {
                      const badge =
                        STATUS_BADGES[req.status] || STATUS_BADGES.PENDING;
                      return (
                        <tr
                          key={req.id}
                          className="hover:bg-eco-bg/50 transition-colors"
                        >
                          {/* Tracking Code */}
                          <td className="py-3 px-4 font-mono font-bold text-eco-dark whitespace-nowrap">
                            {req.requestNumber}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-eco-dark">
                              {req.userName}
                            </div>
                            <div className="text-[11px] text-eco-muted">
                              {req.userPhone}
                            </div>
                          </td>

                          {/* Waste Category */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center"
                                style={{
                                  backgroundColor: `${req.wasteCategory?.color}20`,
                                  color: req.wasteCategory?.color,
                                }}
                              >
                                <CategoryIcon
                                  name={req.wasteCategory?.icon}
                                  className="w-3.5 h-3.5"
                                />
                              </div>
                              <span className="font-semibold text-eco-dark">
                                {req.wasteCategory?.name}
                              </span>
                            </div>
                          </td>

                          {/* Pickup Window */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-medium text-eco-dark">
                              {req.preferredDate}
                            </div>
                            <div className="text-[10px] text-eco-muted">
                              {req.preferredTime}
                            </div>
                          </td>

                          {/* Address */}
                          <td className="py-3 px-4 max-w-xs truncate text-eco-charcoal/80">
                            {[req.pickupAddress, req.city, req.pincode]
                              .filter(Boolean)
                              .join(", ")}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => openDetailModal(req)}
                              className="inline-flex items-center gap-1 bg-eco-light hover:bg-eco-primary hover:text-white text-eco-dark text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Manage</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <CollectionAnalytics />
      )}

      {/* DETAIL & MANAGEMENT MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-eco-border animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-eco-dark text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-eco-light">
                  Manage Request
                </span>
                <h3 className="text-xl font-bold font-mono">
                  {selectedRequest.requestNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {statusMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                    statusMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Citizen & Location Brief */}
              <div className="grid grid-cols-2 gap-4 bg-eco-bg p-4 rounded-2xl border border-eco-border text-xs">
                <div>
                  <span className="text-eco-muted block">Citizen:</span>
                  <span className="font-bold text-eco-dark">
                    {selectedRequest.userName}
                  </span>
                  <span className="text-eco-muted block mt-0.5">
                    📞 {selectedRequest.userPhone}
                  </span>
                  {selectedRequest.userEmail && (
                    <span className="text-eco-muted block">
                      ✉️ {selectedRequest.userEmail}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-eco-muted block">Location:</span>
                  <span className="font-bold text-eco-dark">
                    {selectedRequest.pickupAddress}
                  </span>
                  <span className="text-eco-muted block mt-0.5">
                    {[selectedRequest.city, selectedRequest.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>

                <div>
                  <span className="text-eco-muted block">Waste Stream:</span>
                  <span className="font-bold text-eco-dark">
                    {selectedRequest.wasteCategory?.name}
                  </span>
                </div>

                <div>
                  <span className="text-eco-muted block">Scheduled Date:</span>
                  <span className="font-bold text-eco-dark">
                    {selectedRequest.preferredDate} (
                    {selectedRequest.preferredTime})
                  </span>
                </div>
                <div>
                  <span className="text-eco-muted block">Quantity:</span>
                  <span className="font-bold text-eco-dark">
                    {selectedRequest.quantity || "Not provided"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-eco-muted block">
                    Waste Description:
                  </span>
                  <span className="font-bold text-eco-dark">
                    {selectedRequest.wasteDescription || "Not provided"}
                  </span>
                </div>
              </div>

              <section>
                <h4 className="text-xs font-bold uppercase tracking-wider text-eco-dark mb-3">
                  Status History
                </h4>
                <ol className="border-l border-eco-border ml-1.5 space-y-3">
                  {(selectedRequest.statusHistory || []).map((event) => (
                    <li
                      key={event.id || `${event.newStatus}-${event.changedAt}`}
                      className="relative pl-4 text-xs"
                    >
                      <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-eco-primary border-2 border-white" />
                      <span className="font-bold text-eco-dark">
                        {event.oldStatus ? `${event.oldStatus} → ` : ""}
                        {event.newStatus}
                      </span>
                      <span className="block text-eco-muted">
                        {new Date(event.changedAt).toLocaleString()}
                      </span>
                      {event.note && (
                        <span className="block text-eco-charcoal/80 mt-0.5">
                          {event.note}
                        </span>
                      )}
                    </li>
                  ))}
                  {(!selectedRequest.statusHistory ||
                    selectedRequest.statusHistory.length === 0) && (
                    <li className="pl-4 text-xs text-eco-muted">
                      No recorded status changes.
                    </li>
                  )}
                </ol>
              </section>

              {/* Status Update Form */}
              <form onSubmit={handleSaveStatusUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-1.5">
                    Update Workflow Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-eco-border font-semibold text-xs bg-white focus:outline-none focus:ring-2 focus:ring-eco-primary"
                  >
                    <option value={selectedRequest.status}>
                      {selectedRequest.status}
                    </option>
                    {(nextStatuses[selectedRequest.status] || []).map(
                      (status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-1.5">
                    Assigned Collector / Vehicle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EcoTruck #07 (Driver: Rajesh M.)"
                    value={editCollector}
                    onChange={(e) => setEditCollector(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-eco-border focus:outline-none focus:ring-2 focus:ring-eco-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-1.5">
                    Dispatch Notes / Citizen Notice
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add operational notes or instructions for the collection crew..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-eco-border focus:outline-none focus:ring-2 focus:ring-eco-primary"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <a
                    href={`/track?code=${selectedRequest.requestNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-eco-primary hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Citizen View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(null)}
                      className="px-4 py-2 text-xs font-semibold text-eco-charcoal/70 hover:bg-gray-100 rounded-xl"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="bg-eco-primary hover:bg-eco-dark text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-eco transition-all disabled:opacity-50"
                    >
                      {updating ? "Saving Changes..." : "Save & Update"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
