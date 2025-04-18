import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { YouTubeVideoData } from '../components/YouTubeVideo';
import { supabase } from '../lib/supabase';

// Define video category types for featured sections
export type VideoCategory = 
  | 'trending'
  | 'new'
  | 'action'
  | 'comedy'
  | 'documentary'
  | 'music'
  | 'original';

// Featured video entry that links a video to a category
export interface FeaturedVideo {
  videoId: string;
  category: VideoCategory;
  position: number;
}

type YoutubeStoreState = {
  videos: YouTubeVideoData[];
  featuredVideos: Record<VideoCategory, YouTubeVideoData[]>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchVideos: () => Promise<void>;
  addVideo: (video: YouTubeVideoData) => void;
  updateVideo: (id: string, updatedVideo: YouTubeVideoData) => void;
  removeVideo: (id: string) => void;
  featureVideo: (videoId: string, category: VideoCategory) => void;
  unfeatureVideo: (videoId: string, category: VideoCategory) => void;
  moveFeaturedVideo: (videoId: string, category: VideoCategory, direction: 'up' | 'down') => void;
  getFeaturedVideos: (category: VideoCategory) => YouTubeVideoData[];
};

// Create the store with persistence
export const useYoutubeStore = create<YoutubeStoreState>()(
  persist(
    (set, get) => ({
      videos: [],
      featuredVideos: {
        trending: [],
        new: [],
        action: [],
        comedy: [],
        documentary: [],
        music: [],
        original: []
      },
      isLoading: false,
      error: null,
      
      fetchVideos: async () => {
        set({ isLoading: true, error: null });
        try {
          console.log('Fetching videos from Supabase...');
          
          // STEP 1: Fetch all videos from 'videos' table
          const { data: videosData, error: videosError } = await supabase
            .from('videos')
            .select('*');
          
          if (videosError) throw videosError;
          
          // Process the video data to standardize format
          const processedVideos = videosData?.map(video => ({
            id: video.id,
            title: video.title,
            videoUrl: video.video_url,
            video_url: video.video_url,
            platform: video.platform,
            youtubeId: video.youtube_id,
            youtube_id: video.youtube_id,
            description: video.description,
            tags: video.tags || [],
            thumbnail: video.thumbnail
          })) || [];
          
          console.log(`Fetched ${processedVideos.length} videos from database`);
          
          // STEP 2: Fetch featured videos from 'featured_videos' table
          const { data: featuredData, error: featuredError } = await supabase
            .from('featured_videos')
            .select('*')
            .order('position');
          
          if (featuredError) throw featuredError;
          
          console.log(`Fetched ${featuredData?.length || 0} featured video entries`);
          
          // STEP 3: Organize videos by category - simplified approach
          const featuredByCategory: Record<VideoCategory, YouTubeVideoData[]> = {
            trending: [],
            new: [],
            action: [],
            comedy: [],
            documentary: [],
            music: [],
            original: []
          };
          
          // Map featured videos to their full data
          if (featuredData && processedVideos.length > 0) {
            featuredData.forEach(featured => {
              const video = processedVideos.find(v => v.id === featured.video_id);
              if (video && featured.category) {
                const category = featured.category as VideoCategory;
                if (featuredByCategory[category]) {
                  featuredByCategory[category].push({
                    ...video,
                    featuredPosition: featured.position
                  });
                }
              }
            });
            
            // Sort each category by position
            Object.keys(featuredByCategory).forEach(cat => {
              featuredByCategory[cat as VideoCategory].sort((a, b) => 
                (a.featuredPosition || 0) - (b.featuredPosition || 0)
              );
            });
          }
          
          // Log what we're storing in each category
          Object.entries(featuredByCategory).forEach(([category, videos]) => {
            console.log(`Category ${category}: ${videos.length} videos`);
            videos.forEach(v => console.log(`  - ${v.title} (ID: ${v.id})`, v));
          });
          
          // Update state with all the data
          set({
            videos: processedVideos,
            featuredVideos: featuredByCategory,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Error fetching videos:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch videos',
            isLoading: false
          });
        }
      },
      
      addVideo: async (video) => {
        set({ isLoading: true, error: null });
        console.log('youtubeStore: Adding video to Supabase', video);
        try {
          // Make sure we have a valid id
          if (!video.id) {
            video.id = `video-${Date.now()}`;
          }
          
          // Prepare video object for Supabase that matches the Supabase schema
          // No need to extract the id as we'll let Supabase generate it
          
          // Create the object matching exactly what Supabase expects
          // The column names must match EXACTLY with your Supabase schema
          const newVideo = {
            // Remove the 'id' field and let Supabase generate it
            title: video.title,
            video_url: video.videoUrl, // Changed to match snake_case convention in DB
            platform: video.platform || 'youtube',
            youtube_id: video.youtubeId || '', // Changed to match snake_case convention in DB
            description: video.description || '',
            tags: video.tags || [],
            thumbnail: video.thumbnail || ''
            // Let Supabase handle the timestamps
          };
          
          console.log('youtubeStore: Prepared video for Supabase', newVideo);
          
          // Insert video into Supabase
          const { data, error } = await supabase
            .from('videos')
            .insert(newVideo)
            .select()
            .single();
          
          if (error) {
            console.error('Supabase error inserting video:', error);
            throw error;
          }
          
          console.log('youtubeStore: Successfully added video to Supabase', data);
          
          // Update local state with the new video (use the returned data which has proper timestamps)
          set(state => {
            console.log('youtubeStore: Updating local state with new video');
            return {
              videos: [...state.videos, data],
              isLoading: false
            };
          });
          
          console.log('youtubeStore: Video added successfully');
        } catch (error) {
          console.error('Error adding video:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add video', 
            isLoading: false 
          });
          throw error; // Re-throw to allow component to handle
        }
      },
      
      updateVideo: async (id, updatedVideo) => {
        set({ isLoading: true, error: null });
        console.log('Updating video with ID:', id);
        console.log('Updated video data:', updatedVideo);
        
        try {
          // Format data for Supabase with snake_case
          const supabaseData = {
            title: updatedVideo.title,
            description: updatedVideo.description || '',
            video_url: updatedVideo.videoUrl,   // Convert camelCase to snake_case
            youtube_id: updatedVideo.youtubeId, // Convert camelCase to snake_case
            platform: updatedVideo.platform || 'youtube',
            tags: updatedVideo.tags || [],
            thumbnail: updatedVideo.thumbnail || null,
            updated_at: new Date().toISOString()
          };
          
          console.log('Formatted data for Supabase:', supabaseData);
          
          // Update video in Supabase
          const { error } = await supabase
            .from('videos')
            .update(supabaseData)
            .eq('id', id);
          
          if (error) {
            console.error('Supabase update error:', error);
            throw error;
          }
          
          console.log('Supabase update successful');
          
          // Update local state with full data
          set(state => {
            console.log('Updating local state');
            return {
              videos: state.videos.map(video => {
                if (video.id === id) {
                  // Keep both camelCase and snake_case versions for compatibility
                  return {
                    ...updatedVideo,
                    video_url: updatedVideo.videoUrl,
                    youtube_id: updatedVideo.youtubeId
                  };
                }
                return video;
              }),
              isLoading: false
            };
          });
          
          console.log('Local state updated successfully');
        } catch (error) {
          console.error('Error updating video:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update video', 
            isLoading: false 
          });
        }
      },
      
      removeVideo: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // First, remove any featured entries for this video
          const { error: featuredError } = await supabase
            .from('featured_videos')
            .delete()
            .eq('video_id', id);
          
          if (featuredError) throw featuredError;
          
          // Then remove the video itself
          const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          // Update local state
          set(state => {
            // Also remove from featured videos in local state
            const updatedFeatured = Object.fromEntries(
              Object.entries(state.featuredVideos).map(([category, videos]) => [
                category,
                videos.filter(video => video.id !== id)
              ])
            ) as Record<VideoCategory, YouTubeVideoData[]>;
            
            return {
              videos: state.videos.filter(video => video.id !== id),
              featuredVideos: updatedFeatured,
              isLoading: false
            };
          });
        } catch (error) {
          console.error('Error removing video:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to remove video', 
            isLoading: false 
          });
        }
      },
      
      featureVideo: async (videoId, category) => {
        set({ isLoading: true, error: null });
        try {
          // First check if video already exists in this category
          const { data: existingFeatured, error: checkError } = await supabase
            .from('featured_videos')
            .select('*')
            .eq('video_id', videoId)
            .eq('category', category);
          
          if (checkError) throw checkError;
          
          // If it exists, we'll remove it first
          if (existingFeatured && existingFeatured.length > 0) {
            const { error: deleteError } = await supabase
              .from('featured_videos')
              .delete()
              .eq('video_id', videoId)
              .eq('category', category);
              
            if (deleteError) throw deleteError;
            
            // Update local state to remove the video from this category
            set(state => ({
              featuredVideos: {
                ...state.featuredVideos,
                [category]: state.featuredVideos[category].filter(video => video.id !== videoId)
              },
              isLoading: false
            }));
            
            return; // Exit after removing
          }
          
          // Get max position for the category
          const { data: positionData, error: positionError } = await supabase
            .from('featured_videos')
            .select('position')
            .eq('category', category)
            .order('position', { ascending: false })
            .limit(1);
            
          if (positionError) throw positionError;
          
          const position = positionData && positionData.length > 0 ? positionData[0].position + 1 : 0;
          
          // Add new featured entry
          const { error: insertError } = await supabase
            .from('featured_videos')
            .insert([{
              video_id: videoId,
              category,
              position
            }]);
            
          if (insertError) throw insertError;
          
          // Update local state
          const videoToFeature = get().videos.find(video => video.id === videoId);
          if (!videoToFeature) {
            throw new Error('Video not found in local state');
          }
          
          set(state => ({
            featuredVideos: {
              ...state.featuredVideos,
              [category]: [...state.featuredVideos[category], videoToFeature]
            },
            isLoading: false
          }));
        } catch (error) {
          console.error('Error featuring video:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to feature video', 
            isLoading: false 
          });
        }
      },
      
      unfeatureVideo: async (videoId, category) => {
        set({ isLoading: true, error: null });
        try {
          // Remove from Supabase
          const { error } = await supabase
            .from('featured_videos')
            .delete()
            .eq('video_id', videoId)
            .eq('category', category);
            
          if (error) throw error;
          
          // Update local state
          set(state => ({
            featuredVideos: {
              ...state.featuredVideos,
              [category]: state.featuredVideos[category].filter(video => video.id !== videoId)
            },
            isLoading: false
          }));
        } catch (error) {
          console.error('Error unfeaturing video:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to unfeature video', 
            isLoading: false 
          });
        }
      },
      
      moveFeaturedVideo: async (videoId, category, direction) => {
        set({ isLoading: true, error: null });
        try {
          // Get all featured videos in this category
          const { data: featuredData, error: featuredError } = await supabase
            .from('featured_videos')
            .select('*')
            .eq('category', category)
            .order('position');
            
          if (featuredError) throw featuredError;
          
          if (!featuredData || featuredData.length === 0) {
            throw new Error('No featured videos found in this category');
          }
          
          // Find the video we want to move
          const videoIndex = featuredData.findIndex(item => item.video_id === videoId);
          if (videoIndex === -1) {
            throw new Error('Video not found in this category');
          }
          
          // Calculate new index based on direction
          const newVideoIndex = direction === 'up' ? videoIndex - 1 : videoIndex + 1;
          
          // Check if the move is valid
          if (newVideoIndex < 0 || newVideoIndex >= featuredData.length) {
            // Can't move past the edges
            set({ isLoading: false });
            return;
          }
          
          // Get the items we're swapping positions for
          const videoItem = featuredData[videoIndex];
          const swapItem = featuredData[newVideoIndex];
          
          // Swap positions
          const videoPosition = videoItem.position;
          const swapPosition = swapItem.position;
          
          // Update positions in database
          const updates = [
            { id: videoItem.id, position: swapPosition },
            { id: swapItem.id, position: videoPosition }
          ];
          
          // Update both items
          const { error: updateError } = await supabase
            .from('featured_videos')
            .upsert(updates);
            
          if (updateError) throw updateError;
          
          // Update local state
          set(state => {
            const videos = [...state.featuredVideos[category]];
            [videos[videoIndex], videos[newVideoIndex]] = [videos[newVideoIndex], videos[videoIndex]];
            
            return {
              featuredVideos: {
                ...state.featuredVideos,
                [category]: videos
              },
              isLoading: false
            };
          });
        } catch (error) {
          console.error('Error moving featured video:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to move video', 
            isLoading: false 
          });
        }
      },
      

      getFeaturedVideos: (category) => {
        return get().featuredVideos[category] || [];
      }
    }),
    {
      name: 'celflicks-youtube-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
