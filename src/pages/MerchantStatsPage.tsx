import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Package, ShoppingCart, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface DashboardStats {
  merchant_id: string;
  company_name: string;
  avg_rating: number;
  total_offers: number;
  active_offers: number;
  pending_reservations: number;
  confirmed_reservations: number;
  total_reservations: number;
  total_units_sold: number;
  total_reviews: number;
}

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  changed_at: string;
  old_data?: any;
  new_data?: any;
}

export default function MerchantStatsPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching dashboard data for user:', user.id);

      const { data: dashboardData, error: dashError } = await supabase
        .from('merchant_dashboard')
        .select('*')
        .eq('merchant_id', user.id)
        .single();

      if (dashError) {
        console.error('Error fetching dashboard:', dashError);
        setError('Failed to load dashboard stats');
      } else {
        console.log('Dashboard data:', dashboardData);
        setStats(dashboardData);
      }

      const { data: auditData, error: auditError } = await supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', user.id)
        .order('changed_at', { ascending: false })
        .limit(20);

      if (auditError) {
        console.error('Error fetching audit logs:', auditError);
      } else {
        console.log('Audit logs:', auditData);
        setLogs(auditData || []);
      }
    } catch (err: any) {
      console.error('Exception fetching dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (log: AuditLog) => {
    const actionColors = {
      INSERT: 'text-tilkapp-green',
      UPDATE: 'text-tilkapp-green',
      DELETE: 'text-red-600',
    };

    const actionLabels = {
      INSERT: 'Created',
      UPDATE: 'Updated',
      DELETE: 'Deleted',
    };

    return {
      color: actionColors[log.action as keyof typeof actionColors] || 'text-gray-600',
      label: actionLabels[log.action as keyof typeof actionLabels] || log.action,
    };
  };

  const getTableLabel = (tableName: string) => {
    const labels: { [key: string]: string } = {
      offers: 'Offer',
      reservations: 'Reservation',
      merchants: 'Profile',
    };
    return labels[tableName] || tableName;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-tilkapp-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-700 text-center">No dashboard data available. Please complete your merchant profile.</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Pending', value: stats.pending_reservations, fill: '#f59e0b' },
    { name: 'Confirmed', value: stats.confirmed_reservations, fill: '#10b981' },
    { name: 'Total Units Sold', value: stats.total_units_sold, fill: '#3b82f6' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Statistics Dashboard</h1>
          <p className="text-gray-600 mt-2">{stats.company_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-tilkapp-beige rounded-lg">
                <Package className="w-6 h-6 text-tilkapp-green" />
              </div>
              <span className="text-sm text-gray-500">Offers</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total_offers}</p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.active_offers} active
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">Pending</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.pending_reservations}</p>
              <p className="text-sm text-gray-600 mt-1">Awaiting confirmation</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-tilkapp-beige rounded-lg">
                <CheckCircle className="w-6 h-6 text-tilkapp-green" />
              </div>
              <span className="text-sm text-gray-500">Confirmed</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.confirmed_reservations}</p>
              <p className="text-sm text-gray-600 mt-1">Total reservations</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Rating</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.avg_rating.toFixed(1)}</p>
              <p className="text-sm text-gray-600 mt-1">Average rating</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Reservations Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Current status of your reservations</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600 mt-1">Your latest actions and changes</p>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activity yet</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="space-y-3">
                {logs.map((log) => {
                  const action = formatAction(log);
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold ${action.color}`}>
                            {action.label}
                          </span>
                          <span className="text-gray-600">
                            {getTableLabel(log.table_name)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(log.changed_at).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {log.record_id.slice(0, 8)}...
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
