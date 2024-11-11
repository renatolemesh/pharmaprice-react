import axios from 'axios';
import Cookies from 'js-cookie';
import { BASE_URL } from './Api';

export const checkAuth = async () => {
    const token = Cookies.get('token');
    if (!token) {
        return { isAuthenticated: false, message: 'No token found' };
    }

    try {
        const res = await axios.get(`${BASE_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
            return { isAuthenticated: true, user: res.data };
        } else {
            return { isAuthenticated: false, message: res.data.Error || 'An error occurred' };
        }
    } catch (err) {
        return { isAuthenticated: false, message: 'An error occurred' };
    }
};
