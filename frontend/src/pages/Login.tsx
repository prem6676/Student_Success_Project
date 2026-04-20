import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface Props {
  onSuccess: (user: any) => void;
  onSwitch: () => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

// ─── Forgot Password Dialog ───────────────────────────────────────────────────
const ForgotPasswordDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [resetEmail, setResetEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail);

  const handleReset = async () => {
    if (!resetEmail || !isValid) {
      setMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${API_ENDPOINTS.login.replace('/login', '/forgot-password')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(err.detail || 'Request failed');
      }

      setStatus('success');
      setMessage('If this email is registered, a password reset link has been sent.');
    } catch {
      // Always show success-like message to avoid email enumeration
      setStatus('success');
      setMessage('If this email is registered, a password reset link has been sent.');
    }
  };

  const handleClose = () => {
    setResetEmail('');
    setStatus('idle');
    setMessage('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(20,28,55,0.98), rgba(11,16,32,0.98))',
          border: '1px solid rgba(255,255,255,0.14)',
          backdropFilter: 'blur(16px)',
          borderRadius: 3,
          minWidth: { xs: 300, sm: 400 },
          color: 'rgba(255,255,255,0.92)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Reset your password</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mb: 2 }}>
          Enter your registered email address and we'll send you a link to reset your password.
        </Typography>

        {status === 'success' ? (
          <Alert
            severity="success"
            sx={{
              background: 'rgba(33,150,243,0.15)',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(33,150,243,0.3)',
              '& .MuiAlert-icon': { color: '#2196f3' },
            }}
          >
            {message}
          </Alert>
        ) : (
          <>
            <TextField
              fullWidth
              label="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              error={!!resetEmail && !isValid}
              helperText={!!resetEmail && !isValid ? 'Enter a valid email address.' : ' '}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={18} />
                  </InputAdornment>
                ),
              }}
            />
            {status === 'error' && message && (
              <Typography color="error" fontSize={13} mt={0.5}>
                {message}
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={handleClose}
          sx={{ color: 'rgba(255,255,255,0.60)', '&:hover': { color: 'rgba(255,255,255,0.9)' } }}
        >
          {status === 'success' ? 'Close' : 'Cancel'}
        </Button>
        {status !== 'success' && (
          <Button
            variant="contained"
            onClick={handleReset}
            disabled={status === 'loading'}
            sx={{
              background: 'linear-gradient(135deg, #2196f3, #9c27b0)',
              fontWeight: 800,
              borderRadius: 2,
              minWidth: 120,
            }}
          >
            {status === 'loading' ? <CircularProgress size={18} color="inherit" /> : 'Send Reset Link'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ─── Login Component ──────────────────────────────────────────────────────────
const Login = ({ onSuccess, onSwitch }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const isValidEmail = useMemo(() => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (!isValidEmail) {
      setError('Please enter a valid email.');
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
        throw new Error(errorData.detail || 'Login failed');
      }

      const user = await res.json();
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');

      // Fallback for demo if backend is down
      const users = JSON.parse(localStorage.getItem('ml_users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onSuccess({ ...user, id: 'demo-user-id' });
      }
    }
  };

  const googleButtonRef = React.useRef<HTMLDivElement>(null);

  const handleGoogleCredentialResponse = React.useCallback(async (response: any) => {
    setGoogleLoading(true);
    setGoogleError('');
    setError('');

    try {
      const res = await fetch(API_ENDPOINTS.googleAuth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to verify Google account' }));
        throw new Error(errorData.error || 'Failed to verify Google account');
      }

      const userData = await res.json();

      if (!userData.name || !userData.email) {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const googleUser = {
          name: payload.name || payload.given_name || 'Google User',
          email: payload.email,
          provider: 'google',
          picture: payload.picture,
        };
        onSuccess(googleUser);
      } else {
        onSuccess(userData);
      }
    } catch (err: any) {
      setGoogleError(err.message || 'Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }, [onSuccess]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
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
            text: 'signin_with',
            type: 'standard',
          });
        } catch (err) {
          console.error('Error rendering Google button:', err);
        }
      }
    };

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (!existingScript) {
      document.head.appendChild(script);
    } else {
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
            text: 'signin_with',
            type: 'standard',
          });
        } catch (err) {
          console.error('Error rendering Google button:', err);
        }
      }
    }

    return () => {
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
              Welcome back
            </Typography>
            <Typography variant="body2" textAlign="center" sx={{ color: 'rgba(255,255,255,0.70)' }}>
              Login to access your personalized dashboard.
            </Typography>
          </Stack>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.14)' }} />

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

          {/* Forgot Password link */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
            <Typography
              variant="body2"
              onClick={() => setForgotOpen(true)}
              sx={{
                cursor: 'pointer',
                color: '#2196f3',
                fontWeight: 600,
                fontSize: 13,
                '&:hover': { color: '#90caf9', textDecoration: 'underline' },
              }}
            >
              Forgot password?
            </Typography>
          </Box>

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
            onClick={handleLogin}
          >
            Login
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
            </>
          )}

          {googleLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          <Typography
            variant="body2"
            textAlign="center"
            mt={3}
            sx={{ cursor: 'pointer', color: 'rgba(255,255,255,0.78)' }}
            onClick={onSwitch}
          >
            Don't have an account? <b>Register</b>
          </Typography>
        </Paper>
      </motion.div>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </Box>
  );
};

export default Login;
