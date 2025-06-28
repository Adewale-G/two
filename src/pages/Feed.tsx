import React, { useEffect, useState } from 'react';
import { Image, Video, Calendar, X, Send, Plus, Users, Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface Post {
  id: string;
  content: string;
  media_url?: string;
  type: 'text' | 'image' | 'video';
  created_at: string;
  updated_at: string;
  author_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  author?: {
    id: string;
    full_name: string;
    role: string;
    avatar_url?: string;
  };
  user_has_liked?: boolean;
  user_has_bookmarked?: boolean;
}

interface NewsPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author_name: string;
  featured: boolean;
  created_at: string;
  media_url?: string;
}

const CentralizedFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'news'>('all');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchNews();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_posts')
        .select(`
          *,
          profiles!user_posts_author_id_fkey(id, full_name, role, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const postsWithAuthor = data.map(post => ({
          ...post,
          author: post.profiles ? {
            id: post.profiles.id,
            full_name: post.profiles.full_name,
            role: post.profiles.role,
            avatar_url: post.profiles.avatar_url
          } : undefined
        }));
        setPosts(postsWithAuthor);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setNews(data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setMediaPreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadMedia = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      alert('Post content is required.');
      return;
    }
    
    if (!user) {
      alert('You must be logged in to post.');
      return;
    }

    setUploading(true);

    try {
      let media_url = null;
      let type: 'text' | 'image' | 'video' = 'text';

      if (mediaFile) {
        media_url = await uploadMedia(mediaFile);
        if (!media_url) {
          alert('Failed to upload media.');
          setUploading(false);
          return;
        }
        type = mediaFile.type.startsWith('image') ? 'image' : 'video';
      }

      const { error: insertError } = await supabase
        .from('user_posts')
        .insert({
          content: newPost,
          media_url,
          type,
          author_id: user.id,
        });

      if (insertError) {
        console.error('Post insert error:', insertError);
        alert('Failed to create post.');
        setUploading(false);
        return;
      }

      setNewPost('');
      setMediaFile(null);
      setMediaPreview(null);
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post.');
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      // Check if user already liked the post
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      fetchPosts(); // Refresh posts to update like counts
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user) return;

    try {
      // Check if user already bookmarked the post
      const { data: existingBookmark } = await supabase
        .from('post_bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingBookmark) {
        // Remove bookmark
        await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Add bookmark
        await supabase
          .from('post_bookmarks')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error handling bookmark:', error);
    }
  };

  const openImageModal = (imageUrl: string) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
    modal.onclick = () => document.body.removeChild(modal);
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'max-w-full max-h-full object-contain';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'absolute top-4 right-4 text-white text-4xl hover:text-gray-300';
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    modal.appendChild(img);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
  };

  const allContent = [
    ...posts.map(post => ({ ...post, contentType: 'post' as const })),
    ...news.map(newsItem => ({ ...newsItem, contentType: 'news' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredContent = activeTab === 'all' ? allContent :
                         activeTab === 'posts' ? allContent.filter(item => item.contentType === 'post') :
                         allContent.filter(item => item.contentType === 'news');

  return (
    <div className="p-4 max-w-2xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">University Feed</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Stay connected with your university community</p>
        </div>
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex items-center space-x-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          <span>Post</span>
        </button>
      </div>

      <div className="flex space-x-3 mb-4">
        {['all', 'posts', 'news'].map(tab => (
          <button
            key={tab}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === 'all' ? 'All' : tab === 'posts' ? 'Posts' : 'News'}
          </button>
        ))}
      </div>

      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => {
                setShowCreatePost(false);
                setMediaPreview(null);
                setMediaFile(null);
              }}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Create Post</h3>
            <textarea
              rows={3}
              placeholder="What's on your mind?"
              className="w-full p-2 border rounded mb-3 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            {mediaPreview && (
              <div className="mb-3">
                {mediaFile?.type.startsWith('image') ? (
                  <img src={mediaPreview} alt="preview" className="w-full max-h-48 object-cover rounded" />
                ) : (
                  <video src={mediaPreview} className="w-full max-h-48 object-cover rounded" controls />
                )}
              </div>
            )}
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-3">
                <label className="cursor-pointer">
                  <Image className="h-5 w-5 text-gray-500" />
                  <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
                </label>
                <label className="cursor-pointer">
                  <Video className="h-5 w-5 text-gray-500" />
                  <input type="file" accept="video/*" onChange={handleMediaUpload} className="hidden" />
                </label>
              </div>
              <button
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
                disabled={!newPost.trim() || uploading}
                onClick={handleCreatePost}
              >
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Posting...</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 inline mr-1" /> Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading feed...</p>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded border dark:border-gray-700">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No content found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Be the first to share something with the community!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContent.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
              {item.contentType === 'post' ? (
                <>
                  <div className="flex items-center mb-3 space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {item.author?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.author?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {item.author?.role || 'User'} • {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-900 dark:text-white mb-3">{item.content}</p>
                  {item.media_url && item.type === 'image' && (
                    <img
                      src={item.media_url}
                      alt="post"
                      className="w-full max-h-96 object-cover rounded cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => openImageModal(item.media_url!)}
                    />
                  )}
                  {item.media_url && item.type === 'video' && (
                    <video controls className="w-full rounded">
                      <source src={item.media_url} />
                    </video>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                    <button 
                      onClick={() => handleLike(item.id)}
                      className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{item.likes_count || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{item.comments_count || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                      <Share className="w-4 h-4" />
                      <span className="text-sm">{item.shares_count || 0}</span>
                    </button>
                    <button 
                      onClick={() => handleBookmark(item.id)}
                      className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center mb-3 space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.author_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        News • {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.category === 'academic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      item.category === 'event' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{item.content}</p>
                  {item.media_url && (
                    <img
                      src={item.media_url}
                      alt="news"
                      className="w-full max-h-64 object-cover rounded cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => openImageModal(item.media_url!)}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CentralizedFeed;