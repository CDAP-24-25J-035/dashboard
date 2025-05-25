import axios from 'axios';
import { toast } from 'react-toastify';

const baseURL = 'http://localhost:8085/api/v1';

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${baseURL}/auth/login`, {
            email,
            password,
        });
        toast.success('Login successful!');
        return response.data.data.access_token;
    } catch (error) {
        toast.error(`Login failed: ${error.response?.data?.message || error.message}`);
        throw error;
    }
};

export const registerUser = async (name, email, password) => {
    try {
        const response = await axios.post(`${baseURL}/auth/register`, {
            name,
            email,
            password,
        });
        toast.success('Registration successful!');
        return response.data;
    } catch (error) {
        toast.error(`Registration failed: ${error.response?.data?.message || error.message}`);
        throw error;
    }
};
