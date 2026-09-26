import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app load if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.success) {
          setUser(res.user);
          setProfile(res.profile);
        }
      } catch (err) {
        console.error('Session restore failed:', err.message);
        localStorage.removeItem('token');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 1. Password Login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('token', res.token);
      setUser(res.user);
      setProfile(res.profile);
      return res;
    }
  };

  // 2. Send OTP (Email or Mobile)
  const sendOtp = async (payload, purpose = 'login') => {
    if (typeof payload === 'string') {
      const isEmail = payload.includes('@');
      return await api.post('/auth/send-otp', {
        email: isEmail ? payload : undefined,
        phone: !isEmail ? payload : undefined,
        type: isEmail ? 'email' : 'mobile',
        purpose
      });
    }
    return await api.post('/auth/send-otp', { purpose, ...payload });
  };

  // 3. Login with OTP (Email or Mobile)
  const loginWithOtp = async (identifierOrPayload, otp) => {
    let payload = {};
    if (typeof identifierOrPayload === 'string') {
      const isEmail = identifierOrPayload.includes('@');
      payload = {
        email: isEmail ? identifierOrPayload : undefined,
        phone: !isEmail ? identifierOrPayload : undefined,
        type: isEmail ? 'email' : 'mobile',
        otp
      };
    } else {
      payload = { ...identifierOrPayload, otp };
    }

    const res = await api.post('/auth/verify-otp-login', payload);
    if (res.success) {
      localStorage.setItem('token', res.token);
      setUser(res.user);
      setProfile(res.profile);
      return res;
    }
  };

  // 4. Register with OTP
  const registerWithOtp = async (data) => {
    const res = await api.post('/auth/verify-otp-register', data);
    if (res.success) {
      localStorage.setItem('token', res.token);
      setUser(res.user);
      setProfile(res.profile);
      return res;
    }
  };

  // 5. Register Student (Direct)
  const registerStudent = async (studentData) => {
    const res = await api.post('/auth/register/student', studentData);
    if (res.success) {
      localStorage.setItem('token', res.token);
      setUser(res.user);
      setProfile(res.profile);
      return res;
    }
  };

  // 6. Register Recruiter (Direct)
  const registerRecruiter = async (recruiterData) => {
    const res = await api.post('/auth/register/recruiter', recruiterData);
    if (res.success) {
      localStorage.setItem('token', res.token);
      setUser(res.user);
      return res;
    }
  };

  // 7. Update Profile
  const updateProfile = async (updatedData) => {
    const res = await api.put('/auth/student-profile', updatedData);
    if (res.success) {
      if (res.user) setUser(res.user);
      if (res.profile) setProfile(res.profile);
      return res;
    }
  };

  // 8. Login / Register with Google
  const loginWithGoogle = async (googleData) => {
    const res = await api.post('/auth/google', googleData);
    if (res.success) {
      localStorage.setItem('token', res.token);
      setUser(res.user);
      setProfile(res.profile);
      return res;
    }
  };

  // 9. Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        loginWithGoogle,
        sendOtp,
        loginWithOtp,
        registerWithOtp,
        registerStudent,
        registerRecruiter,
        updateProfile,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
