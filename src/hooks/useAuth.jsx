import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { default as jwtDecode } from 'jwt-decode';
import { setAuthUser } from "@/store/user.js";

const protectedRoutes = [
    '',
    'interactive-solar-system',
    'astronomy-picture-of-the-day',
    'mars-rover-photo-gallery',
    'live-space-missions-tracker',
    'skywatching-diaries',
    'educational-resources'
];

const useAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const dispatch = useDispatch();

    const checkUser = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token && protectedRoutes.includes(window.location.pathname.split('/')[1])) {
            navigate('/login');
        }
        if (token) {
            const user = jwtDecode(token);
            dispatch(setAuthUser(user));
        }
    };

    useEffect(() => {
        checkUser();
    }, [location]);
};

export default useAuth;
