import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save, X } from 'lucide-react';
import { useYoutubeStore } from '../../stores/youtubeStore';
import { YouTubeVideoData } from '../YouTubeVideo';

interface FormData {
  title: string;
  youtubeId: string;
  description: string;
  tags: string;
  thumbnail?: string;
}

const YoutubeVideoManager: React.FC = () => {
  const { videos, addVideo, removeVideo, updateVideo } = useYoutubeStore();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    youtubeId: '',
    description: '',
    tags: '',
    thumbnail: ''
  });
  const [editMode, setEditMode] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Update preview URL when YouTube ID changes
  useEffect(() => {
    if (formData.youtubeId.trim()) {
      setPreviewUrl(`https://img.youtube.com/vi/${formData.youtubeId}/mqdefault.jpg`);
    } else {
      setPreviewUrl('');
    }
  }, [formData.youtubeId]);

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
    if (!formData.youtubeId.trim()) newErrors.youtubeId = 'YouTube ID is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const videoData: YouTubeVideoData = {
      id: editMode || `yt-${Date.now()}`,
      title: formData.title.trim(),
      youtubeId: formData.youtubeId.trim(),
      description: formData.description.trim(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      thumbnail: formData.thumbnail && formData.thumbnail.trim() || undefined
    };
    
    if (editMode) {
      updateVideo(editMode, videoData);
    } else {
      addVideo(videoData);
    }
    
    resetForm();
  };

  const handleEdit = (video: YouTubeVideoData) => {
    setEditMode(video.id);
    setFormData({
      title: video.title,
      youtubeId: video.youtubeId,
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
      youtubeId: '',
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
        YouTube Video Manager
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
                YouTube Video ID <span className="text-cyber-pink">*</span>
              </label>
              <input
                type="text"
                name="youtubeId"
                value={formData.youtubeId}
                onChange={handleInputChange}
                placeholder="e.g. dQw4w9WgXcQ (from youtube.com/watch?v=dQw4w9WgXcQ)"
                className={`w-full bg-ui-dark border ${errors.youtubeId ? 'border-cyber-pink' : 'border-cyber-blue/30'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyber-blue`}
              />
              {errors.youtubeId && <p className="text-cyber-pink text-sm mt-1">{errors.youtubeId}</p>}
            </div>
            
            <div>
              <label className="block text-cyber-blue mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g. Netflix, Action, SciFi"
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
                placeholder="Leave blank to use YouTube's thumbnail"
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
                />
                <p className="text-center text-cyber-blue/70 text-sm">
                  Thumbnail Preview
                </p>
              </div>
            ) : (
              <div className="text-center text-cyber-blue/50">
                <p>Enter a YouTube ID to see thumbnail preview</p>
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
            className="px-4 py-2 flex items-center gap-2 bg-cyber-blue text-cyber-black font-medium rounded-md hover:bg-cyber-purple transition-colors"
          >
            {editMode ? <Save size={16} /> : <PlusCircle size={16} />}
            {editMode ? 'Update Video' : 'Add Video'}
          </button>
        </div>
      </form>

      {/* Video List */}
      <div>
        <h3 className="text-xl font-medium text-cyber-blue mb-4">Managed Videos</h3>
        
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
                  src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                  alt={video.title}
                  className="w-20 h-12 object-cover"
                />
                <div className="flex-1 px-4 py-2 truncate">
                  <h4 className="font-medium text-white truncate">{video.title}</h4>
                  <p className="text-xs text-cyber-blue/70 truncate">
                    ID: {video.youtubeId} • 
                    {video.tags && video.tags.length > 0 && (
                      <span> Tags: {video.tags.join(', ')}</span>
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

export default YoutubeVideoManager;
