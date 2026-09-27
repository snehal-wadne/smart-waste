import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Recycle,
  Scale,
  RefreshCw,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  Calendar,
} from 'lucide-react';

export default function CollectionAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/admin/analytics');
      setData(res.data.data);
    } catch (err) {
      console.error('Analytics load error:', err);
      setError('Could not load analytics metrics from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-eco-border p-12 text-center text-eco-muted shadow-sm">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-eco-primary" />
        <p className="text-sm font-semibold">Generating collection analytics from database...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-3xl border border-red-200 p-8 text-center text-red-600 shadow-sm">
        <p className="text-sm font-semibold">{error || 'No analytics data available.'}</p>
        <button
          onClick={loadAnalytics}
          className="mt-4 px-4 py-2 bg-eco-primary text-white text-xs font-semibold rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  const { categoryDistribution, statusBreakdown, timelineData, summary } = data;

  // Filter out categories with 0 items for cleaner pie chart
  const activeCategories = categoryDistribution.filter((c) => c.count > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Civic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-gradient-to-br from-eco-dark to-[#0f4021] text-white p-5 rounded-3xl shadow-eco">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold text-eco-light tracking-wider">
              Total Managed
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Scale className="w-4 h-4 text-eco-light" />
            </div>
          </div>
          <div className="text-3xl font-extrabold">{summary.totalWeightKg} <span className="text-base font-medium">kg</span></div>
          <p className="text-[11px] text-white/70 mt-1">Total estimated waste logged for collection</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-3xl border border-eco-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold text-eco-muted tracking-wider">
              Collected & Diverted
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Recycle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-eco-dark">{summary.collectedWeightKg} <span className="text-base font-medium text-gray-500">kg</span></div>
          <p className="text-[11px] text-eco-muted mt-1">Safely routed to recycling/bio-composting</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-3xl border border-eco-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold text-eco-muted tracking-wider">
              Diversion Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-eco-primary">{summary.diversionRate}%</div>
          <p className="text-[11px] text-eco-muted mt-1">Completed pickups vs total requests</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-3xl border border-eco-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold text-eco-muted tracking-wider">
              Total Logged Pickups
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-eco-dark">{summary.totalRequests}</div>
          <p className="text-[11px] text-eco-muted mt-1">Across 7 municipal waste categories</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Chart 1: Donut Chart - Category Distribution */}
        <div className="bg-white rounded-3xl border border-eco-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-eco-light flex items-center justify-center text-eco-dark">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-eco-dark">Waste Stream Distribution</h3>
                <p className="text-xs text-eco-muted">Proportion of requests by segregation category</p>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeCategories.length > 0 ? activeCategories : categoryDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {(activeCategories.length > 0 ? activeCategories : categoryDistribution).map(
                    (entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#16A34A'} />
                    )
                  )}
                </Pie>
                <Tooltip
                  formatter={(val, name, item) => [`${val} requests (${item.payload.totalWeightKg} kg)`, name]}
                  contentStyle={{
                    backgroundColor: '#172017',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Bar Chart - Status Pipeline */}
        <div className="bg-white rounded-3xl border border-eco-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-eco-dark">Dispatch Workflow Pipeline</h3>
                <p className="text-xs text-eco-muted">Current status distribution across collection teams</p>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748B" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#64748B" />
                <Tooltip
                  formatter={(val) => [`${val} pickups`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#172017',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Timeline Area Chart */}
      <div className="bg-white rounded-3xl border border-eco-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-eco-dark">Pickup Volume Timeline</h3>
              <p className="text-xs text-eco-muted">Scheduled pickups by target collection date</p>
            </div>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPickups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748B" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#64748B" />
              <Tooltip
                formatter={(val) => [`${val} scheduled`, 'Volume']}
                contentStyle={{
                  backgroundColor: '#172017',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="pickups"
                stroke="#16A34A"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPickups)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
