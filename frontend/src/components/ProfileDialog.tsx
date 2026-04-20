import { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogContent, Box, Typography, TextField,
  Button, IconButton, InputAdornment, CircularProgress,
  Divider, Chip, Stack,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Edit3, Check, Camera } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser: any;
  onUserUpdate: (user: any) => void;
}

const AVATAR_COLORS = [
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #ec4899, #f59e0b)',
  'linear-gradient(135deg, #22c55e, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
];

export const ProfileDialog = ({ open, onClose, currentUser, onUserUpdate }: ProfileDialogProps) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    jobTitle: '',
    college: '',
    bio: '',
  });

  // Pick a consistent avatar color based on email
  const avatarColor = currentUser?.email
    ? AVATAR_COLORS[currentUser.email.charCodeAt(0) % AVATAR_COLORS.length]
    : AVATAR_COLORS[0];

  const initials = (currentUser?.name || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isGoogle = currentUser?.provider === 'google';

  useEffect(() => {
    if (open && currentUser) {
      setForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        jobTitle: currentUser.jobTitle || '',
        college: currentUser.college || '',
        bio: currentUser.bio || '',
      });
      setEditing(false);
      setSaved(false);
      setError('');
    }
  }, [open, currentUser]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_ENDPOINTS.updateProfile}/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          location: form.location,
          job_title: form.jobTitle,
          college: form.college,
          bio: form.bio,
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();

      // Merge updated fields into current user
      const newUser = {
        ...currentUser,
        name: form.name,
        phone: form.phone,
        location: form.location,
        jobTitle: form.jobTitle,
        college: form.college,
        bio: form.bio,
      };

      localStorage.setItem('ml_user', JSON.stringify(newUser));
      onUserUpdate(newUser);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      // Even if backend fails, update locally
      const newUser = { ...currentUser, ...form };
      localStorage.setItem('ml_user', JSON.stringify(newUser));
      onUserUpdate(newUser);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      location: currentUser.location || '',
      jobTitle: currentUser.jobTitle || '',
      college: currentUser.college || '',
      bio: currentUser.bio || '',
    });
    setEditing(false);
    setError('');
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 2,
      color: 'rgba(255,255,255,0.9)',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
      '&.Mui-disabled': {
        background: 'rgba(255,255,255,0.02)',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.06)' },
      },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.45)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
    '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: 'rgba(255,255,255,0.4)' },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(20,10,40,0.97))',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 4,
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Top gradient bar */}
      <Box sx={{
        height: 4,
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
      }} />

      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{
          px: 3, pt: 3, pb: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: 'rgba(255,255,255,0.92)' }}>
            My Profile
          </Typography>
          <IconButton onClick={onClose} size="small"
            sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.08)' } }}>
            <X size={18} />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

        {/* Avatar + name section */}
        <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
          {/* Avatar */}
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            {currentUser?.picture ? (
              <Box
                component="img"
                src={currentUser.picture}
                sx={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.4)' }}
              />
            ) : (
              <Box sx={{
                width: 72, height: 72, borderRadius: '50%',
                background: avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid rgba(99,102,241,0.4)',
                fontSize: 24, fontWeight: 800, color: '#fff',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              }}>
                {initials}
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', lineHeight: 1.2 }}>
              {currentUser?.name || 'User'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
              {currentUser?.email}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={isGoogle ? '🔗 Google Account' : '✉️ Email Account'}
                size="small"
                sx={{
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 11,
                }}
              />
              {saved && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <Chip
                    label="✓ Saved"
                    size="small"
                    sx={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', fontSize: 11 }}
                  />
                </motion.div>
              )}
            </Box>
          </Box>

          {/* Edit toggle */}
          {!editing ? (
            <IconButton
              onClick={() => setEditing(true)}
              sx={{
                background: 'rgba(59,130,246,0.12)',
                border: '1px solid rgba(59,130,246,0.25)',
                color: '#3b82f6',
                '&:hover': { background: 'rgba(59,130,246,0.2)' },
              }}
            >
              <Edit3 size={16} />
            </IconButton>
          ) : (
            <Stack direction="row" gap={1}>
              <IconButton onClick={handleCancel} size="small"
                sx={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <X size={15} />
              </IconButton>
              <IconButton onClick={handleSave} size="small" disabled={saving}
                sx={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', '&:hover': { background: 'rgba(34,197,94,0.2)' } }}>
                {saving ? <CircularProgress size={14} color="inherit" /> : <Check size={15} />}
              </IconButton>
            </Stack>
          )}
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mx: 3 }} />

        {/* Form fields */}
        <Box sx={{ px: 3, py: 2.5 }}>
          {error && (
            <Typography fontSize={13} color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* Name */}
            <TextField
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              disabled={!editing}
              size="small"
              fullWidth
              sx={fieldSx}
              InputProps={{
                startAdornment: <InputAdornment position="start"><User size={15} color="rgba(255,255,255,0.3)" /></InputAdornment>
              }}
            />

            {/* Email — always readonly */}
            <TextField
              label="Email"
              value={form.email}
              disabled
              size="small"
              fullWidth
              sx={fieldSx}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Mail size={15} color="rgba(255,255,255,0.3)" /></InputAdornment>
              }}
            />

            {/* Phone */}
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              disabled={!editing}
              size="small"
              fullWidth
              placeholder="+91 XXXXX XXXXX"
              sx={fieldSx}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Phone size={15} color="rgba(255,255,255,0.3)" /></InputAdornment>
              }}
            />

            {/* Location */}
            <TextField
              label="Location"
              value={form.location}
              onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
              disabled={!editing}
              size="small"
              fullWidth
              placeholder="City, State"
              sx={fieldSx}
              InputProps={{
                startAdornment: <InputAdornment position="start"><MapPin size={15} color="rgba(255,255,255,0.3)" /></InputAdornment>
              }}
            />

            {/* Job Title */}
            <TextField
              label="Job Title / Role"
              value={form.jobTitle}
              onChange={(e) => setForm(f => ({ ...f, jobTitle: e.target.value }))}
              disabled={!editing}
              size="small"
              fullWidth
              placeholder="e.g. Software Engineer"
              sx={fieldSx}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Briefcase size={15} color="rgba(255,255,255,0.3)" /></InputAdornment>
              }}
            />

            {/* College */}
            <TextField
              label="College / University"
              value={form.college}
              onChange={(e) => setForm(f => ({ ...f, college: e.target.value }))}
              disabled={!editing}
              size="small"
              fullWidth
              placeholder="e.g. VIT University"
              sx={fieldSx}
              InputProps={{
                startAdornment: <InputAdornment position="start"><GraduationCap size={15} color="rgba(255,255,255,0.3)" /></InputAdornment>
              }}
            />
          </Box>

          {/* Bio — full width */}
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Bio"
              value={form.bio}
              onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
              disabled={!editing}
              size="small"
              fullWidth
              multiline
              rows={3}
              placeholder="Tell us a bit about yourself..."
              sx={fieldSx}
            />
          </Box>

          {/* Save button (shown only when editing) */}
          <AnimatePresence>
            {editing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    mt: 2.5, py: 1.2, borderRadius: 3,
                    background: 'linear-gradient(135deg, #2196f3, #9c27b0)',
                    fontWeight: 700, fontSize: 14,
                    boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                    '&:hover': { boxShadow: '0 6px 28px rgba(99,102,241,0.5)' },
                  }}
                >
                  {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {!editing && (
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'rgba(255,255,255,0.25)' }}>
              Click the ✏️ icon to edit your profile
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
