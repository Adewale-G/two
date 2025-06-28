import React, { useState } from 'react';
import DatabaseTest from '../components/Debug/DatabaseTest';
import { supabase } from '../lib/supabase';
import { Database, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const Debug: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkDatabaseConnection = async () => {
    setLoading(true);
    setConnectionStatus('checking');

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Database connection error:', error);
        setConnectionStatus('error');
        setDbInfo({ error: error.message });
      } else {
        setConnectionStatus('connected');
        
        // Get database info
        const { data: profileCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' });

        const { data: postsCount } = await supabase
          .from('user_posts')
          .select('id', { count: 'exact' });

        const { data: newsCount } = await supabase
          .from('news')
          .select('id', { count: 'exact' });

        setDbInfo({
          profiles: profileCount?.length || 0,
          posts: postsCount?.length || 0,
          news: newsCount?.length || 0,
          url: import.meta.env.VITE_SUPABASE_URL,
          connected: true
        });
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setConnectionStatus('error');
      setDbInfo({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    setLoading(true);
    try {
      // Insert demo profiles directly
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          -- Insert faculties if they don't exist
          INSERT INTO faculties (id, name, full_name, description, dean_name, dean_email, dean_phone) VALUES
          ('550e8400-e29b-41d4-a716-446655440010', 'COPAS', 'College of Pure and Applied Sciences', 'College of Pure and Applied Sciences', 'Prof. Kehinde Ogunniran', 'kehinde.ogunniran@calebuniversity.edu.ng', '07039772668'),
          ('550e8400-e29b-41d4-a716-446655440011', 'ADMINISTRATION', 'University Administration', 'University Administration', 'Prof. Vice Chancellor', 'vc@calebuniversity.edu.ng', '08012345678')
          ON CONFLICT (id) DO NOTHING;

          -- Insert departments if they don't exist
          INSERT INTO departments (id, name, faculty_id, head_of_department) VALUES
          ('550e8400-e29b-41d4-a716-446655440020', 'Computer Science', '550e8400-e29b-41d4-a716-446655440010', 'Dr. Sarah Wilson'),
          ('550e8400-e29b-41d4-a716-446655440021', 'Administration', '550e8400-e29b-41d4-a716-446655440011', 'Admin Head')
          ON CONFLICT (id) DO NOTHING;

          -- Insert demo profiles
          INSERT INTO profiles (id, email, full_name, username, role, date_of_birth, phone, address, faculty_id, department_id, matric_number, staff_id, bio, avatar_url, is_verified) VALUES
          ('550e8400-e29b-41d4-a716-446655440001', 'admin@pineappl.edu', 'Admin User', 'admin_user', 'admin', '1985-05-15', '+234 801 234 5678', 'Admin Block', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440021', NULL, 'ADMIN001', 'University administrator', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', true),
          ('550e8400-e29b-41d4-a716-446655440002', 'lecturer@pineappl.edu', 'Dr. Sarah Wilson', 'sarah_wilson', 'lecturer', '1980-08-22', '+234 802 345 6789', 'Faculty Housing', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440020', NULL, 'STAFF002', 'Lecturer in Computer Science', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', true),
          ('550e8400-e29b-41d4-a716-446655440003', 'student@pineappl.edu', 'John Student', 'john_student', 'student', '2000-03-10', '+234 803 456 7890', 'Student Hostel', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440020', 'STU2021001', NULL, 'Computer Science student', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', true)
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            updated_at = now();
        `
      });

      if (error) {
        console.error('Migration error:', error);
        alert(`Migration failed: ${error.message}`);
      } else {
        alert('Demo profiles added successfully!');
        checkDatabaseConnection();
      }
    } catch (err) {
      console.error('Migration failed:', err);
      alert(`Migration failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    checkDatabaseConnection();
  }, []);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Database className="h-6 w-6 mr-2" />
              Database Connection Status
            </h2>
            <button
              onClick={checkDatabaseConnection}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            {connectionStatus === 'checking' && (
              <>
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 dark:text-gray-400">Checking connection...</span>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Connected to Supabase</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                <span className="text-red-600 dark:text-red-400">Connection failed</span>
              </>
            )}
          </div>

          {dbInfo && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Database Information</h3>
              {dbInfo.connected ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Profiles:</span>
                    <div className="font-semibold text-gray-900 dark:text-white">{dbInfo.profiles}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Posts:</span>
                    <div className="font-semibold text-gray-900 dark:text-white">{dbInfo.posts}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">News:</span>
                    <div className="font-semibold text-gray-900 dark:text-white">{dbInfo.news}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">URL:</span>
                    <div className="font-mono text-xs text-gray-900 dark:text-white break-all">{dbInfo.url}</div>
                  </div>
                </div>
              ) : (
                <div className="text-red-600 dark:text-red-400">
                  <strong>Error:</strong> {dbInfo.error}
                </div>
              )}
            </div>
          )}

          {/* Quick Fix Button */}
          {connectionStatus === 'connected' && dbInfo?.profiles === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    No Profiles Found
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Your profiles table is empty. Click the button below to add demo user profiles.
                  </p>
                  <button
                    onClick={runMigration}
                    disabled={loading}
                    className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding Profiles...' : 'Add Demo Profiles'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Database Tests */}
        <DatabaseTest />
      </div>
    </div>
  );
};

export default Debug;