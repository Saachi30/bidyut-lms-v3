import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, BookOpen, Trash2, Edit, Loader } from 'lucide-react';
import axios from 'axios';

const Faculties = ({ currUserRole }) => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState('All Institutes');
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    instituteId: '',
    grade: '',
    courseIds: []
  });

  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await axios.get(`${baseURL}api/faculties`);
        if (response.data.success) {
          setFaculties(response.data.data);
        } else {
          setError('Failed to fetch faculties data');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching faculties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  // Filter faculties based on search term and institute
  const filteredFaculties = faculties.filter((faculty) => {
    const matchesSearch =
      searchTerm === '' ||
      faculty.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faculty.phoneNumber && faculty.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesInstitute =
      selectedInstitute === 'All Institutes' || 
      (faculty.institute && faculty.institute.name === selectedInstitute) ||
      (faculty.instituteId && faculty.instituteId.toString() === selectedInstitute);

    return matchesSearch && matchesInstitute;
  });

  const handleAddFaculty = async () => {
    try {
      const response = await axios.post(`${baseURL}api/faculties`, newFaculty);
      if (response.data.success) {
        setFaculties([...faculties, response.data.data]);
        setIsAddModalOpen(false);
        setNewFaculty({
          name: '',
          email: '',
          password: '',
          phoneNumber: '',
          instituteId: '',
          grade: '',
          courseIds: []
        });
      }
    } catch (err) {
      console.error('Error adding faculty:', err);
      setError('Failed to add faculty. Please try again later.');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty?')) {
      try {
        const response = await axios.delete(`${baseURL}api/faculties/${id}`);
        if (response.data.success) {
          setFaculties(faculties.filter(faculty => faculty.id !== id));
        }
      } catch (err) {
        console.error('Error deleting faculty:', err);
        setError('Failed to delete faculty. Please try again later.');
      }
    }
  };

  const handleEditFaculty = (faculty) => {
    setEditingFaculty(faculty);
    // You would implement the edit modal and functionality here
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white min-h-screen ml-0 md:ml-4 lg:ml-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-ternary-500">Faculties Management</h1>
        {currUserRole === 'admin' || currUserRole === 'institute' ? (
          <button
            className="flex items-center justify-center space-x-2 px-4 py-2 md:px-6 md:py-3 bg-ternary-500 text-white rounded-xl transition-all duration-300 hover:bg-ternary-600 w-full md:w-auto"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            <span>Add Faculty</span>
          </button>
        ) : null}
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search faculties by name, email or phone..."
            className="w-full pl-12 pr-4 py-3 border rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-3 border rounded-xl bg-white w-full md:w-auto"
          value={selectedInstitute}
          onChange={(e) => setSelectedInstitute(e.target.value)}
        >
          <option value="All Institutes">All Institutes</option>
          {/* You would dynamically populate institute options here */}
        </select>
      </div>

      {/* Add Faculty Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Faculty</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newFaculty.name}
                onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newFaculty.email}
                onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newFaculty.password}
                onChange={(e) => setNewFaculty({ ...newFaculty, password: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newFaculty.phoneNumber}
                onChange={(e) => setNewFaculty({ ...newFaculty, phoneNumber: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <select
                value={newFaculty.instituteId}
                onChange={(e) => setNewFaculty({ ...newFaculty, instituteId: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Institute</option>
                {/* You would dynamically populate institute options here */}
              </select>
              <input
                type="text"
                placeholder="Grade"
                value={newFaculty.grade}
                onChange={(e) => setNewFaculty({ ...newFaculty, grade: e.target.value })}
                className="w-full p-2 border rounded"
              />
              {/* Course selection would be implemented here */}
              <div className="border rounded p-2">
                <label className="block mb-2 font-medium">Assigned Courses</label>
                {/* This would be a multi-select component or checkboxes for courses */}
                <p className="text-sm text-gray-500">
                  No courses available. They will be assignable after faculty creation.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end mt-6 space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFaculty}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto"
              >
                Add Faculty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-12 bg-gradient-to-r from-primary-100 to-secondary-100 p-4 md:p-6 font-semibold text-gray-700">
            <div className="col-span-1">ID</div>
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Email</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2">Institute</div>
            <div className="col-span-1">Grade</div>
            <div className="col-span-2">Actions</div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <Loader className="animate-spin h-8 w-8 mx-auto text-primary-500" />
              <p className="mt-2 text-gray-600">Loading faculties...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          ) : filteredFaculties.length > 0 ? (
            <div className="divide-y">
              {filteredFaculties.map((faculty) => (
                <div key={faculty.id} className="grid grid-cols-12 p-4 md:p-6 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 items-center text-sm md:text-base">
                  <div className="col-span-1 font-semibold text-primary-600">#{faculty.id}</div>
                  <div className="col-span-2 font-medium truncate">{faculty.name || 'N/A'}</div>
                  <div className="col-span-2 text-gray-600 truncate">{faculty.email || 'N/A'}</div>
                  <div className="col-span-2 text-gray-600 truncate">{faculty.phoneNumber || 'N/A'}</div>
                  <div className="col-span-2 text-gray-600 truncate">
                    {faculty.institute ? faculty.institute.name : (faculty.instituteId ? faculty.instituteId : 'Unassigned')}
                  </div>
                  <div className="col-span-1 text-gray-600">{faculty.grade || 'N/A'}</div>
                  <div className="col-span-2 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                    {currUserRole === 'admin' || currUserRole === 'institute' ? (
                      <>
                        <button
                          onClick={() => handleEditFaculty(faculty)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <Edit size={16} className="mr-1" />
                          <span className="hidden md:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteFaculty(faculty.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                        >
                          <Trash2 size={16} className="mr-1" />
                          <span className="hidden md:inline">Delete</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No faculties found matching your search criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Faculties;