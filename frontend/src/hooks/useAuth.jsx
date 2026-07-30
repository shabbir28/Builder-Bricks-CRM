import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null,
};

const THEME_CHANGE = 'THEME_CHANGE';
const AUTH_START = 'AUTH_START';
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_FAILURE = 'AUTH_FAILURE';
const LOGOUT = 'LOGOUT';
const CLEAR_ERROR = 'CLEAR_ERROR';

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    darkMode: localStorage.getItem('theme') === 'dark',
  });

  // Theme effect - Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const toggleDarkMode = () => {
    // Disabled as we are now hard-themed to black
  };

  // Set up axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set token for the checkAuth call itself
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/api/auth/me');
          dispatch({
            type: AUTH_SUCCESS,
            payload: {
              user: response.data.data,
              token,
            },
          });
        } catch (error) {
          // Token is invalid or expired — clear everything so user can log in fresh
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          dispatch({
            type: AUTH_FAILURE,
            payload: error.response?.data?.message || 'Session expired. Please log in again.',
          });
        }
      } else {
        dispatch({ type: AUTH_SUCCESS, payload: { user: null, token: null } });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_START });
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { user, token } = response.data.data;
      
      // Set token immediately after successful login
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: { user, token },
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_START });
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { user, token } = response.data.data;
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: { user, token },
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: LOGOUT });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    toggleDarkMode,
    // Role helpers
    isSuperAdmin: () => state.user?.role === 'super_admin',
    isAdmin: () => ['super_admin', 'admin'].includes(state.user?.role),
    isExecutive: () => state.user?.role === 'executive',
    canDirectEditInstallments: () => ['super_admin', 'admin'].includes(state.user?.role),
    getRoleLabel: () => {
      const labels = { super_admin: 'Super Admin', admin: 'Admin', executive: 'Executive' };
      return labels[state.user?.role] || state.user?.role || 'User';
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
