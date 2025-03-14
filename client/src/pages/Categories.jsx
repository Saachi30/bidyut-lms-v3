import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, AlertTriangle, ChevronRight, Loader } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Categories = ({ currUserRole }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryCoursesLoading, setCategoryCoursesLoading] = useState(false);
  const [categoryCourses, setCategoryCourses] = useState([]);
  const [showCoursesDialog, setShowCoursesDialog] = useState(false);
  const [currentCategoryName, setCurrentCategoryName] = useState('');
  
  // Form state
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [editField, setEditField] = useState(null);
  
  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // Check if user can modify categories (admin or institute)
  const canModifyCategories = ['admin', 'institute'].includes(currUserRole);
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/categories');
      setCategories(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryCoursesById = async (categoryId) => {
    try {
      setCategoryCoursesLoading(true);
      const response = await axios.get(`/api/categories/${categoryId}`);
      setCategoryCourses(response.data.data.courses || []);
      setSelectedCategory(categoryId);
      
      // Set category name for the dialog title
      const category = categories.find(c => c.id === categoryId);
      setCurrentCategoryName(category?.name || '');
      
      // Show the courses dialog
      setShowCoursesDialog(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch category courses');
      console.error('Error fetching category courses:', err);
    } finally {
      setCategoryCoursesLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/categories/${currentCategoryId}`, formData);
      } else {
        await axios.post('/api/categories', formData);
      }
      
      // Refresh categories list
      fetchCategories();
      
      // Reset form
      setFormData({ name: '', description: '' });
      setShowDialog(false);
      setIsEditing(false);
      setCurrentCategoryId(null);
      setEditField(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      console.error('Error submitting category:', err);
    }
  };
  
  const handleEdit = (category, field = null) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setCurrentCategoryId(category.id);
    setIsEditing(true);
    setEditField(field);
    setShowDialog(true);
  };
  
  const handleDeletePrompt = (category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };
  
  const handleDelete = async () => {
    if (categoryToDelete) {
      try {
        await axios.delete(`/api/categories/${categoryToDelete.id}`);
        fetchCategories();
        setShowDeleteDialog(false);
        setCategoryToDelete(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete category');
        console.error('Error deleting category:', err);
        setShowDeleteDialog(false);
      }
    }
  };
  
  const handleViewCourses = (categoryId) => {
    fetchCategoryCoursesById(categoryId);
  };

  const handleNavigateToCourse = (courseId) => {
    navigate(`/lms/courses/${courseId}`);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen ml-4 md:ml-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-ternary-500">
          Categories
        </h1>
        
        {canModifyCategories && (
          <button 
            onClick={() => {
              setFormData({ name: '', description: '' });
              setIsEditing(false);
              setCurrentCategoryId(null);
              setEditField(null);
              setShowDialog(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-ternary-500 text-white rounded-lg transition-all duration-300 hover:bg-ternary-600 text-sm md:text-base"
          >
            <Plus size={18} />
            <span>Add Category</span>
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertTriangle className="mr-2" size={18} />
          <span className="text-sm md:text-base">{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-auto"
          >
            <X size={18} />
          </button>
        </div>
      )}
      
      {/* Add/Edit Category Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowDialog(false)}>
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold">
                {isEditing ? (
                  editField ? `Edit Category ${editField}` : 'Edit Category'
                ) : 'Add New Category'}
              </h2>
              <button 
                onClick={() => setShowDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium text-sm md:text-base">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ternary-300 text-sm md:text-base"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium text-sm md:text-base">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ternary-300 text-sm md:text-base"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-ternary-500 text-white rounded-lg hover:bg-ternary-600 text-sm md:text-base"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteDialog(false)}>
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Confirm Deletion</h2>
              <p className="text-gray-600 text-sm md:text-base">
                Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
              </p>
              {categoryToDelete && categoryToDelete._count && categoryToDelete._count.courses > 0 && (
                <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-xs md:text-sm">
                  <AlertTriangle size={18} className="inline-block mr-2" />
                  This category contains {categoryToDelete._count.courses} courses. You must remove or reassign these courses before deleting.
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm md:text-base"
                disabled={categoryToDelete && categoryToDelete._count && categoryToDelete._count.courses > 0}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Courses Dialog */}
      {showCoursesDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4" onClick={() => setShowCoursesDialog(false)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl h-4/5 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex-none bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 truncate">
                Courses in Category: {currentCategoryName}
              </h2>
              
              <button 
                onClick={() => setShowCoursesDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-grow overflow-auto p-4">
              {categoryCoursesLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-l-blue-600 border-r-blue-400 animate-spin"></div>
                    <Loader className="animate-pulse text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={16} />
                  </div>
                  <p className="mt-4 text-gray-600 font-medium text-sm md:text-base">Loading courses...</p>
                </div>
              ) : categoryCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle size={28} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-medium text-gray-700 mb-2">No courses found in this category</h3>
                  <p className="text-gray-500 text-sm md:text-base">Try checking another category or create new courses</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-12 bg-gray-100 p-3 font-semibold text-gray-700 rounded-lg text-xs md:text-sm">
                    <div className="col-span-1">No.</div>
                    <div className="col-span-5 md:col-span-3">Name</div>
                    <div className="hidden md:block md:col-span-3">Description</div>
                    <div className="hidden sm:block col-span-3 md:col-span-2">Institute</div>
                    <div className="col-span-3 md:col-span-2">Grade</div>
                    <div className="col-span-3 md:col-span-1">Topics</div>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    {categoryCourses.map((course, index) => (
                      <div 
                        key={course.id} 
                        className="grid grid-cols-12 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-300 items-center text-xs md:text-sm"
                        onClick={() => handleNavigateToCourse(course.id)}
                      >
                        <div className="col-span-1 font-semibold text-gray-600">{index + 1}</div>
                        <div className="col-span-5 md:col-span-3 font-medium text-blue-600 truncate">{course.name}</div>
                        <div className="hidden md:block md:col-span-3 text-gray-600 truncate">{course.description || 'No description'}</div>
                        <div className="hidden sm:block col-span-3 md:col-span-2 text-gray-600 truncate">{course.institute?.name || '-'}</div>
                        <div className="col-span-3 md:col-span-2 text-gray-600">{course.grade?.name || '-'}</div>
                        <div className="col-span-3 md:col-span-1 text-center">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {course._count?.subtopics || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-ternary-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600 text-sm md:text-base">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <h3 className="text-lg md:text-xl font-medium text-gray-700 mb-2">No categories found</h3>
          <p className="text-gray-500 text-sm md:text-base">
            {canModifyCategories 
              ? 'Click the "Add Category" button to create your first category.' 
              : 'Categories will appear here once they are created.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden transform transition-all duration-300">
            <div className="grid grid-cols-12 bg-gradient-to-r from-primary-100 to-secondary-100 p-3 md:p-4 font-semibold text-gray-700 text-xs md:text-sm">
              <div className="col-span-1">Sr.no</div>
              <div className="col-span-4 md:col-span-3">Name</div>
              <div className="col-span-5 md:col-span-6">Description</div>
              <div className="col-span-2 md:col-span-2">Courses</div>
            </div>

            {categories.map((category, index) => (
              <div
                key={category.id}
                className={`grid grid-cols-12 p-3 md:p-4 border-b hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 items-center relative ${selectedCategory === category.id ? 'bg-blue-50' : ''}`}
              >
                <div className="col-span-1 font-semibold text-primary-600 text-xs md:text-sm">{index + 1}</div>
                
                {/* Name column with edit option */}
                <div className="col-span-4 md:col-span-3 font-medium group relative text-xs md:text-sm">
                  <div className="truncate">{category.name}</div>
                  {canModifyCategories && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(category, 'Name');
                      }}
                      className="p-1 text-primary-500 hover:bg-primary-100 rounded-full absolute ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit Name"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
                
                {/* Description column with edit option */}
                <div className="col-span-5 md:col-span-6 text-gray-600 truncate group relative text-xs md:text-sm">
                  {category.description || 'No description'}
                  {canModifyCategories && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(category, 'Description');
                      }}
                      className="p-1 text-primary-500 hover:bg-primary-100 rounded-full absolute ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit Description"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
                
                {/* Courses column */}
                <div 
                  className="col-span-2 md:col-span-2 cursor-pointer group flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewCourses(category.id);
                  }}
                >
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full text-xs font-medium group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300">
                    {category._count?.courses || 0} courses
                  </span>
                  <ChevronRight size={14} className="hidden md:block ml-1 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Delete & Edit buttons */}
                {canModifyCategories && (
                  <div className="absolute right-2 md:right-4 flex space-x-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(category);
                      }}
                      className="p-1 text-primary-500 hover:bg-primary-100 rounded-full transition-all duration-300"
                      title="Edit Category"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePrompt(category);
                      }}
                      className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-all duration-300 z-10"
                      title="Delete Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;