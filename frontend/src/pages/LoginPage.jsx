import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL + '/api/auth/login';

function LoginPage() {
    const [formData, setFormData] = useState({username: '', password: ''});
    const navigate = useNavigate();
    const {login} = useAuth();

    const onChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login Failed');
            }

            const userData = await response.json();
            login(userData); // logs in user and saves the jwt
            navigate('/');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
    <div className="auth-panel">
      <h2>Continue Your Adventure</h2>
      <form onSubmit={onSubmit}>
        <input type="text" name="username" value={formData.username} onChange={onChange} placeholder="Username" required />
        <input type="password" name="password" value={formData.password} onChange={onChange} placeholder="Password" required />
        <button type="submit" className="auth-button">Login</button>
      </form>
    </div>
  );
}
export default LoginPage;