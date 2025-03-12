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
    phoneNumber: '',
    institute: '',
    grade: '',
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
      selectedInstitute === 'All Institutes' || faculty.institute === selectedInstitute;

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
          phoneNumber: '',
          institute: '',
          grade: '',
        });
      }
    } catch (err) {
      console.error('Error adding faculty:', err);
      setError('Failed to add faculty. Please try again later.');
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex space-x-8 items-center mb-8">
        <h1 className="text-4xl font-bold text-ternary-500">Faculties Management</h1>
        {currUserRole === 'admin' || currUserRole === 'institute' ? (
          <button
            className="flex items-center space-x-2 px-6 py-3 bg-ternary-500 text-white rounded-xl transition-all duration-300 hover:bg-ternary-600"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            <span>Add Faculty</span>
          </button>
        ) : null}
      </div>

      {/* Add Faculty Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h2 className="text-xl font-bold mb-4">Add New Faculty</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newFaculty.name}
                onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={newFaculty.email}
                onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newFaculty.phoneNumber}
                onChange={(e) => setNewFaculty({ ...newFaculty, phoneNumber: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Institute"
                value={newFaculty.institute}
                onChange={(e) => setNewFaculty({ ...newFaculty, institute: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Grade"
                value={newFaculty.grade}
                onChange={(e) => setNewFaculty({ ...newFaculty, grade: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="mr-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFaculty}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Faculty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-12 bg-gradient-to-r from-primary-100 to-secondary-100 p-6 font-semibold text-gray-700">
          <div className="col-span-1">ID</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-2">Email</div>
          <div className="col-span-2">Phone</div>
          <div className="col-span-2">Institute</div>
          <div className="col-span-1">Grade</div>
          <div className="col-span-2">Actions</div>
        </div>
        {filteredFaculties.length > 0 ? (
          filteredFaculties.map((faculty) => (
            <div key={faculty.id} className="grid grid-cols-12 p-6 border-b hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 items-center">
              <div className="col-span-1 font-semibold text-primary-600">#{faculty.id}</div>
              <div className="col-span-2 font-medium">{faculty.name || 'N/A'}</div>
              <div className="col-span-2 text-gray-600">{faculty.email || 'N/A'}</div>
              <div className="col-span-2 text-gray-600">{faculty.phoneNumber || 'N/A'}</div>
              <div className="col-span-2 text-gray-600">{faculty.institute || 'Unassigned'}</div>
              <div className="col-span-1 text-gray-600">{faculty.grade || 'N/A'}</div>
              <div className="col-span-2">
                {currUserRole === 'admin' || currUserRole === 'institute' ? (
                  <>
                    <button
                      onClick={() => handleEditFaculty(faculty)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFaculty(faculty.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No faculties found matching your search criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default Faculties;