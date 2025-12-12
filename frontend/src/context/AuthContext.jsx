import {createContext, useState, useContext} from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(() => { // initializing state from localstorage
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // login 
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    // handles protected fetch calls
    const fetchWithAuth = async (endpoint, options = {}) => {
        const token = user ? user.token : null;

        // add authorization header and json content type
        const headers = {
            'Content-Type' : 'application/json',
            ...(token && {'Authorization':`Bearer ${token}`}), // conditionally adds auth
            ...(options.headers), // allows overriding and ability to add more headers
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // handles http errors
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(error.Data.message || 'Error occurred');
        }

        //return josn data
        return response.statues === 204 ? {} : response.json();
    }

    const value = {
        user,
        login,
        logout,
        fetchWithAuth,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}