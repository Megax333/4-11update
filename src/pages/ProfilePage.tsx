import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { MapPin, Link as LinkIcon, Calendar, Users, Check, Trophy, Star, ChevronRight, Heart, MessageCircle, Share2, Edit, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CoinIcon from '../components/CoinIcon';
import { useAuth } from '../hooks/useAuth';

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  followers_count?: number;
  following_count?: number;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { activeProfile, hideProfile } = useProfile();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!activeProfile) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', activeProfile)
          .single();

        if (error) throw error;
        setProfile(data);
        setEditedBio(data.bio || '');

        // Check if current user is following this profile
        if (user?.id && data.id !== user.id) {
          const { count } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', user.id)
            .eq('following_id', data.id);
          
          setIsFollowing(count === 1);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Profile not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [activeProfile, user?.id]);

  const handleMessageClick = () => {
    if (!profile) return;
    hideProfile(); // Close the profile modal
    navigate(`/messages/${profile.username}`); // Navigate to messages
  };

  const handleToggleFollow = async () => {
    if (!user?.id || !profile?.id) return;

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id
          });

        if (error) throw error;
      }

      setIsFollowing(!isFollowing);
      setProfile(prev => prev ? {
        ...prev,
        followers_count: (prev.followers_count || 0) + (isFollowing ? -1 : 1)
      } : null);
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    try {
      setSavingProfile(true);

      const { error } = await supabase
        .from('profiles')
        .update({ bio: editedBio })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, bio: editedBio } : null);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setSavingProfile(true);

      // Update profile directly with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || '')}&background=random&size=200`
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(prev.username)}&background=random&size=200`
      } : null);

    } catch (err) {
      console.error('Error updating avatar:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-2">Profile Not Found</h2>
          <p className="text-gray-500">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header */}
      <div className="relative h-[200px] bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614729939124-032d0bd5d11b?w=1400&h=350&fit=crop')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E2A] via-[#1E1E2A]/50 to-transparent" />
        
        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
          <div className="px-8">
            <div className="flex items-end gap-8">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-36 h-36 rounded-full object-cover border-4 border-[#1E1E2A] relative z-10 group-hover:scale-105 transition-transform"
                />
                {user?.id === profile?.id && (
                  <label className="absolute bottom-0 right-0 z-20 p-2 bg-purple-600 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={savingProfile}
                    />
                  </label>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {profile.username}
                  </h1>
                  <div className="bg-purple-600/20 p-1.5 rounded-full">
                    <Check size={16} className="text-purple-400" />
                  </div>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 ml-6">
                    {!user || user.id !== profile.id ? (
                      <>
                        <button
                          onClick={handleToggleFollow}
                          className={`px-8 py-2.5 rounded-full text-sm font-medium transition-colors ${
                            isFollowing
                              ? 'bg-[#2A2A3A] hover:bg-[#3A3A4A]'
                              : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button
                          onClick={handleMessageClick}
                          className="bg-[#2A2A3A] hover:bg-[#3A3A4A] px-8 py-2.5 rounded-full text-sm font-medium transition-colors"
                        >
                          Message
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 bg-[#2A2A3A] hover:bg-[#3A3A4A] px-8 py-2.5 rounded-full text-sm font-medium transition-colors"
                      >
                        <Edit size={16} />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {isEditing ? (
                  <div className="flex gap-2">
                    <textarea
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      placeholder="Write something about yourself..."
                      className="flex-1 bg-[#2A2A3A] rounded-lg p-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      rows={3}
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedBio(profile.bio || '');
                        }}
                        className="bg-[#2A2A3A] hover:bg-[#3A3A4A] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300">
                    {profile.bio || 'No bio yet'}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm">
                      <span className="font-bold">{profile.followers_count || 0}</span>
                      <span className="text-gray-400 ml-1">followers</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm">
                      <span className="font-bold">{profile.following_count || 0}</span>
                      <span className="text-gray-400 ml-1">following</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-6 mt-32">
        <div className="bg-[#2A2A3A] rounded-xl p-3 relative overflow-hidden group">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          
          <div className="relative flex items-center divide-x divide-white/10">
            {/* Followers */}
            <div className="flex-1 px-4 group/item">
              <div className="flex items-center gap-2 mb-0.5">
                <Users size={14} className="text-purple-400" />
                <span className="text-sm text-gray-400">Followers</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {profile.followers_count?.toLocaleString() || '0'}
                </span>
                <span className="text-xs text-gray-500">total</span>
              </div>
            </div>

            {/* Following */}
            <div className="flex-1 px-4 group/item">
              <div className="flex items-center gap-2 mb-0.5">
                <Users size={14} className="text-blue-400" />
                <span className="text-sm text-gray-400">Following</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {profile.following_count?.toLocaleString() || '0'}
                </span>
                <span className="text-xs text-gray-500">creators</span>
              </div>
            </div>

            {/* Achievements */}
            <div className="flex-1 px-4 group/item">
              <div className="flex items-center gap-2 mb-0.5">
                <Trophy size={14} className="text-yellow-400" />
                <span className="text-sm text-gray-400">Achievements</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  31
                </span>
                <div className="flex -space-x-1.5">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-600/20 to-orange-600/20 flex items-center justify-center ring-1 ring-yellow-500/20"
                    >
                      <Star size={8} className="text-yellow-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="flex-1 px-4 group/item">
              <div className="flex items-center gap-2 mb-0.5">
                <CoinIcon size={14} />
                <span className="text-sm text-gray-400">Balance</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  1,234
                </span>
                <span className="text-xs text-gray-500">XCE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          {/* Featured Content */}
          <div className="col-span-2 space-y-4">
            {/* Featured Project */}
            <div className="bg-[#2A2A3A] rounded-xl overflow-hidden group">
              <div className="relative aspect-video">
                <img 
                  src="https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=400&fit=crop"
                  alt="Featured project"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-lg font-bold mb-1">Latest Project</h3>
                    <p className="text-sm text-gray-300">Check out my recent work</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors">
                      <Heart size={16} />
                      <span>2.1k</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors">
                      <MessageCircle size={16} />
                      <span>128</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-1.5 text-gray-400 hover:text-purple-400 transition-colors">
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#2A2A3A] rounded-xl p-4">
              <h3 className="font-bold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                      <Star size={20} className="text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium hover:text-purple-400 cursor-pointer transition-colors">
                          {profile.username}
                        </span>
                        <span className="text-gray-400"> earned a new achievement</span>
                      </p>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements Showcase */}
          <div className="space-y-4">
            <div className="bg-[#2A2A3A] rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Latest Achievements</h3>
                <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i}
                    className="aspect-square bg-[#1E1E2A] rounded-lg p-3 hover:bg-[#2A2A3A] transition-colors cursor-pointer group"
                  >
                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                      <Trophy size={24} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-[#2A2A3A] rounded-xl p-4">
              <h3 className="font-bold mb-4">Creator Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Engagement Rate</span>
                    <span className="font-medium">8.9%</span>
                  </div>
                  <div className="h-2 bg-[#1E1E2A] rounded-full overflow-hidden">
                    <div className="h-full w-[89%] bg-gradient-to-r from-purple-600 to-blue-600 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Content Score</span>
                    <span className="font-medium">92/100</span>
                  </div>
                  <div className="h-2 bg-[#1E1E2A] rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-gradient-to-r from-green-600 to-emerald-600 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;