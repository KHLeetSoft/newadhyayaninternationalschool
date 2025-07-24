import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { loginSchoolAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [error, setError] = useState(null);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const fetchSchoolFromDatabase = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching school with slug:', slug);
        
        // Fetch school data from MongoDB using the slug from URL
        const schoolData = await apiService.getSchoolBySlug(slug);
        
        if (!schoolData) {
          throw new Error(`School with slug '${slug}' not found in database`);
        }
        
        if (!schoolData.isActive) {
          throw new Error('This school is currently inactive');
        }
        
        console.log('School found:', schoolData);
        setSchool(schoolData);
        
        // Store current school in localStorage for API calls
        localStorage.setItem('currentSchool', slug);
        localStorage.setItem('currentSchoolData', JSON.stringify(schoolData));
        
        // Pre-fill email if available
        if (schoolData.adminEmail) {
          setLoginData(prev => ({
            ...prev,
            email: schoolData.adminEmail
          }));
        }
        
      } catch (err) {
        console.error('Error fetching school from database:', err);
        setError(`School not found: ${err.message}. Please check the URL or contact administrator.`);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchSchoolFromDatabase();
    } else {
      setError('No school slug provided in URL');
      setLoading(false);
    }
  }, [slug]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setLoginLoading(true);
      setLoginError('');
      
      console.log('Attempting login for school:', slug);
      console.log('Login credentials:', { email: loginData.email, password: '***' });
      
      // Use AuthContext login method
      const result = await loginSchoolAdmin(slug, loginData.email, loginData.password);
      
      if (result.success) {
        console.log('Login successful');
        
        // Store admin session with school data
        localStorage.setItem('adminSession', JSON.stringify({
          type: 'schoolAdmin',
          school: school,
          user: {
            name: school?.name || 'Administrator',
            email: loginData.email,
            schoolSlug: slug,
            schoolId: school?._id
          },
          loginTime: new Date().toISOString()
        }));
        
        // Redirect to admin dashboard
        navigate(`/schools/${slug}/admin/dashboard`);
      } else {
        setLoginError(result.error || 'Login failed');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Invalid email or password. Please check your credentials and try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-login-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading school information from database...</p>
          <small>Checking for school: {slug}</small>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-login-page">
        <div className="error-container">
          <h2>School Not Found</h2>
          <p>{error}</p>
          <div className="error-details">
            <p><strong>URL Slug:</strong> {slug}</p>
            <p><strong>Status:</strong> Not found in database</p>
          </div>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="school-logo">
            <img 
              src={school?.logo ? `http://localhost:3004${school.logo}` : 'http://localhost:3004/uploads/default-logo.png'}
              alt="School Logo" 
              className="login-logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1>{school?.name}</h1>
          <p>Administrator Login</p>
          <div className="school-info">
            <p><strong>School ID:</strong> {school?._id}</p>
            <p><strong>Domain:</strong> {school?.domain}</p>
            <p><strong>Admin Email:</strong> {school?.adminEmail}</p>
            <p><strong>Status:</strong> <span className="status-active">Active</span></p>
          </div>
        </div>

        <div className="admin-login-form">
          <form onSubmit={handleLogin}>
            {loginError && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle"></i>
                {loginError}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginData.email}
                onChange={handleInputChange}
                placeholder="Enter admin email"
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                required
                className="form-control"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Logging in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Login
                </>
              )}
            </button>
          </form>
        </div>

        <div className="admin-login-footer">
          <p>Need help? Contact the system administrator</p>
          <a href="/" className="back-link">← Back to School Website</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 