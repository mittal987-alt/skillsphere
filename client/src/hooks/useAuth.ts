import { useSelector, useDispatch } from 'react-redux';
import { type RootState, type AppDispatch } from '../redux/store';
import { setCredentials, logout } from '../redux/slices/authSlice';
import { authApi } from '../api/auth';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
    return res.data;
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const res = await authApi.register(data);
    dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
    return res.data;
  };

  const logoutUser = async () => {
    await authApi.logout();
    dispatch(logout());
  };

  return { user, token, isAuthenticated, loading, login, register, logoutUser };
};
