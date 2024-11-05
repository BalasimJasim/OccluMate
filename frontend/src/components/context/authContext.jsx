import { createContext, useReducer, useEffect } from 'react';
import api from '../../api';
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: () => {}, 
  logout: () => {}
});

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isLoggedIn: true,
        user: action.user
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        user: null
      };
    default:
      return state;
  }
};

const getUserFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, {
    isLoggedIn: false,
    user: null
  });

  // Check localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      try {
        let user;
        if (storedUser) {
          user = JSON.parse(storedUser);
        } else {
          // If no stored user, try to get user info from token
          const decodedToken = getUserFromToken(token);
          if (decodedToken) {
            // Fetch user details from backend using token
            api.get('/auth/me')
              .then(response => {
                const userData = response.data;
                localStorage.setItem('user', JSON.stringify(userData));
                dispatch({ 
                  type: 'LOGIN',
                  user: userData
                });
              })
              .catch(error => {
                console.error('Error fetching user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
              });
          }
        }

        if (user) {
          dispatch({ 
            type: 'LOGIN',
            user: user
          });
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (credentials) => {
    try {
      console.log('Attempting login with credentials:', credentials);
      
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ 
        type: 'LOGIN',
        user: user
      });
      
      return response;
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: authState.isLoggedIn,
        user: authState.user,
        login: login,
        logout: logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};