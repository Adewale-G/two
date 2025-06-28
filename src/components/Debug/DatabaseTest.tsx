import React, { useState, useEffect } from 'react';
import { supabase, testConnection, insertDemoProfiles } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, AlertCircle, Database, Send, Eye, Trash2, Users, RefreshCw } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

const DatabaseTest: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [testPost, setTestPost] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, data?: any) => {
    setResults(prev => [...prev, { test, status, message, data }]);
  };

  const runTests = async () => {
    setResults([]);
    setLoading(true);

    try {
      // Test 1: Basic Database Connection
      addResult('Database Connection', 'success', 'Testing Supabase connection...');
      
      const connectionTest = await testConnection();
      if (!connectionTest.success) {
        addResult('Database Connection', 'error', `Connection failed: ${connectionTest.error}`);
        setLoading(false);
        return;
      } else {
        addResult('Database Connection', 'success', 'Successfully connected to Supabase');
      }

      // Test 2: User Authentication Status
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        addResult('Authentication', 'success', `Authenticated as: ${session.user.email}`);
      } else if (user) {
        addResult('Authentication', 'warning', `Using demo user: ${user.email} (ID: ${user.id})`);
      } else {
        addResult('Authentication', 'error', 'No user authenticated');
      }

      // Test 3: Check Profiles Table
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        addResult('Profiles Table', 'error', `Profiles table error: ${profilesError.message}`);
      } else {
        addResult('Profiles Table', 'success', `Found ${allProfiles?.length || 0} profiles in database`);
        setProfiles(allProfiles || []);
        
        if (allProfiles && allProfiles.length === 0) {
          addResult('Profiles Table', 'warning', 'Profiles table is empty - demo users not found');
        }
      }

      // Test 4: Check Current User Profile
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          addResult('Current User Profile', 'warning', `Profile not found in database: ${profileError.message}`);
        } else {
          addResult('Current User Profile', 'success', `Profile found: ${profile.full_name}`, profile);
        }
      }

      // Test 5: Posts Table Structure
      const { data: postsStructure, error: structureError } = await supabase
        .from('user_posts')
        .select('*')
        .limit(1);

      if (structureError) {
        addResult('Posts Table', 'error', `Posts table error: ${structureError.message}`);
      } else {
        addResult('Posts Table', 'success', 'Posts table accessible');
      }

      // Test 6: Fetch Existing Posts
      const { data: existingPosts, error: fetchError } = await supabase
        .from('user_posts')
        .select(`
          *,
          profiles!user_posts_author_id_fkey(id, full_name, role, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        addResult('Fetch Posts', 'error', `Failed to fetch posts: ${fetchError.message}`);
      } else {
        addResult('Fetch Posts', 'success', `Found ${existingPosts?.length || 0} posts`);
        setPosts(existingPosts || []);
      }

      // Test 7: RLS Policies
      const { data: rlsTest, error: rlsError } = await supabase
        .from('user_posts')
        .select('id')
        .limit(1);

      if (rlsError) {
        addResult('RLS Policies', 'error', `RLS policy error: ${rlsError.message}`);
      } else {
        addResult('RLS Policies', 'success', 'RLS policies working correctly');
      }

      // Test 8: Media Storage
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      if (storageError) {
        addResult('Storage', 'error', `Storage error: ${storageError.message}`);
      } else {
        const mediaBucket = buckets?.find(b => b.name === 'media');
        if (mediaBucket) {
          addResult('Storage', 'success', 'Media bucket found and accessible');
        } else {
          addResult('Storage', 'warning', 'Media bucket not found - media uploads may fail');
        }
      }

      // Test 9: Environment Variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        addResult('Environment Variables', 'error', 'Missing Supabase environment variables');
      } else {
        addResult('Environment Variables', 'success', `Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
      }

    } catch (error) {
      addResult('General Error', 'error', `Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreatePost = async () => {
    if (!testPost.trim()) {
      alert('Please enter test post content');
      return;
    }

    if (!user) {
      alert('Please log in to test post creation');
      return;
    }

    setLoading(true);
    addResult('Create Post Test', 'success', 'Attempting to create test post...');

    try {
      const { data, error } = await supabase
        .from('user_posts')
        .insert({
          content: testPost,
          type: 'text',
          author_id: user.id,
        })
        .select()
        .single();

      if (error) {
        addResult('Create Post Test', 'error', `Failed to create post: ${error.message}`, error);
      } else {
        addResult('Create Post Test', 'success', 'Post created successfully!', data);
        setTestPost('');
        // Refresh posts
        runTests();
      }
    } catch (error) {
      addResult('Create Post Test', 'error', `Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteTestPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('user_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        addResult('Delete Post', 'error', `Failed to delete post: ${error.message}`);
      } else {
        addResult('Delete Post', 'success', 'Post deleted successfully');
        runTests(); // Refresh
      }
    } catch (error) {
      addResult('Delete Post', 'error', `Unexpected error: ${error}`);
    }
  };

  const addDemoProfiles = async () => {
    setLoading(true);
    addResult('Add Demo Profiles', 'success', 'Adding demo profiles...');

    try {
      const result = await insertDemoProfiles();
      
      if (result.success) {
        addResult('Add Demo Profiles', 'success', 'Demo profiles added successfully!');
        runTests(); // Refresh all tests
      } else {
        addResult('Add Demo Profiles', 'error', `Failed to add demo profiles: ${result.error}`);
      }
    } catch (error) {
      addResult('Add Demo Profiles', 'error', `Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Database className="h-6 w-6 mr-2" />
          Comprehensive Database Test
        </h2>
        <button
          onClick={runTests}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Testing...' : 'Run Tests'}</span>
        </button>
      </div>

      {/* Current User Info */}
      {user && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Current User</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {profiles.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                No Profiles Found
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Your profiles table is empty. This is why posts aren't working. Add demo profiles to fix this.
              </p>
              <button
                onClick={addDemoProfiles}
                disabled={loading}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? 'Adding Profiles...' : 'Add Demo Profiles'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="space-y-3 mb-6">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${
              result.status === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                : result.status === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
            }`}
          >
            <div className="flex items-start space-x-3">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {result.test}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {result.message}
                </p>
                {result.data && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      View Data
                    </summary>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profiles in Database */}
      {profiles.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Profiles in Database ({profiles.length})
          </h3>
          <div className="space-y-2">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
              >
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {profile.full_name} ({profile.role})
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {profile.email} • ID: {profile.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Post Creation */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <Send className="h-5 w-5 mr-2" />
          Test Post Creation
        </h3>
        <div className="flex space-x-3">
          <input
            type="text"
            value={testPost}
            onChange={(e) => setTestPost(e.target.value)}
            placeholder="Enter test post content..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
          />
          <button
            onClick={testCreatePost}
            disabled={loading || !testPost.trim() || !user}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            Create Test Post
          </button>
        </div>
        {!user && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            Please log in to test post creation
          </p>
        )}
      </div>

      {/* Existing Posts */}
      {posts.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Recent Posts ({posts.length})
          </h3>
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {post.content}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <p>Author: {post.profiles?.full_name || 'Unknown'}</p>
                      <p>Created: {new Date(post.created_at).toLocaleString()}</p>
                      <p>ID: {post.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTestPost(post.id)}
                    className="ml-3 p-1 text-red-500 hover:text-red-700"
                    title="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseTest;