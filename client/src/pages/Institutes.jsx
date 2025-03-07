import React, { useEffect, useState } from 'react';
import { Plus, X, School, Trash2, Edit, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const Institutes = () => {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    maxGrades: 0,
    maxStudents: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch institutes
  const fetchInstitutes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/institutes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInstitutes(response.data); // Updated to match the response structure
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching institutes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, []);

  // Handle input change
 // Handle input change
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prevState) => ({
    ...prevState,
    [name]: value,
  }));
};

// Handle form submissions
const handleAddInstitute = async (e) => {
  e.preventDefault();
  if (!formData.name || !formData.location) {
    setSubmitError('Please fill all required fields');
    return;
  }

  // Convert maxGrades and maxStudents to integers
  const data = {
    ...formData,
    maxGrades: parseInt(formData.maxGrades, 10),
    maxStudents: parseInt(formData.maxStudents, 10),
  };

  // Validate if the conversion resulted in valid numbers
  if (isNaN(data.maxGrades) || isNaN(data.maxStudents)) {
    setSubmitError('Max Grades and Max Students must be valid numbers');
    return;
  }

  try {
    setSubmitting(true);
    setSubmitError(null);

    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:5000/api/institutes', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data) {
      await fetchInstitutes();
      closeAllModals();
    } else {
      setSubmitError('Failed to add institute');
    }
  } catch (err) {
    setSubmitError(err.response?.data?.message || 'An error occurred while adding institute');
  } finally {
    setSubmitting(false);
  }
};

const handleUpdateInstitute = async (e) => {
  e.preventDefault();
  if (!formData.name || !formData.location) {
    setSubmitError('Please fill all required fields');
    return;
  }

  // Convert maxGrades and maxStudents to integers
  const data = {
    ...formData,
    maxGrades: parseInt(formData.maxGrades, 10),
    maxStudents: parseInt(formData.maxStudents, 10),
  };

  // Validate if the conversion resulted in valid numbers
  if (isNaN(data.maxGrades) || isNaN(data.maxStudents)) {
    setSubmitError('Max Grades and Max Students must be valid numbers');
    return;
  }

  try {
    setSubmitting(true);
    setSubmitError(null);

    const token = localStorage.getItem('token');
    const response = await axios.put(
      `http://localhost:5000/api/institutes/${selectedInstitute.id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data) {
      await fetchInstitutes();
      closeAllModals();
    } else {
      setSubmitError('Failed to update institute');
    }
  } catch (err) {
    setSubmitError(err.response?.data?.message || 'An error occurred while updating institute');
  } finally {
    setSubmitting(false);
  }
};

  // Open modals
  const openAddModal = () => {
    setFormData({ name: '', location: '', maxGrades: 0, maxStudents: 0 });
    setSubmitError(null);
    setShowAddModal(true);
  };

  const openUpdateModal = (institute) => {
    setSelectedInstitute(institute);
    setFormData({
      name: institute.name,
      location: institute.location,
      maxGrades: institute.maxGrades,
      maxStudents: institute.maxStudents,
    });
    setSubmitError(null);
    setShowUpdateModal(true);
  };

  const openDeleteModal = (institute) => {
    setSelectedInstitute(institute);
    setShowDeleteModal(true);
  };

  // Close all modals
  const closeAllModals = () => {
    setShowAddModal(false);
    setShowUpdateModal(false);
    setShowDeleteModal(false);
    setSelectedInstitute(null);
    setSubmitError(null);
  };

  // Handle form submissions


  const handleDeleteInstitute = async () => {
    try {
      setSubmitting(true);

      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:5000/api/institutes/${selectedInstitute.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        await fetchInstitutes();
        closeAllModals();
      } else {
        setSubmitError('Failed to delete institute');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'An error occurred while deleting institute');
    } finally {
      setSubmitting(false);
    }
  };

  // Modal component
  const Modal = ({ show, title, children, onClose }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full animate-fadeIn">
          <div className="flex justify-between items-center border-b border-gray-100 p-4">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ternary-500">Institutes</h1>
          {institutes.length > 0 && (
            <p className="text-gray-500 text-sm mt-1">
              Showing {institutes.length} educational institutions
            </p>
          )}
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-ternary-500 text-white rounded-lg hover:bg-ternary-600 shadow-sm"
        >
          <Plus size={18} />
          <span>Add Institute</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ternary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
          <p className="font-semibold">Error loading institutes</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : institutes.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <School className="text-gray-300 mx-auto mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-800">No Institutes Found</h3>
          <p className="text-gray-500 mt-1">Get started by adding an institute</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {institutes.map((institute) => (
            <div
              key={institute.id}
              className="bg-white rounded-xl shadow hover:shadow-md transition-all p-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all">
                    <School className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{institute.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-600 mt-1">
                      <span>📍 {institute.location}</span>
                      <span>📚 Max Grades: {institute.maxGrades}</span>
                      <span>🧑‍🎓 Max Students: {institute.maxStudents}</span>
                      <span>🕒 Last Updated: {new Date(institute.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                    Active
                  </span>
                  <button
                    onClick={() => openUpdateModal(institute)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-all"
                    aria-label="Edit institute"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(institute)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-all"
                    aria-label="Delete institute"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Institute Modal */}
      <Modal show={showAddModal} title="Add New Institute" onClose={closeAllModals}>
        <form onSubmit={handleAddInstitute}>
          {submitError && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {submitError}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Institute Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter institute name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ternary-300"
              autoComplete="off"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ternary-300"
              autoComplete="off"
              required
            />
          </div>
          <div className="mb-4">
  <label htmlFor="maxGrades" className="block text-sm font-medium text-gray-700 mb-1">
    Max Grades
  </label>
  <input
    type="number"
    id="maxGrades"
    name="maxGrades"
    value={formData.maxGrades}
    onChange={handleInputChange}
    placeholder="Enter max grades"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ternary-300"
    min="0"
    required
  />
</div>
<div className="mb-6">
  <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-1">
    Max Students
  </label>
  <input
    type="number"
    id="maxStudents"
    name="maxStudents"
    value={formData.maxStudents}
    onChange={handleInputChange}
    placeholder="Enter max students"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ternary-300"
    min="0"
    required
  />
</div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeAllModals}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-ternary-500 text-white rounded-md hover:bg-ternary-600 focus:outline-none focus:ring-2 focus:ring-ternary-300 disabled:opacity-70 flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Add Institute'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Institute Modal */}
      <Modal show={showUpdateModal} title="Update Institute" onClose={closeAllModals}>
        <form onSubmit={handleUpdateInstitute}>
          {submitError && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {submitError}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="update-name" className="block text-sm font-medium text-gray-700 mb-1">
              Institute Name *
            </label>
            <input
              type="text"
              id="update-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter institute name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ternary-300"
              autoComplete="off"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="update-location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              id="update-location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ternary-300"
              autoComplete="off"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="update-maxGrades" className="block text-sm font-medium text-gray-700 mb-1">
              Max Grades
            </label>
            <input
              type="number"
              id="update-maxGrades"
              name="maxGrades"
              value={formData.maxGrades}
              onChange={handleInputChange}
              placeholder="Enter max grades"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ternary-300"
              min="0"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="update-maxStudents" className="block text-sm font-medium text-gray-700 mb-1">
              Max Students
            </label>
            <input
              type="number"
              id="update-maxStudents"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleInputChange}
              placeholder="Enter max students"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ternary-300"
              min="0"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeAllModals}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-70 flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Institute'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} title="Confirm Deletion" onClose={closeAllModals}>
        <div className="p-2">
          {submitError && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {submitError}
            </div>
          )}
          <div className="flex items-center mb-4 bg-amber-50 p-3 rounded-md">
            <AlertTriangle className="text-amber-500 mr-3" size={24} />
            <div>
              <p className="font-medium text-gray-800">Are you sure you want to delete this institute?</p>
              <p className="text-sm text-gray-600 mt-1">
                You're about to delete <span className="font-semibold">{selectedInstitute?.name}</span>
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeAllModals}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteInstitute}
              disabled={submitting}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-70 flex items-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete Institute'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Institutes;