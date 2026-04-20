import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, IconButton,
  InputAdornment, CircularProgress, Chip, Divider,
  LinearProgress, useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Edit3, Check, X, ArrowLeft, Github, Linkedin, Globe,
  BookOpen, Code2, Plus,
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface ProfilePageProps {
  currentUser: any;
  onBack: () => void;
  onUserUpdate: (user: any) => void;
}

const AVATAR_GRADIENTS = [
  ['#3b82f6', '#8b5cf6'],
  ['#ec4899', '#f59e0b'],
  ['#22c55e', '#06b6d4'],
  ['#f59e0b', '#ef4444'],
  ['#8b5cf6', '#ec4899'],
];

const calcCompleteness = (user: any): number => {
  const fields = ['name', 'email', 'phone', 'location', 'jobTitle', 'college', 'bio', 'github', 'linkedin', 'skills'];
  const filled = fields.filter(f => user?.[f] && String(user[f]).trim() !== '' && !(Array.isArray(user[f]) && user[f].length === 0)).length;
  return Math.round((filled / fields.length) * 100);
};

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, editing, onEdit, onSave, onCancel, saving, accent = '#3b82f6' }: any) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box sx={{
        background: theme.palette.background.paper,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 3, p: 3, mb: 2.5,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
        transition: 'border-color 0.3s',
        '&:hover': { borderColor: `${accent}50` },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: 2,
              background: `${accent}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={17} color={accent} />
            </Box>
            <Typography fontWeight={700} fontSize={15} color="text.primary">{title}</Typography>
          </Box>
          {!editing ? (
            <IconButton size="small" onClick={onEdit} sx={{
              color: 'text.disabled',
              '&:hover': { color: accent, background: `${accent}15` },
            }}>
              <Edit3 size={15} />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={onCancel} sx={{
                color: 'text.secondary',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              }}>
                <X size={14} />
              </IconButton>
              <IconButton size="small" onClick={onSave} disabled={saving} sx={{
                color: '#22c55e', background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.25)',
                '&:hover': { background: 'rgba(34,197,94,0.2)' },
              }}>
                {saving ? <CircularProgress size={13} color="inherit" /> : <Check size={14} />}
              </IconButton>
            </Box>
          )}
        </Box>
        {children}
      </Box>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

export const ProfilePage = ({ currentUser, onBack, onUserUpdate }: ProfilePageProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [user, setUser] = useState<any>(currentUser || {});
  const [savedMsg, setSavedMsg] = useState('');
  const [editBasic, setEditBasic]   = useState(false);
  const [editAbout, setEditAbout]   = useState(false);
  const [editLinks, setEditLinks]   = useState(false);
  const [editSkills, setEditSkills] = useState(false);
  const [savingSection, setSavingSection] = useState('');

  const [basic, setBasic] = useState({ name: '', phone: '', location: '', jobTitle: '', college: '' });
  const [about, setAbout] = useState({ bio: '' });
  const [links, setLinks] = useState({ github: '', linkedin: '', website: '' });
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  const completeness = calcCompleteness(user);
  const gradIdx = (user?.email || '').charCodeAt(0) % AVATAR_GRADIENTS.length;
  const [c1, c2] = AVATAR_GRADIENTS[gradIdx];
  const initials = (user?.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setBasic({ name: currentUser.name || '', phone: currentUser.phone || '', location: currentUser.location || '', jobTitle: currentUser.jobTitle || '', college: currentUser.college || '' });
      setAbout({ bio: currentUser.bio || '' });
      setLinks({ github: currentUser.github || '', linkedin: currentUser.linkedin || '', website: currentUser.website || '' });
      setSkills(Array.isArray(currentUser.skills) ? currentUser.skills : []);
    }
  }, [currentUser]);

  const persistUser = (updated: any) => {
    const merged = { ...user, ...updated };
    setUser(merged);
    localStorage.setItem('ml_user', JSON.stringify(merged));
    onUserUpdate(merged);
    setSavedMsg('Changes saved!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const saveSection = async (section: string, data: any) => {
    setSavingSection(section);
    try {
      if (user?.id) {
        await fetch(`${API_ENDPOINTS.updateProfile}/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: basic.name, phone: basic.phone, location: basic.location,
            job_title: basic.jobTitle, college: basic.college,
            bio: about.bio, github: links.github, linkedin: links.linkedin,
            website: links.website, skills,
            ...data,
          }),
        });
      }
    } catch (_) {}
    persistUser(data);
    setSavingSection('');
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  // ── Field styles using theme ──────────────────────────────────────────────
  const fSx = (accent = '#3b82f6') => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)' },
      '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)' },
      '&.Mui-focused fieldset': { borderColor: accent },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: accent },
  });

  const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const textMuted     = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
  const borderColor   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.background.default }}>

      {/* Ambient blobs — subtle in both themes */}
      <Box sx={{
        position: 'fixed', top: -200, left: -200, width: 500, height: 500, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(59,130,246,0.07), transparent 70%)'
          : 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'fixed', bottom: -200, right: -100, width: 400, height: 400, borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(139,92,246,0.07), transparent 70%)'
          : 'radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Top bar */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 100,
        background: isDark ? 'rgba(18,18,18,0.9)' : 'rgba(245,245,245,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${borderColor}`,
        px: { xs: 2, md: 4 }, py: 1.5,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <IconButton onClick={onBack} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
          <ArrowLeft size={20} />
        </IconButton>
        <Typography fontWeight={700} fontSize={16} color="text.primary" sx={{ flex: 1 }}>
          My Profile
        </Typography>
        <AnimatePresence>
          {savedMsg && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <Chip label={`✓ ${savedMsg}`} size="small" sx={{
                background: 'rgba(34,197,94,0.15)', color: '#22c55e',
                border: '1px solid rgba(34,197,94,0.25)', fontWeight: 600,
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 3, alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <Box sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>

            {/* Avatar card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Box sx={{
                background: theme.palette.background.paper,
                border: `1px solid ${borderColor}`,
                borderRadius: 3, mb: 2.5, overflow: 'hidden',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
              }}>
                {/* Cover */}
                <Box sx={{ height: 80, background: `linear-gradient(135deg, ${c1}50, ${c2}50)` }} />

                <Box sx={{ px: 2.5, pb: 2.5 }}>
                  {/* Avatar */}
                  <Box sx={{ mt: -4, mb: 1.5, display: 'inline-block' }}>
                    {user?.picture ? (
                      <Box component="img" src={user.picture} sx={{
                        width: 76, height: 76, borderRadius: '50%',
                        border: `3px solid ${theme.palette.background.paper}`,
                        boxShadow: `0 4px 12px ${c1}40`,
                      }} />
                    ) : (
                      <Box sx={{
                        width: 76, height: 76, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${c1}, ${c2})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26, fontWeight: 800, color: '#fff',
                        border: `3px solid ${theme.palette.background.paper}`,
                        boxShadow: `0 4px 16px ${c1}50`,
                      }}>
                        {initials}
                      </Box>
                    )}
                  </Box>

                  <Typography fontWeight={800} fontSize={17} color="text.primary">
                    {user?.name || 'Your Name'}
                  </Typography>
                  {user?.jobTitle && (
                    <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.3 }}>
                      {user.jobTitle}
                    </Typography>
                  )}
                  {user?.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8 }}>
                      <MapPin size={12} color={textSecondary} />
                      <Typography fontSize={12} color="text.secondary">{user.location}</Typography>
                    </Box>
                  )}
                  <Chip
                    label={user?.provider === 'google' ? '🔗 Google Account' : '✉️ Email Account'}
                    size="small"
                    sx={{ mt: 1.5, fontSize: 11, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', color: 'text.secondary' }}
                  />
                </Box>
              </Box>
            </motion.div>

            {/* Completeness */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Box sx={{
                background: theme.palette.background.paper,
                border: `1px solid ${borderColor}`,
                borderRadius: 3, p: 2.5, mb: 2.5,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontSize={13} fontWeight={600} color="text.secondary">
                    Profile Completeness
                  </Typography>
                  <Typography fontSize={13} fontWeight={800} sx={{
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {completeness}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={completeness} sx={{
                  height: 6, borderRadius: 99,
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    borderRadius: 99,
                  },
                }} />
                <Typography fontSize={11} color="text.disabled" sx={{ mt: 1 }}>
                  {completeness < 100 ? 'Complete your profile to stand out' : '🎉 Profile complete!'}
                </Typography>
              </Box>
            </motion.div>

            {/* Contact */}
            {(user?.email || user?.phone || user?.college) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
                <Box sx={{
                  background: theme.palette.background.paper,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 3, p: 2.5,
                  boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
                }}>
                  <Typography fontSize={11} fontWeight={700} color="text.disabled" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Contact
                  </Typography>
                  {user?.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Mail size={14} color={textSecondary} />
                      <Typography fontSize={12} color="text.secondary" sx={{ wordBreak: 'break-all' }}>{user.email}</Typography>
                    </Box>
                  )}
                  {user?.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Phone size={14} color={textSecondary} />
                      <Typography fontSize={12} color="text.secondary">{user.phone}</Typography>
                    </Box>
                  )}
                  {user?.college && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <GraduationCap size={14} color={textSecondary} />
                      <Typography fontSize={12} color="text.secondary">{user.college}</Typography>
                    </Box>
                  )}
                </Box>
              </motion.div>
            )}
          </Box>

          {/* ── RIGHT COLUMN ── */}
          <Box>

            {/* Basic Info */}
            <Section title="Basic Information" icon={User} accent="#3b82f6"
              editing={editBasic} onEdit={() => setEditBasic(true)}
              onCancel={() => { setEditBasic(false); setBasic({ name: user.name || '', phone: user.phone || '', location: user.location || '', jobTitle: user.jobTitle || '', college: user.college || '' }); }}
              onSave={async () => { await saveSection('basic', { name: basic.name, phone: basic.phone, location: basic.location, jobTitle: basic.jobTitle, college: basic.college }); setEditBasic(false); }}
              saving={savingSection === 'basic'}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField label="Full Name" value={basic.name} disabled={!editBasic} size="small" fullWidth sx={fSx('#3b82f6')}
                  onChange={e => setBasic(b => ({ ...b, name: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><User size={14} color={textMuted} /></InputAdornment> }} />
                <TextField label="Email" value={user?.email || ''} disabled size="small" fullWidth sx={fSx('#3b82f6')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={14} color={textMuted} /></InputAdornment> }} />
                <TextField label="Phone" value={basic.phone} disabled={!editBasic} size="small" fullWidth placeholder="+91 XXXXX XXXXX" sx={fSx('#3b82f6')}
                  onChange={e => setBasic(b => ({ ...b, phone: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={14} color={textMuted} /></InputAdornment> }} />
                <TextField label="Location" value={basic.location} disabled={!editBasic} size="small" fullWidth placeholder="City, State" sx={fSx('#3b82f6')}
                  onChange={e => setBasic(b => ({ ...b, location: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={14} color={textMuted} /></InputAdornment> }} />
                <TextField label="Job Title / Role" value={basic.jobTitle} disabled={!editBasic} size="small" fullWidth placeholder="e.g. Software Engineer" sx={fSx('#3b82f6')}
                  onChange={e => setBasic(b => ({ ...b, jobTitle: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Briefcase size={14} color={textMuted} /></InputAdornment> }} />
                <TextField label="College / University" value={basic.college} disabled={!editBasic} size="small" fullWidth placeholder="e.g. VIT University" sx={fSx('#3b82f6')}
                  onChange={e => setBasic(b => ({ ...b, college: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><GraduationCap size={14} color={textMuted} /></InputAdornment> }} />
              </Box>
            </Section>

            {/* About */}
            <Section title="About Me" icon={BookOpen} accent="#8b5cf6"
              editing={editAbout} onEdit={() => setEditAbout(true)}
              onCancel={() => { setEditAbout(false); setAbout({ bio: user.bio || '' }); }}
              onSave={async () => { await saveSection('about', { bio: about.bio }); setEditAbout(false); }}
              saving={savingSection === 'about'}
            >
              {editAbout ? (
                <TextField fullWidth multiline rows={4} value={about.bio}
                  onChange={e => setAbout({ bio: e.target.value })}
                  placeholder="Write a short bio about yourself..." size="small" sx={fSx('#8b5cf6')} />
              ) : (
                <Typography fontSize={14} color={user?.bio ? 'text.secondary' : 'text.disabled'}
                  sx={{ lineHeight: 1.7, fontStyle: user?.bio ? 'normal' : 'italic' }}>
                  {user?.bio || 'Add a bio to let employers know who you are...'}
                </Typography>
              )}
            </Section>

            {/* Skills */}
            <Section title="Skills" icon={Code2} accent="#06b6d4"
              editing={editSkills} onEdit={() => setEditSkills(true)}
              onCancel={() => { setEditSkills(false); setSkills(Array.isArray(user.skills) ? user.skills : []); }}
              onSave={async () => { await saveSection('skills', { skills }); setEditSkills(false); }}
              saving={savingSection === 'skills'}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: editSkills ? 2 : 0 }}>
                {skills.length === 0 && !editSkills && (
                  <Typography fontSize={13} color="text.disabled" sx={{ fontStyle: 'italic' }}>Add your skills...</Typography>
                )}
                {skills.map(s => (
                  <Chip key={s} label={s} size="small"
                    onDelete={editSkills ? () => setSkills(prev => prev.filter(x => x !== s)) : undefined}
                    sx={{
                      background: 'rgba(6,182,212,0.1)', color: '#06b6d4',
                      border: '1px solid rgba(6,182,212,0.25)', fontWeight: 500,
                      '& .MuiChip-deleteIcon': { color: 'rgba(6,182,212,0.5)', '&:hover': { color: '#06b6d4' } },
                    }} />
                ))}
              </Box>
              {editSkills && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" value={skillInput} placeholder="Type a skill and press Enter"
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    sx={{ ...fSx('#06b6d4'), flex: 1 }} />
                  <Button onClick={addSkill} variant="outlined" size="small" sx={{
                    borderColor: 'rgba(6,182,212,0.3)', color: '#06b6d4', minWidth: 40,
                    '&:hover': { borderColor: '#06b6d4', background: 'rgba(6,182,212,0.1)' },
                  }}>
                    <Plus size={16} />
                  </Button>
                </Box>
              )}
            </Section>

            {/* Links */}
            <Section title="Links & Socials" icon={Globe} accent="#ec4899"
              editing={editLinks} onEdit={() => setEditLinks(true)}
              onCancel={() => { setEditLinks(false); setLinks({ github: user.github || '', linkedin: user.linkedin || '', website: user.website || '' }); }}
              onSave={async () => { await saveSection('links', { github: links.github, linkedin: links.linkedin, website: links.website }); setEditLinks(false); }}
              saving={savingSection === 'links'}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField label="GitHub URL" value={links.github} disabled={!editLinks} size="small" fullWidth
                  placeholder="https://github.com/username" sx={fSx('#ec4899')}
                  onChange={e => setLinks(l => ({ ...l, github: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Github size={14} color={textMuted} /></InputAdornment> }} />
                <TextField label="LinkedIn URL" value={links.linkedin} disabled={!editLinks} size="small" fullWidth
                  placeholder="https://linkedin.com/in/username" sx={fSx('#ec4899')}
                  onChange={e => setLinks(l => ({ ...l, linkedin: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Linkedin size={14} color={textMuted} /></InputAdornment> }} />
                <TextField label="Portfolio / Website" value={links.website} disabled={!editLinks} size="small" fullWidth
                  placeholder="https://yourportfolio.com" sx={fSx('#ec4899')}
                  onChange={e => setLinks(l => ({ ...l, website: e.target.value }))}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Globe size={14} color={textMuted} /></InputAdornment> }} />
                {!editLinks && (links.github || links.linkedin || links.website) && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                    {links.github && (
                      <Chip component="a" href={links.github} target="_blank" clickable
                        icon={<Github size={13} />} label="GitHub" size="small"
                        sx={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', color: 'text.secondary' }} />
                    )}
                    {links.linkedin && (
                      <Chip component="a" href={links.linkedin} target="_blank" clickable
                        icon={<Linkedin size={13} />} label="LinkedIn" size="small"
                        sx={{ background: 'rgba(10,102,194,0.1)', color: '#0a66c2', border: '1px solid rgba(10,102,194,0.2)' }} />
                    )}
                    {links.website && (
                      <Chip component="a" href={links.website} target="_blank" clickable
                        icon={<Globe size={13} />} label="Portfolio" size="small"
                        sx={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.2)' }} />
                    )}
                  </Box>
                )}
              </Box>
            </Section>

          </Box>
        </Box>
      </Box>
    </Box>
  );
};
