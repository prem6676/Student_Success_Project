import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface Props {
  onSwitch: () => void;
  onSuccess?: (user: any) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

const Register = ({ onSwitch, onSuccess }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const isValidEmail = useMemo(() => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isValidEmail) {
      setError('Please enter a valid email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(errorData.detail || 'Registration failed');
      }

      await res.json(); // Success!
      onSwitch(); // Go to login
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');

      // Local fallback for demo
      const users = JSON.parse(localStorage.getItem('ml_users') || '[]');
      if (!users.some((u: any) => u.email === email)) {
        const newUser = { name, email, password };
        localStorage.setItem('ml_users', JSON.stringify([...users, newUser]));
        onSwitch();
      }
    }
  };

  const googleButtonRef = React.useRef<HTMLDivElement>(null);

  const handleGoogleCredentialResponse = useCallback(async (response: any) => {
    setGoogleLoading(true);
    setGoogleError('');
    setError('');

    try {
      // Send credential to backend for verification
      const res = await fetch(API_ENDPOINTS.googleAuth, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to verify Google account' }));
        throw new Error(errorData.error || 'Failed to verify Google account');
      }

      const userData = await res.json();

      // If backend doesn't return user data, extract from JWT token (fallback)
      if (!userData.name || !userData.email) {
        // Decode JWT token (basic decode without verification - backend should verify)
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const googleUser = {
          name: payload.name || payload.given_name || 'Google User',
          email: payload.email,
          provider: 'google',
          picture: payload.picture,
        };

        // Save to localStorage for future logins
        const users = JSON.parse(localStorage.getItem('ml_users') || '[]');
        if (!users.some((u: any) => u.email === googleUser.email)) {
          localStorage.setItem('ml_users', JSON.stringify([...users, { ...googleUser, password: 'google_oauth' }]));
        }

        if (onSuccess) {
          onSuccess(googleUser);
        }
      } else {
        // Save to localStorage for future logins
        const users = JSON.parse(localStorage.getItem('ml_users') || '[]');
        if (!users.some((u: any) => u.email === userData.email)) {
          localStorage.setItem('ml_users', JSON.stringify([...users, { ...userData, password: 'google_oauth' }]));
        }

        if (onSuccess) {
          onSuccess(userData);
        }
      }
    } catch (err: any) {
      setGoogleError(err.message || 'Google sign-in failed. Please try again.');
      console.error('Google sign-in error:', err);
    } finally {
      setGoogleLoading(false);
    }
  }, [onSuccess]);

  // Initialize Google Identity Services
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return; // Don't initialize if no client ID
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && googleButtonRef.current) {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the button
        try {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signup_with',
            type: 'standard',
          });
        } catch (err) {
          console.error('Error rendering Google button:', err);
        }
      }
    };

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (!existingScript) {
      document.head.appendChild(script);
    } else {
      // Script already loaded, initialize immediately
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        try {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signup_with',
            type: 'standard',
          });
        } catch (err) {
          console.error('Error rendering Google button:', err);
        }
      }
    }

    return () => {
      // Cleanup: clear button container
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
      }
    };
  }, [handleGoogleCredentialResponse]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(1100px 560px at 15% 0%, rgba(33,150,243,0.22), transparent 60%), radial-gradient(900px 520px at 80% 10%, rgba(156,39,176,0.20), transparent 55%), linear-gradient(135deg, #0b1020, #0b1020)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={10}
          sx={{
            width: { xs: '100%', sm: 420 },
            maxWidth: 440,
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
            border: '1px solid rgba(255,255,255,0.14)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h5" fontWeight={950} textAlign="center" sx={{ color: 'rgba(255,255,255,0.92)' }}>
              Create your account
            </Typography>
            <Typography variant="body2" textAlign="center" sx={{ color: 'rgba(255,255,255,0.70)' }}>
              Register to access the ML-driven student success toolkit.
            </Typography>
          </Stack>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.14)' }} />

          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <User size={18} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!isValidEmail}
            helperText={!isValidEmail ? 'Enter a valid email address.' : ' '}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={18} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={18} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    sx={{ color: 'rgba(255,255,255,0.72)' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Typography color="error" fontSize={13} mt={1}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              py: 1.2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #2196f3, #9c27b0)',
              fontWeight: 900,
            }}
            onClick={handleRegister}
          >
            Register
          </Button>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.14)' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.50)', px: 2 }}>
                  OR
                </Typography>
              </Divider>

              {googleError && (
                <Alert severity="error" sx={{ mt: 1, mb: 1 }} onClose={() => setGoogleError('')}>
                  {googleError}
                </Alert>
              )}

              <Box
                ref={googleButtonRef}
                sx={{
                  mt: 1.5,
                  display: 'flex',
                  justifyContent: 'center',
                  minHeight: '42px',
                  '& iframe': {
                    width: '100% !important',
                    maxWidth: '100% !important',
                  },
                }}
              />

              {googleLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </>
          )}

          <Typography
            variant="body2"
            textAlign="center"
            mt={3}
            sx={{ cursor: 'pointer', color: 'rgba(255,255,255,0.78)' }}
            onClick={onSwitch}
          >
            Already have an account? <b>Login</b>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Register;
