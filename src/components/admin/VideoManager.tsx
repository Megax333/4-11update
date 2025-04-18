import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save, X } from 'lucide-react';
import { useYoutubeStore } from '../../stores/youtubeStore';
import { YouTubeVideoData } from '../YouTubeVideo';

interface FormData {
  title: string;
  videoUrl: string;
  description: string;
  tags: string;
  thumbnail?: string;
}

const VideoManager: React.FC = () => {
  const { videos, addVideo, removeVideo, updateVideo } = useYoutubeStore();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    videoUrl: '',
    description: '',
    tags: '',
    thumbnail: ''
  });
  const [editMode, setEditMode] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [detectedPlatform, setDetectedPlatform] = useState<string>('');

  // Check for video platform when URL changes
  useEffect(() => {
    if (!formData.videoUrl.trim()) {
      setPreviewUrl('');
      setDetectedPlatform('');
      return;
    }

    const url = formData.videoUrl;
    let platform = 'unknown';
    let id = '';
    
    // YouTube URL detection
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = 'YouTube';
      
      if (url.includes('v=')) {
        id = url.split('v=')[1]?.split('&')[0] || '';
      } else if (url.includes('youtu.be/')) {
        id = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('embed/')) {
        id = url.split('embed/')[1]?.split('?')[0] || '';
      }
      
      if (id) {
        setPreviewUrl(`https://img.youtube.com/vi/${id}/mqdefault.jpg`);
      } else {
        setPreviewUrl('');
      }
    } 
    // Vimeo URL detection
    else if (url.includes('vimeo.com')) {
      platform = 'Vimeo';
      id = url.split('vimeo.com/')[1]?.split('?')[0] || '';
      setPreviewUrl('https://placehold.co/480x360/1E1E2A/00e0ff?text=Vimeo+Video');
    }
    // Direct video file URL detection
    else if (url.match(/\.(mp4|webm|ogg)$/i)) {
      platform = 'Direct Video';
      setPreviewUrl('https://placehold.co/480x360/1E1E2A/00e0ff?text=Direct+Video');
    }
    // Other URL types
    else {
      platform = 'Unknown';
      setPreviewUrl('https://placehold.co/480x360/1E1E2A/00e0ff?text=Video+Link');
    }
    
    setDetectedPlatform(platform);
  }, [formData.videoUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.videoUrl.trim()) newErrors.videoUrl = 'Video URL is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    console.log('Form submission starting');
    
    try {
      // Extract video ID from URL if possible (for YouTube)
      let youtubeId = '';
      let platform: 'youtube' | 'vimeo' | 'other' = 'other';
      
      const url = formData.videoUrl;
      console.log('Processing video URL:', url);
      
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        platform = 'youtube';
        
        if (url.includes('v=')) {
          youtubeId = url.split('v=')[1]?.split('&')[0] || '';
        } else if (url.includes('youtu.be/')) {
          youtubeId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        } else if (url.includes('embed/')) {
          youtubeId = url.split('embed/')[1]?.split('?')[0] || '';
        }
        console.log('Detected YouTube video, ID:', youtubeId);
      } else if (url.includes('vimeo.com')) {
        platform = 'vimeo';
        youtubeId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
        console.log('Detected Vimeo video, ID:', youtubeId);
      }
      
      const videoData: YouTubeVideoData = {
        id: editMode || `video-${Date.now()}`,
        title: formData.title.trim(),
        videoUrl: formData.videoUrl.trim(),
        platform,
        youtubeId, // Keep for backward compatibility
        description: formData.description.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        thumbnail: formData.thumbnail && formData.thumbnail.trim() || undefined
      };
      
      console.log('Prepared video data:', videoData);
      
      if (editMode) {
        console.log('Updating existing video with ID:', editMode);
        await updateVideo(editMode, videoData);
        console.log('Video updated successfully');
      } else {
        console.log('Adding new video');
        await addVideo(videoData);
        console.log('Video added successfully');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error submitting video:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save video. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (video: YouTubeVideoData) => {
    setEditMode(video.id);
    setFormData({
      title: video.title,
      videoUrl: video.videoUrl || '',
      description: video.description || '',
      tags: (video.tags || []).join(', '),
      thumbnail: video.thumbnail || ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      removeVideo(id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      videoUrl: '',
      description: '',
      tags: '',
      thumbnail: ''
    });
    setEditMode(null);
    setErrors({});
  };

  return (
    <div className="bg-cyber-dark p-6 rounded-xl">
      <h2 className="text-2xl font-semibold text-cyber-blue mb-6">
        Video Library Manager
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-cyber-blue mb-1">
                Video Title <span className="text-cyber-pink">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full bg-ui-dark border ${errors.title ? 'border-cyber-pink' : 'border-cyber-blue/30'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyber-blue`}
              />
              {errors.title && <p className="text-cyber-pink text-sm mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <label className="block text-cyber-blue mb-1">
                Video URL <span className="text-cyber-pink">*</span>
              </label>
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                className={`w-full bg-ui-dark border ${errors.videoUrl ? 'border-cyber-pink' : 'border-cyber-blue/30'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyber-blue`}
              />
              {detectedPlatform && (
                <p className="text-cyber-blue/70 text-xs mt-1">
                  Detected: {detectedPlatform} video
                </p>
              )}
              {errors.videoUrl && <p className="text-cyber-pink text-sm mt-1">{errors.videoUrl}</p>}
            </div>
            
            <div>
              <label className="block text-cyber-blue mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Action, Comedy, SciFi, etc."
                className="w-full bg-ui-dark border border-cyber-blue/30 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyber-blue"
              />
            </div>
            
            <div>
              <label className="block text-cyber-blue mb-1">
                Custom Thumbnail URL (optional)
              </label>
              <input
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-ui-dark border border-cyber-blue/30 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyber-blue"
              />
            </div>
            
            <div>
              <label className="block text-cyber-blue mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-ui-dark border border-cyber-blue/30 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyber-blue"
              />
            </div>
          </div>
          
          {/* Thumbnail Preview */}
          <div className="flex flex-col items-center justify-center bg-ui-dark border border-cyber-blue/30 rounded-md p-4">
            {previewUrl ? (
              <div className="space-y-4">
                <img 
                  src={previewUrl} 
                  alt="Thumbnail Preview"
                  className="max-w-full h-auto rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/480x360/1E1E2A/00e0ff?text=Video+Preview';
                  }}
                />
                <p className="text-center text-cyber-blue/70 text-sm">
                  Thumbnail Preview
                </p>
              </div>
            ) : (
              <div className="text-center text-cyber-blue/50">
                <p>Enter a video URL to see thumbnail preview</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          {editMode && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 flex items-center gap-2 bg-ui-dark text-cyber-blue border border-cyber-blue/30 rounded-md hover:bg-ui-highlight transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 flex items-center gap-2 bg-cyber-blue text-cyber-black font-medium rounded-md hover:bg-cyber-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-cyber-black border-t-transparent rounded-full"></div>
                {editMode ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                {editMode ? <Save size={16} /> : <PlusCircle size={16} />}
                {editMode ? 'Update Video' : 'Add Video'}
              </>
            )}
          </button>
        </div>
        
        {submitError && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-white">
            <p className="text-sm">{submitError}</p>
          </div>
        )}
      </form>

      {/* Video List */}
      <div>
        <h3 className="text-xl font-medium text-cyber-blue mb-4">Video Library</h3>
        
        <div className="space-y-3">
          {videos.length === 0 ? (
            <p className="text-cyber-blue/50 text-center py-6">No videos added yet</p>
          ) : (
            videos.map(video => (
              <div 
                key={video.id} 
                className={`flex items-center bg-ui-dark rounded-md overflow-hidden ${editMode === video.id ? 'ring-2 ring-cyber-purple' : ''}`}
              >
                <img 
                  src={video.thumbnail || (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg` : 'https://placehold.co/480x360/1E1E2A/00e0ff?text=Video')} 
                  alt={video.title}
                  className="w-20 h-12 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/480x360/1E1E2A/00e0ff?text=Video';
                  }}
                />
                <div className="flex-1 px-4 py-2 truncate">
                  <h4 className="font-medium text-white truncate">{video.title}</h4>
                  <p className="text-xs text-cyber-blue/70 truncate">
                    {video.platform || 'Video'}
                    {video.tags && video.tags.length > 0 && (
                      <span> • Tags: {video.tags.join(', ')}</span>
                    )}
                  </p>
                </div>
                <div className="flex space-x-2 px-4">
                  <button
                    onClick={() => handleEdit(video)}
                    className="p-1.5 text-cyber-blue hover:text-cyber-purple transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-1.5 text-cyber-pink hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoManager;
