import React, { useState, useEffect } from 'react';
import { Database, Users, FileText, AlertCircle, CheckCircle, RefreshCw, Bug } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from '../components/Common/Card';

const DebugPage: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dbStats, setDbStats] = useState({
    profiles: 0,
    posts: 0,
    news: 0,
    faculties: 0,
    departments: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
    fetchStats();
    fetchRecentActivity();
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    }
  };

  const fetchStats = async () => {
    try {
      const [profiles, posts, news, faculties, departments] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('user_posts').select('id', { count: 'exact' }),
        supabase.from('news').select('id', { count: 'exact' }),
        supabase.from('faculties').select('id', { count: 'exact' }),
        supabase.from('departments').select('id', { count: 'exact' })
      ]);

      setDbStats({
        profiles: profiles.count || 0,
        posts: posts.count || 0,
        news: news.count || 0,
        faculties: faculties.count || 0,
        departments: departments.count || 0
      });
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: posts } = await supabase
        .from('user_posts')
        .select('id, content, created_at, author_id')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity([
        ...(posts || []).map(p => ({ ...p, type: 'post' })),
        ...(profiles || []).map(p => ({ ...p, type: 'profile' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10));
    } catch (error) {
      console.error('Activity fetch error:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      checkConnection(),
      fetchStats(),
      fetchRecentActivity()
    ]);
    setLoading(false);
  };

  const testDatabaseOperations = async () => {
    setLoading(true);
    try {
      // Test insert
      const { data: testPost, error: insertError } = await supabase
        .from('user_posts')
        .insert({
          author_id: '550e8400-e29b-41d4-a716-446655440001',
          content: `Debug test post - ${new Date().toISOString()}`,
          type: 'text'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Test update
      const { error: updateError } = await supabase
        .from('user_posts')
        .update({ content: `Updated debug test post - ${new Date().toISOString()}` })
        .eq('id', testPost.id);

      if (updateError) throw updateError;

      // Test delete
      const { error: deleteError } = await supabase
        .from('user_posts')
        .delete()
        .eq('id', testPost.id);

      if (deleteError) throw deleteError;

      alert('Database operations test completed successfully!');
      await refreshData();
    } catch (error) {
      console.error('Database test error:', error);
      alert(`Database test failed: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bug className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Debug Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Database connection and system diagnostics
            </p>
          </div>
        </div>
        <button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Connection Status */}
      <Card title="Database Connection Status">
        <div className="flex items-center space-x-3">
          {connectionStatus === 'checking' && (
            <>
              <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
              <span className="text-blue-600">Checking connection...</span>
            </>
          )}
          {connectionStatus === 'connected' && (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-600">Connected to Supabase</span>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-600">Connection failed</span>
            </>
          )}
        </div>
      </Card>

      {/* Database Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profiles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dbStats.profiles}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dbStats.posts}</p>
            </div>
            <FileText className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">News</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dbStats.news}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Faculties</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dbStats.faculties}</p>
            </div>
            <Database className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Departments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dbStats.departments}</p>
            </div>
            <Database className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Test Operations */}
      <Card title="Database Operations Test">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Test database CRUD operations to verify everything is working correctly.
          </p>
          <button
            onClick={testDatabaseOperations}
            disabled={loading || connectionStatus !== 'connected'}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run Database Test'}
          </button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Database Activity">
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No recent activity found.</p>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {activity.type === 'post' ? 'New Post' : 'New Profile'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.type === 'post' 
                      ? activity.content.substring(0, 50) + '...'
                      : `Profile: ${activity.full_name}`
                    }
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(activity.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Environment Info */}
      <Card title="Environment Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Supabase Configuration</h4>
            <div className="space-y-1 text-sm">
              <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}</p>
              <p><strong>Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</p>
              <p><strong>Connection:</strong> {connectionStatus === 'connected' ? '✅ Active' : '❌ Failed'}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Application Status</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
              <p><strong>Build:</strong> {import.meta.env.DEV ? 'Development' : 'Production'}</p>
              <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DebugPage;