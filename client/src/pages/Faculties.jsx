import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Mail, Phone, BookOpen, Settings, X, ChevronRight, User, MapPin, Calendar, Trash2, AlertTriangle, Loader } from 'lucide-react';
import axios from 'axios';

const Faculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState('All Institutes');

  const baseURL = import.meta.env.VITE_BASE_URL;
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        // Get token from localStorage or wherever you store it
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`${baseURL}api/users/faculties/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          // Transform the API data to match the component's expected structure
          const transformedData = response.data.data.map(faculty => ({
            id: faculty.id,
            name: faculty.name,
            mobile: faculty.phoneNumber || 'N/A',
            email: faculty.email,
            password: '********',
            status: faculty.status || 'Active',
            institute: faculty.institute ? faculty.institute.name : 'Unassigned',
            city: faculty.city,
            state: faculty.state,
            createdAt: new Date(faculty.createdAt).toLocaleDateString()
          }));
          
          setFaculties(transformedData);
        }
      } catch (err) {
        console.error('Error fetching faculties:', err);
        setError('Failed to load faculties data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  // Get unique institutes for filter dropdown
  const institutes = ['All Institutes', ...Array.from(new Set(faculties.map(f => f.institute)))];
  
  // Filter faculties based on search and institute filter
  const filteredFaculties = faculties.filter(faculty => {
    const matchesSearch = searchTerm === '' || 
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.mobile.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesInstitute = selectedInstitute === 'All Institutes' || faculty.institute === selectedInstitute;
    
    return matchesSearch && matchesInstitute;
  });

  // Group faculties by institute for display
  const groupedFaculties = selectedInstitute === 'All Institutes' 
    ? Array.from(new Set(filteredFaculties.map(f => f.institute)))
    : [selectedInstitute];

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex space-x-8 items-center mb-8">
        <h1 className="text-4xl font-bold text-ternary-500">
          Faculties Management
        </h1>
        
        <button 
          className="flex items-center space-x-2 px-6 py-3 bg-ternary-500 text-white rounded-xl transition-all duration-300 hover:bg-ternary-600"
        >
          <Plus size={20} />
          <span>Add Faculty</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertTriangle className="mr-2" size={20} />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-auto"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Search and Filters Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-5 justify-between items-start lg:items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email or mobile..."
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ternary-300 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
              <Filter size={18} />
              <span>Filters</span>
            </button>
            <select 
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ternary-300 bg-white pr-8"
              value={selectedInstitute}
              onChange={(e) => setSelectedInstitute(e.target.value)}
            >
              {institutes.map(institute => (
                <option key={institute} value={institute}>{institute}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-10">
          <div className="relative">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-ternary-500 border-r-transparent"></div>
          </div>
          <p className="mt-2 text-gray-600">Loading faculties data...</p>
        </div>
      ) : filteredFaculties.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="flex justify-center">
            <User size={64} className="text-gray-300" />
          </div>
          <h3 className="mt-4 text-xl font-medium text-gray-800">No Faculties Found</h3>
          <p className="mt-2 text-gray-600">
            {searchTerm ? "No faculties match your search criteria." : "There are no faculties available."}
          </p>
          <button className="mt-6 px-6 py-2 bg-ternary-500 text-white rounded-lg hover:bg-ternary-600 transition-all">
            Add New Faculty
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {groupedFaculties.map(institute => (
            <div key={institute} className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:shadow-xl transition-all duration-300">
              {/* Institute Header */}
              <div className="bg-gradient-to-r from-primary-100 to-secondary-100 p-6 border-b">
                <div className="flex items-center space-x-3">
                  <BookOpen size={20} className="text-primary-600" />
                  <h3 className="font-semibold text-primary-700 text-lg">{institute}</h3>
                  <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {filteredFaculties.filter(f => f.institute === institute).length} members
                  </span>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 bg-gradient-to-r from-gray-50 to-gray-100 p-6 font-semibold text-gray-700">
                <div className="col-span-1">Sr.no</div>
                <div className="col-span-2">Name</div>
                <div className="col-span-2">Contact</div>
                <div className="col-span-2">Email</div>
                <div className="col-span-2">Institute</div>
                <div className="col-span-1">Location</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>

              {/* Faculty Rows */}
              <div className="divide-y divide-gray-100">
                {filteredFaculties
                  .filter(faculty => faculty.institute === institute)
                  .map((faculty, index) => (
                    <div
                      key={faculty.id}
                      className="grid grid-cols-12 p-6 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 group items-center"
                    >
                      <div className="col-span-1 font-semibold text-primary-600">#{faculty.id}</div>
                      <div className="col-span-2 font-medium text-gray-800">{faculty.name}</div>
                      <div className="col-span-2 text-gray-600 flex items-center">
                        <Phone size={16} className="mr-2 text-gray-400" />
                        {faculty.mobile}
                      </div>
                      <div className="col-span-2 text-gray-600 flex items-center">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        {faculty.email}
                      </div>
                      <div className="col-span-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                          {faculty.institute}
                        </span>
                      </div>
                      <div className="col-span-1 text-gray-600 text-sm flex items-center">
                        <MapPin size={14} className="mr-1 text-gray-400" />
                        {faculty.city}
                      </div>
                      <div className="col-span-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          faculty.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {faculty.status}
                        </span>
                      </div>
                      <div className="col-span-1 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center space-x-1">
                        <button className="p-2 text-primary-500 hover:bg-primary-100 rounded-lg transition-all duration-300" title="Edit">
                          <Settings size={16} />
                        </button>
                        <button className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-300" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Section */}
      {!loading && !error && filteredFaculties.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 bg-white rounded-xl shadow-md p-4">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            Showing 1 to {filteredFaculties.length} of {faculties.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-2 bg-ternary-500 text-white rounded-lg">1</button>
            <button className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculties;