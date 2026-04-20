import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, IconButton, Drawer, Badge, CircularProgress,
  Chip, Button, Tooltip, Divider, TextField, InputAdornment,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, Bookmark, BookmarkCheck, ExternalLink,
  Sparkles, RefreshCw, Search, Briefcase, MapPin, DollarSign,
} from 'lucide-react';
import {
  fetchJobNotifications, toggleBookmark, getBookmarks, Job,
} from '../../services/jobNotificationService';

// ─── Job Card ─────────────────────────────────────────────────────────────────

const JobCard = ({
  job, onBookmark, index,
}: { job: Job; onBookmark: (id: string) => void; index: number }) => {
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 7) return `${d}d ago`;
    return `${Math.floor(d / 7)}w ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Box sx={{
        p: 2.5, mb: 1.5, borderRadius: 3,
        border: '1px solid',
        borderColor: job.isSuggested ? '#a855f730' : 'divider',
        background: job.isSuggested
          ? 'linear-gradient(135deg, #1a103a, #0f172a)'
          : 'background.paper',
        position: 'relative',
        transition: 'all 0.2s',
        '&:hover': { borderColor: '#3b82f650', transform: 'translateX(-2px)' },
      }}>
        {/* Suggested badge */}
        {job.isSuggested && (
          <Chip
            icon={<Sparkles size={11} />}
            label="AI Match"
            size="small"
            sx={{
              position: 'absolute', top: 10, right: 44,
              bgcolor: '#a855f720', color: '#c084fc',
              fontSize: 10, fontWeight: 700, height: 20,
              '& .MuiChip-icon': { fontSize: 11, color: '#c084fc' },
            }}
          />
        )}

        {/* Bookmark button */}
        <IconButton
          size="small"
          onClick={() => onBookmark(job.id)}
          sx={{ position: 'absolute', top: 8, right: 8, color: job.isBookmarked ? '#f59e0b' : '#64748b' }}
        >
          {job.isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </IconButton>

        {/* Header: logo + title */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5, pr: 4 }}>
          {job.logo ? (
            <Box component="img" src={job.logo} alt={job.company}
              sx={{ width: 36, height: 36, borderRadius: 2, objectFit: 'contain', bgcolor: '#fff', p: 0.5, flexShrink: 0 }} />
          ) : (
            <Box sx={{
              width: 36, height: 36, borderRadius: 2, flexShrink: 0,
              background: 'linear-gradient(135deg,#3b82f6,#a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Briefcase size={16} color="#fff" />
            </Box>
          )}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: 'text.primary' }}>
              {job.title}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
              {job.company}
            </Typography>
          </Box>
        </Box>

        {/* Meta info */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <MapPin size={11} color="#64748b" />
            <Typography sx={{ fontSize: 11, color: '#64748b' }}>{job.location}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <DollarSign size={11} color="#64748b" />
            <Typography sx={{ fontSize: 11, color: '#64748b' }}>{job.salary}</Typography>
          </Box>
          <Typography sx={{ fontSize: 11, color: '#475569' }}>· {timeAgo(job.postedAt)}</Typography>
        </Box>

        {/* Tags */}
        {job.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
            {job.tags.slice(0, 4).map(tag => (
              <Chip key={tag} label={tag} size="small" sx={{
                height: 18, fontSize: 10, fontWeight: 600,
                bgcolor: '#1e293b', color: '#94a3b8',
              }} />
            ))}
          </Box>
        )}

        {/* Footer: match score + apply */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              px: 1, py: 0.3, borderRadius: 1,
              bgcolor: job.matchScore >= 70 ? '#14532d' : job.matchScore >= 50 ? '#78350f' : '#1e293b',
            }}>
              <Typography sx={{
                fontSize: 11, fontWeight: 700,
                color: job.matchScore >= 70 ? '#4ade80' : job.matchScore >= 50 ? '#fcd34d' : '#94a3b8',
              }}>
                {job.matchScore}% match
              </Typography>
            </Box>
            <Chip label={job.type.replace('_', ' ')} size="small" sx={{
              height: 18, fontSize: 10,
              bgcolor: '#1e3a5f', color: '#60a5fa',
            }} />
          </Box>
          <Button
            size="small"
            variant="contained"
            endIcon={<ExternalLink size={12} />}
            onClick={() => window.open(job.url, '_blank')}
            sx={{
              fontSize: 11, py: 0.5, px: 1.5, borderRadius: 2, fontWeight: 700,
              background: 'linear-gradient(135deg,#3b82f6,#a855f7)',
              minWidth: 0,
            }}
          >
            Apply
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
};

// ─── Main Notification Bell Component ────────────────────────────────────────

export const JobNotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [filter, setFilter] = useState<'all' | 'suggested' | 'bookmarked'>('all');
  const [search, setSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await fetchJobNotifications();
      setJobs(fetched);
      setUnreadCount(fetched.filter(j => j.isSuggested).length);
      setLastFetched(new Date());
    } catch (e) {
      console.error('Failed to fetch jobs:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on first open
  useEffect(() => {
    if (open && !lastFetched) loadJobs();
  }, [open, lastFetched, loadJobs]);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastFetched) loadJobs();
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lastFetched, loadJobs]);

  const handleBookmark = (jobId: string) => {
    const newState = toggleBookmark(jobId);
    setJobs(prev => prev.map(j =>
      j.id === jobId ? { ...j, isBookmarked: newState } : j
    ));
  };

  // Filter + search
  const filtered = jobs
    .filter(j => {
      if (filter === 'suggested') return j.isSuggested;
      if (filter === 'bookmarked') return j.isBookmarked;
      return true;
    })
    .filter(j => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.tags.some(t => t.toLowerCase().includes(q))
      );
    });

  const bookmarkCount = jobs.filter(j => j.isBookmarked).length;
  const suggestedCount = jobs.filter(j => j.isSuggested).length;

  return (
    <>
      {/* Bell icon */}
      <Tooltip title="Job Opportunities">
        <IconButton onClick={() => setOpen(true)} sx={{ position: 'relative' }}>
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}
          >
            <Bell size={22} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Drawer panel */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 420 },
            background: '#0a0f1e',
            borderLeft: '1px solid #1e293b',
          },
        }}
      >
        {/* Panel header */}
        <Box sx={{
          p: 2.5, pb: 2,
          background: 'linear-gradient(135deg,#0f172a,#1a103a)',
          borderBottom: '1px solid #1e293b',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, background: 'linear-gradient(135deg,#3b82f6,#a855f7)' }}>
                <Briefcase size={16} color="#fff" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#e2e8f0' }}>
                  Job Opportunities
                </Typography>
                <Typography sx={{ fontSize: 11, color: '#64748b' }}>
                  {lastFetched
                    ? `Updated ${lastFetched.toLocaleTimeString()}`
                    : 'Loading...'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={loadJobs} disabled={loading} sx={{ color: '#64748b' }}>
                  <RefreshCw size={16} className={loading ? 'spin' : ''} />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#64748b' }}>
                <X size={18} />
              </IconButton>
            </Box>
          </Box>

          {/* Stats row */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {[
              { label: 'Total', value: jobs.length, color: '#3b82f6' },
              { label: 'AI Matched', value: suggestedCount, color: '#a855f7' },
              { label: 'Saved', value: bookmarkCount, color: '#f59e0b' },
            ].map(s => (
              <Box key={s.label} sx={{
                flex: 1, textAlign: 'center', py: 1, borderRadius: 2,
                bgcolor: '#1e293b', border: '1px solid #334155',
              }}>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</Typography>
                <Typography sx={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>

          {/* Search */}
          <TextField
            fullWidth size="small"
            placeholder="Search jobs, companies, skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Search size={14} color="#64748b" /></InputAdornment>
              ),
              sx: {
                borderRadius: 2, bgcolor: '#1e293b', fontSize: 13,
                '& fieldset': { borderColor: '#334155' },
              },
            }}
            sx={{ mb: 1.5 }}
          />

          {/* Filter tabs */}
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, v) => v && setFilter(v)}
            size="small"
            fullWidth
            sx={{ '& .MuiToggleButton-root': { fontSize: 11, fontWeight: 700, py: 0.5, borderColor: '#334155', color: '#64748b',
              '&.Mui-selected': { bgcolor: '#1e3a5f', color: '#60a5fa', borderColor: '#3b82f640' } } }}
          >
            <ToggleButton value="all">All ({jobs.length})</ToggleButton>
            <ToggleButton value="suggested">✨ AI ({suggestedCount})</ToggleButton>
            <ToggleButton value="bookmarked">🔖 Saved ({bookmarkCount})</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Job list */}
        <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#a855f7', mb: 2 }} />
              <Typography sx={{ color: '#64748b', fontSize: 13 }}>
                Fetching jobs & generating AI matches...
              </Typography>
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Briefcase size={48} color="#1e293b" />
              <Typography sx={{ color: '#475569', mt: 2, fontSize: 14 }}>
                {filter === 'bookmarked' ? 'No saved jobs yet' :
                 filter === 'suggested' ? 'No AI matches yet' :
                 'No jobs found'}
              </Typography>
              {filter === 'bookmarked' && (
                <Typography sx={{ color: '#334155', fontSize: 12, mt: 1 }}>
                  Click the bookmark icon on any job to save it
                </Typography>
              )}
            </Box>
          ) : (
            <AnimatePresence>
              {/* Suggested section header */}
              {filter === 'all' && filtered.some(j => j.isSuggested) && (
                <Box sx={{ mb: 1 }}>
                  <Divider sx={{ mb: 1.5 }}>
                    <Chip label="✨ AI Suggested for You" size="small"
                      sx={{ bgcolor: '#1a103a', color: '#c084fc', fontSize: 11, fontWeight: 700, border: '1px solid #a855f730' }} />
                  </Divider>
                  {filtered.filter(j => j.isSuggested).map((job, i) => (
                    <JobCard key={job.id} job={job} onBookmark={handleBookmark} index={i} />
                  ))}
                  <Divider sx={{ my: 2 }}>
                    <Chip label="🌐 Live Job Listings" size="small"
                      sx={{ bgcolor: '#1e293b', color: '#60a5fa', fontSize: 11, fontWeight: 700, border: '1px solid #3b82f630' }} />
                  </Divider>
                  {filtered.filter(j => !j.isSuggested).map((job, i) => (
                    <JobCard key={job.id} job={job} onBookmark={handleBookmark} index={i} />
                  ))}
                </Box>
              )}

              {/* Non-mixed view */}
              {(filter !== 'all' || !filtered.some(j => j.isSuggested)) &&
                filtered.map((job, i) => (
                  <JobCard key={job.id} job={job} onBookmark={handleBookmark} index={i} />
                ))
              }
            </AnimatePresence>
          )}
        </Box>
      </Drawer>
    </>
  );
};
