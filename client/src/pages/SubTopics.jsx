import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen,
  FileText,
  Video,
  Brain,
  ChevronDown,
  Play,
  Download,
  AlertTriangle,
  Plus,
  Edit,
  Trash,
  Upload,
  X,
  FileType,
  CheckCircle,
  Loader
} from 'lucide-react';

const Subtopics = ({ currUserRole }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [course, setCourse] = useState({});
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('subtopics');
  const [expandedSubtopic, setExpandedSubtopic] = useState(null);
 
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    title: '',
    pptLink: '',
    videoLink: '',
    quizId: null
  });
  const [editingSubtopicId, setEditingSubtopicId] = useState(null);

  // Upload states
  const [uploadLoading, setUploadLoading] = useState({
    ppt: false,
    video: false
  });
  const [uploadError, setUploadError] = useState({
    ppt: null,
    video: null
  });
  const [uploadProgress, setUploadProgress] = useState({
    ppt: 0,
    video: 0
  });
  const [selectedFiles, setSelectedFiles] = useState({
    ppt: null,
    video: null
  });

  // Maximum file size: 100MB in bytes
  const MAX_FILE_SIZE = 100 * 1024 * 1024;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch course details
        const courseRes = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
        setCourse(courseRes.data.data);
  
        // Fetch subtopics for this course
        const subtopicsRes = await axios.get(`http://localhost:5000/api/subtopics/course/${courseId}`);
        setSubtopics(subtopicsRes.data.data);
  
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        setLoading(false);
      }
    };
  
    if (courseId) {
      fetchData();
    }
  }, [courseId]);
  // Toggle subtopic expansion
  const toggleSubtopic = (id) => {
    if (expandedSubtopic === id) {
      setExpandedSubtopic(null);
    } else {
      setExpandedSubtopic(id);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quizId' ? (value ? parseInt(value, 10) : null) : value
    });
  };

  // File selection handler
  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError({
        ...uploadError,
        [type]: 'File size exceeds the 100MB limit'
      });
      return;
    }
    
    setSelectedFiles({
      ...selectedFiles,
      [type]: file
    });
    
    setUploadError({
      ...uploadError,
      [type]: null
    });
  };

  // File upload handler
  const handleFileUpload = async (type) => {
    if (!selectedFiles[type]) return;
    
    setUploadLoading({
      ...uploadLoading,
      [type]: true
    });
    
    setUploadProgress({
      ...uploadProgress,
      [type]: 0
    });
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[type]);
      
      const response = await axios.post('http://localhost:5000/api/cloudinary/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress({
            ...uploadProgress,
            [type]: percentCompleted
          });
        }
      });
      
      if (response.data.success) {
        setFormData({
          ...formData,
          [type === 'ppt' ? 'pptLink' : 'videoLink']: response.data.fileData.url
        });
        
        setUploadError({
          ...uploadError,
          [type]: null
        });
      }
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
      setUploadError({
        ...uploadError,
        [type]: err.response?.data?.message || `Failed to upload ${type}`
      });
    } finally {
      setUploadLoading({
        ...uploadLoading,
        [type]: false
      });
    }
  };

  // Cancel file selection
  const cancelFileSelection = (type) => {
    setSelectedFiles({
      ...selectedFiles,
      [type]: null
    });
    
    setUploadError({
      ...uploadError,
      [type]: null
    });
    
    setUploadProgress({
      ...uploadProgress,
      [type]: 0
    });
    
    // Reset file input
    if (type === 'ppt' && fileInputRef.current) {
      fileInputRef.current.value = '';
    } else if (type === 'video' && videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  // Get file name from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1].split('.')[0];
  };

  // Open create form
  const openCreateForm = () => {
    setFormData({
      title: '',
      pptLink: '',
      videoLink: '',
      quizId: null
    });
    setFormMode('create');
    setShowForm(true);
    setSelectedFiles({
      ppt: null,
      video: null
    });
    setUploadError({
      ppt: null,
      video: null
    });
    setUploadProgress({
      ppt: 0,
      video: 0
    });
  };

  // Open edit form
  const openEditForm = (subtopic) => {
    setFormData({
      title: subtopic.title,
      pptLink: subtopic.pptLink || '',
      videoLink: subtopic.videoLink || '',
      quizId: subtopic.quizId || null
    });
    setEditingSubtopicId(subtopic.id);
    setFormMode('edit');
    setShowForm(true);
    setSelectedFiles({
      ppt: null,
      video: null
    });
    setUploadError({
      ppt: null,
      video: null
    });
    setUploadProgress({
      ppt: 0,
      video: 0
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setError("Title is required");
      return;
    }

    try {
      if (formMode === 'create') {
        // Create new subtopic
        const res = await axios.post('http://localhost:5000/api/subtopics', {
          ...formData,
          title: formData.title || "Default Title", 
          courseId
        });

        // Add new subtopic to state
        setSubtopics([...subtopics, res.data.data]);
      } else {
        // Update existing subtopic
        const res = await axios.put(`http://localhost:5000/api/subtopics/${editingSubtopicId}`, formData);

        // Update subtopic in state
        setSubtopics(subtopics.map(st =>
          st.id === editingSubtopicId ? res.data.data : st
        ));
      }

      // Reset form
      setShowForm(false);
      setFormData({
        title: '',
        pptLink: '',
        videoLink: '',
        quizId: null
      });
      setEditingSubtopicId(null);
      setSelectedFiles({
        ppt: null,
        video: null
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'Failed to save subtopic');
    }
  };

  // Delete subtopic
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subtopic?')) {
      try {
        await axios.delete(`http://localhost:5000/api/subtopics/${id}`);

        // Remove from state
        setSubtopics(subtopics.filter(st => st.id !== id));
      } catch (err) {
        console.error('Error deleting subtopic:', err);
        setError(err.response?.data?.message || 'Failed to delete subtopic');
      }
    }
  };

  // Return to courses list
  const goBack = () => {
    navigate('/lms/courses');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertTriangle size={24} />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p className="mb-6">{error}</p>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Check if user can manage subtopics (admin, institute, faculty)
  const canManageSubtopics = ['admin', 'institute', 'faculty'].includes(currUserRole);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type display
  const getFileTypeDisplay = (file) => {
    if (!file) return '';
    
    const fileType = file.type.split('/')[0];
    if (fileType === 'image') return 'Image';
    if (fileType === 'video') return 'Video';
    if (fileType === 'application') {
      if (file.type.includes('pdf')) return 'PDF';
      if (file.type.includes('presentation') || file.type.includes('powerpoint')) return 'Presentation';
      return 'Document';
    }
    return 'File';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      {course && (
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4">
              <button
                onClick={goBack}
                className="text-white hover:text-blue-100 mb-4"
              >
                &larr; Back to Courses
              </button>
            </div>
            <h1 className="text-3xl font-bold mb-4">{course.name}</h1>
            <p className="mb-8 max-w-2xl">{course.description || 'No description available'}</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <BookOpen size={20} />
                <span>{subtopics.length} Subtopics</span>
              </div>
            </div>
          </div>
        </div>
      )}
  
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 border-b">
          <button
            onClick={() => setActiveTab('subtopics')}
            className={`px-6 py-3 text-sm font-medium relative focus:outline-none focus:ring-0 active:bg-transparent
              ${activeTab === 'subtopics' ? 'bg-slate-50' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Subtopics
            {activeTab === 'subtopics' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ternary-500" />
            )}
          </button>
  
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-6 py-3 text-sm font-medium relative focus:outline-none focus:ring-0 active:bg-transparent
              ${activeTab === 'materials' ? 'bg-slate-50' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Materials
            {activeTab === 'materials' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ternary-500" />
            )}
          </button>
  
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 text-sm font-medium relative focus:outline-none focus:ring-0 active:bg-transparent
              ${activeTab === 'videos' ? 'bg-slate-50' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Videos
            {activeTab === 'videos' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ternary-500" />
            )}
          </button>
  
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-6 py-3 text-sm font-medium relative focus:outline-none focus:ring-0 active:bg-transparent
              ${activeTab === 'quizzes' ? 'bg-slate-50' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Quizzes
            {activeTab === 'quizzes' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ternary-500" />
            )}
          </button>
        </div>
  
        {/* Add New Button (only for admin, institute, faculty) */}
        {canManageSubtopics && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2 bg-ternary-500 text-white rounded-lg hover:bg-ternary-600 transition-colors"
            >
              <Plus size={18} />
              Add New Subtopic
            </button>
          </div>
        )}
  
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}
  
        {/* Subtopic Form */}
        {showForm && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-ternary-500">
              {formMode === 'create' ? 'Add New Subtopic' : 'Edit Subtopic'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 mb-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-ternary-500"
                  />
                </div>
  
                {/* Presentation Upload */}
                <div>
                  <label htmlFor="pptLink" className="block text-sm font-medium text-gray-700 mb-1">
                    Presentation
                  </label>
                  
                  {/* Current presentation file */}
                  {formData.pptLink && !selectedFiles.ppt && (
                    <div className="mb-2 p-3 border rounded-md bg-purple-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={20} className="text-purple-500" />
                        <span className="text-sm">
                          {getFileNameFromUrl(formData.pptLink)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pptLink: '' })}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  
                  {/* File selection UI */}
                  {!formData.pptLink && !selectedFiles.ppt && (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                      <input
                        type="file"
                        id="pptUpload"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv,image/*"
                        onChange={(e) => handleFileSelect(e, 'ppt')}
                      />
                      <FileType size={32} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Drag & drop your presentation or
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-purple-100 text-purple-600 rounded-md text-sm hover:bg-purple-200"
                      >
                        Browse files
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Max file size: 100MB
                      </p>
                    </div>
                  )}
                  
                  {/* Selected file preview */}
                  {selectedFiles.ppt && (
                    <div className="border rounded-md overflow-hidden">
                      <div className="p-3 flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-2">
                          <FileType size={20} className="text-purple-500" />
                          <div>
                            <p className="text-sm font-medium">{selectedFiles.ppt.name}</p>
                            <p className="text-xs text-gray-500">
                              {getFileTypeDisplay(selectedFiles.ppt)} • {formatFileSize(selectedFiles.ppt.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => cancelFileSelection('ppt')}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      {/* Progress bar */}
                      {uploadLoading.ppt && (
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-purple-500 h-2.5 rounded-full"
                              style={{ width: `${uploadProgress.ppt}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Uploading: {uploadProgress.ppt}%
                          </p>
                        </div>
                      )}
                      
                      {/* Upload button */}
                      {!uploadLoading.ppt && (
                        <div className="p-3 bg-gray-50 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => handleFileUpload('ppt')}
                            className="w-full py-1.5 bg-ternary-500 text-white rounded-md hover:bg-ternary-600 flex items-center justify-center gap-2"
                            disabled={uploadLoading.ppt}
                          >
                            {uploadLoading.ppt ? (
                              <>
                                <Loader size={16} className="animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                Upload File
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Error message */}
                  {uploadError.ppt && (
                    <p className="text-red-500 text-sm mt-1">{uploadError.ppt}</p>
                  )}
                  
                  {/* Manual URL input */}
                  <div className="mt-2">
                    <label htmlFor="pptLink" className="block text-xs text-gray-500 mb-1">
                      Or enter presentation URL directly:
                    </label>
                    <input
                      type="text"
                      id="pptLink"
                      name="pptLink"
                      value={formData.pptLink}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-ternary-500"
                      placeholder="https://example.com/presentation.pdf"
                    />
                  </div>
                </div>
  
                {/* Video Upload */}
                <div>
                  <label htmlFor="videoLink" className="block text-sm font-medium text-gray-700 mb-1">
                    Video
                  </label>
                  
                  {/* Current video file */}
                  {formData.videoLink && !selectedFiles.video && (
                    <div className="mb-2 p-3 border rounded-md bg-purple-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video size={20} className="text-purple-500" />
                        <span className="text-sm">
                          {getFileNameFromUrl(formData.videoLink)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, videoLink: '' })}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  
                  {/* File selection UI */}
                  {!formData.videoLink && !selectedFiles.video && (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                      <input
                        type="file"
                        id="videoUpload"
                        ref={videoInputRef}
                        className="hidden"
                        accept="video/*"
                        onChange={(e) => handleFileSelect(e, 'video')}
                      />
                      <Video size={32} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Drag & drop your video or
                      </p>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="px-3 py-1 bg-purple-100 text-purple-600 rounded-md text-sm hover:bg-purple-200"
                      >
                        Browse files
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Max file size: 100MB
                      </p>
                    </div>
                  )}
                  
                  {/* Selected file preview */}
                  {selectedFiles.video && (
                    <div className="border rounded-md overflow-hidden">
                      <div className="p-3 flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-2">
                          <Video size={20} className="text-purple-500" />
                          <div>
                            <p className="text-sm font-medium">{selectedFiles.video.name}</p>
                            <p className="text-xs text-gray-500">
                              {getFileTypeDisplay(selectedFiles.video)} • {formatFileSize(selectedFiles.video.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => cancelFileSelection('video')}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      {/* Progress bar */}
                      {uploadLoading.video && (
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-purple-500 h-2.5 rounded-full"
                              style={{ width: `${uploadProgress.video}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Uploading: {uploadProgress.video}%
                          </p>
                        </div>
                      )}
                      
                      {/* Upload button */}
                      {!uploadLoading.video && (
                        <div className="p-3 bg-gray-50 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => handleFileUpload('video')}
                            className="w-full py-1.5 bg-ternary-500 text-white rounded-md hover:bg-ternary-600 flex items-center justify-center gap-2"
                            disabled={uploadLoading.video}
                          >
                            {uploadLoading.video ? (
                              <>
                                <Loader size={16} className="animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                Upload File
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Error message */}
                  {uploadError.video && (
                    <p className="text-red-500 text-sm mt-1">{uploadError.video}</p>
                  )}
                  
                  {/* Manual URL input */}
                  <div className="mt-2">
                    <label htmlFor="videoLink" className="block text-xs text-gray-500 mb-1">
                      Or enter video URL directly:
                    </label>
                    <input
                      type="text"
                      id="videoLink"
                      name="videoLink"
                      value={formData.videoLink}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-ternary-500"
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                </div>
  
                <div>
                  <label htmlFor="quizId" className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz ID
                  </label>
                  <input
                    type="text"
                    id="quizId"
                    name="quizId"
                    value={formData.quizId || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-ternary-500"
                  />
                </div>
              </div>
  
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-ternary-500 text-white rounded-md hover:bg-ternary-600"
                >
                  {formMode === 'create' ? 'Create Subtopic' : 'Update Subtopic'}
                </button>
              </div>
            </form>
          </div>
        )}
  
        {activeTab === 'subtopics' && (
          <div>
            {subtopics.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subtopics available</h3>
                <p className="text-gray-500 mb-6">There are no subtopics added to this course yet.</p>
                {canManageSubtopics && (
                  <button
                    onClick={openCreateForm}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-ternary-500 text-white rounded-lg hover:bg-ternary-600 transition-colors"
                  >
                    <Plus size={18} />
                    Add New Subtopic
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg divide-y">
                {subtopics.map((subtopic) => (
                  <div key={subtopic.id} className="p-0">
                    <div
                      className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${expandedSubtopic === subtopic.id ? 'bg-purple-50' : ''}`}
                      onClick={() => toggleSubtopic(subtopic.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${expandedSubtopic === subtopic.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <h3 className="font-medium">{subtopic.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canManageSubtopics && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditForm(subtopic);
                              }}
                              className="p-1.5 text-gray-500 hover:text-ternary-500 hover:bg-ternary-50 rounded-full"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(subtopic.id);
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full"
                            >
                              <Trash size={16} />
                            </button>
                          </>
                        )}
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 transition-transform ${expandedSubtopic === subtopic.id ? 'transform rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                    
                    {expandedSubtopic === subtopic.id && (
                      <div className="p-4 pt-0 pl-16 bg-gray-50">
                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                          {subtopic.pptLink && (
                            <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                              <div className="flex items-center gap-2 mb-3">
                                <FileText size={20} className="text-purple-500" />
                                <h4 className="font-medium">Presentation</h4>
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600 truncate max-w-xs">{getFileNameFromUrl(subtopic.pptLink)}</p>
                                <a
                                  href={subtopic.pptLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-600 rounded-md text-sm hover:bg-purple-200"
                                >
                                  <Download size={16} />
                                  Download
                                </a>
                              </div>
                            </div>
                          )}
                          
                          {subtopic.videoLink && (
                            <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Video size={20} className="text-purple-500" />
                                <h4 className="font-medium">Video Lecture</h4>
                              </div>
                              <a
                                href={subtopic.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-600 rounded-md text-sm hover:bg-purple-200 inline-block"
                              >
                                <Play size={16} />
                                Watch Video
                              </a>
                            </div>
                          )}
                          
                          {subtopic.quizId && (
                            <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Brain size={20} className="text-purple-500" />
                                <h4 className="font-medium">Quiz</h4>
                              </div>
                              <Link
                                to={`/lms/quiz/${subtopic.quizId}`}
                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-600 rounded-md text-sm hover:bg-purple-200 inline-block"
                              >
                                <Play size={16} />
                                Take Quiz
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
  
        {activeTab === 'materials' && (
          <div>
            {subtopics.filter(s => s.pptLink).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No materials available</h3>
                <p className="text-gray-500">There are no presentations or documents added to this course yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subtopics.filter(s => s.pptLink).map((subtopic) => (
                  <div key={subtopic.id} className="bg-white rounded-xl shadow-lg border border-transparent hover:border-ternary-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText size={20} className="text-ternary-500" />
                        <h3 className="font-medium">{subtopic.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 truncate">{getFileNameFromUrl(subtopic.pptLink)}</p>
                      <a
                        href={subtopic.pptLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 justify-center w-full px-3 py-2 bg-ternary-100 text-ternary-600 rounded-md hover:bg-ternary-200"
                      >
                        <Download size={18} />
                        Download Material
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
  
        {activeTab === 'videos' && (
          <div>
            {subtopics.filter(s => s.videoLink).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <Video size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No videos available</h3>
                <p className="text-gray-500">There are no video lectures added to this course yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subtopics.filter(s => s.videoLink).map((subtopic) => (
                  <div key={subtopic.id} className="bg-white rounded-xl shadow-lg border border-transparent hover:border-ternary-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 relative pt-[56.25%]">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
                          <Play size={36} className="text-purple-600 ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-3">{subtopic.title}</h3>
                      <a
                        href={subtopic.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 justify-center w-full px-3 py-2 bg-ternary-100 text-ternary-600 rounded-md hover:bg-ternary-200"
                      >
                        <Play size={18} />
                        Watch Video
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
  
        {activeTab === 'quizzes' && (
          <div>
            {subtopics.filter(s => s.quizId).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <Brain size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
                <p className="text-gray-500">There are no quizzes added to this course yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subtopics.filter(s => s.quizId).map((subtopic) => (
                  <div key={subtopic.id} className="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain size={20} className="text-purple-500" />
                        <h3 className="font-medium">{subtopic.title} Quiz</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Test your knowledge on this topic with a quiz
                      </p>
                      <Link
                        to={`/lms/quiz/${subtopic.quizId}`}
                        className="flex items-center gap-1 justify-center w-full px-3 py-2 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200"
                      >
                        <Play size={18} />
                        Start Quiz
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subtopics;