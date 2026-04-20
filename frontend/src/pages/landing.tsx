import { Box, Button, Card, CardContent, Container, Divider, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { motion } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  Briefcase,
  FileSearch,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
  onRegister?: () => void;
  isAuthenticated?: boolean;
  onContinue?: () => void;
  onLogout?: () => void;
}

// ─── Robot Avatar (circle, used in navbar) ────────────────────────────────────
const RobotAvatarCircle = ({ size = 38 }: { size?: number }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #0b1020 60%, #1a2240)',
      border: '2px solid rgba(33,150,243,0.45)',
      boxShadow: '0 0 14px rgba(33,150,243,0.30), 0 0 28px rgba(156,39,176,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0,
      position: 'relative',
    }}
  >
    {/* SVG robot face */}
    <svg
      width={size * 0.72}
      height={size * 0.72}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Antenna */}
      <line x1="16" y1="2" x2="16" y2="7" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="1.5" r="1.5" fill="#2196f3" />

      {/* Head */}
      <rect x="6" y="7" width="20" height="14" rx="3.5" fill="rgba(33,150,243,0.18)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />

      {/* Eyes */}
      <rect x="9" y="11" width="5" height="4" rx="1.5" fill="rgba(33,150,243,0.75)" />
      <rect x="18" y="11" width="5" height="4" rx="1.5" fill="rgba(156,39,176,0.75)" />
      {/* Eye shine */}
      <circle cx="10.5" cy="12" r="0.8" fill="rgba(255,255,255,0.7)" />
      <circle cx="19.5" cy="12" r="0.8" fill="rgba(255,255,255,0.7)" />

      {/* Mouth */}
      <rect x="11" y="17" width="10" height="2" rx="1" fill="rgba(255,255,255,0.22)" />

      {/* Body */}
      <rect x="9" y="22" width="14" height="8" rx="2.5" fill="rgba(33,150,243,0.12)" stroke="rgba(255,255,255,0.16)" strokeWidth="0.8" />
      {/* Body panel */}
      <rect x="12" y="24.5" width="8" height="2.5" rx="1" fill="rgba(33,150,243,0.30)" />
    </svg>
  </Box>
);

const RoboAnimation = () => {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        width: { xs: 260, sm: 320, md: 380 },
        height: { xs: 260, sm: 320, md: 380 },
        mx: 'auto',
        filter: 'drop-shadow(0 22px 55px rgba(0,0,0,0.18))',
        '@keyframes floaty': {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        '@keyframes blink': {
          '0%, 92%, 100%': { transform: 'scaleY(1)' },
          '94%, 96%': { transform: 'scaleY(0.15)' },
        },
        '@keyframes wave': {
          '0%,100%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(14deg)' },
        },
        '@keyframes scan': {
          '0%': { transform: 'translateY(-52px)', opacity: 0 },
          '20%': { opacity: 0.35 },
          '70%': { opacity: 0.35 },
          '100%': { transform: 'translateY(140px)', opacity: 0 },
        },
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, animation: 'floaty 3.2s ease-in-out infinite' }}>
        {/* Glow */}
        <Box
          sx={{
            position: 'absolute',
            inset: 28,
            borderRadius: '999px',
            background: 'radial-gradient(circle at 30% 30%, rgba(33,150,243,0.35), rgba(156,39,176,0.10), transparent 70%)',
          }}
        />

        {/* Antenna */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 18,
            width: 12,
            height: 70,
            transform: 'translateX(-50%)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: 14,
              width: 4,
              height: 54,
              transform: 'translateX(-50%)',
              borderRadius: 999,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.25))',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: 0,
              width: 12,
              height: 12,
              transform: 'translateX(-50%)',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #2196f3, #9c27b0)',
              boxShadow: '0 0 24px rgba(156,39,176,0.55)',
            }}
          />
        </Box>

        {/* Head */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 58,
            width: 240,
            height: 170,
            transform: 'translateX(-50%)',
            borderRadius: 6,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06))',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
          }}
        >
          {/* Scan line */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 64,
              background:
                'linear-gradient(180deg, transparent, rgba(33,150,243,0.25), transparent)',
              animation: 'scan 2.8s ease-in-out infinite',
            }}
          />

          {/* Face panel */}
          <Box
            sx={{
              position: 'absolute',
              left: 18,
              right: 18,
              top: 18,
              bottom: 18,
              borderRadius: 4,
              background:
                'linear-gradient(135deg, rgba(16, 24, 40, 0.55), rgba(16, 24, 40, 0.22))',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          />

          {/* Eyes */}
          <Box sx={{ position: 'absolute', left: 0, right: 0, top: 62, display: 'flex', gap: 3, justifyContent: 'center' }}>
            {[0, 1].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 56,
                  height: 38,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(33,150,243,0.55), rgba(156,39,176,0.35))',
                  border: '1px solid rgba(255,255,255,0.18)',
                  position: 'relative',
                  overflow: 'hidden',
                  transformOrigin: '50% 50%',
                  animation: 'blink 4.7s ease-in-out infinite',
                  animationDelay: i ? '0.25s' : '0s',
                  boxShadow: '0 0 18px rgba(33,150,243,0.22)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 6,
                    borderRadius: 2,
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55), rgba(255,255,255,0.05) 55%, transparent 70%)',
                  },
                }}
              />
            ))}
          </Box>

          {/* Mouth */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: 122,
              width: 120,
              height: 14,
              transform: 'translateX(-50%)',
              borderRadius: 999,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          />
        </Box>

        {/* Body */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 232,
            width: 270,
            height: 150,
            transform: 'translateX(-50%)',
            borderRadius: 6,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.20), rgba(255,255,255,0.06))',
            border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 16,
              right: 16,
              top: 16,
              height: 44,
              borderRadius: 4,
              background:
                'linear-gradient(135deg, rgba(33,150,243,0.22), rgba(156,39,176,0.10))',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          />
          <Box sx={{ position: 'absolute', left: 16, right: 16, top: 74, display: 'flex', gap: 1 }}>
            {[0, 1, 2, 3].map((i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  height: 10,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              />
            ))}
          </Box>
          <Box sx={{ position: 'absolute', left: 16, right: 16, top: 98, display: 'flex', gap: 1 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  height: 10,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Arm (wave) */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 244,
            width: 120,
            height: 20,
            transform: 'translateX(120px)',
            transformOrigin: '10% 50%',
            animation: 'wave 1.6s ease-in-out infinite',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 120,
              height: 20,
              borderRadius: 999,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
              border: '1px solid rgba(255,255,255,0.16)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              right: -10,
              top: -8,
              width: 34,
              height: 34,
              borderRadius: 999,
              background: 'linear-gradient(135deg, rgba(33,150,243,0.28), rgba(156,39,176,0.18))',
              border: '1px solid rgba(255,255,255,0.16)',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, rgba(33,150,243,0.28), rgba(156,39,176,0.18))',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <Icon size={22} />
          </Box>
          <Typography variant="h6" fontWeight={800}>
            {title}
          </Typography>
        </Box>
        <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

export default function Landing({ onLogin, onRegister, isAuthenticated, onContinue, onLogout }: LandingProps) {
  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard Insights',
      description: 'Track progress, performance, and learning trends with a clean analytics dashboard.',
    },
    {
      icon: Target,
      title: 'Skill Assessment',
      description: 'Assess strengths and gaps to focus your learning on what matters most.',
    },
    {
      icon: BookOpen,
      title: 'Curated Resources',
      description: 'Find structured learning materials and references aligned with your goals.',
    },
    {
      icon: GraduationCap,
      title: 'Placement Preparation',
      description: 'Prepare with topic-wise guidance and structured practice plans.',
    },
    {
      icon: Briefcase,
      title: 'Job Portals',
      description: 'Explore job platforms and opportunities in one place for faster applications.',
    },
    {
      icon: FileSearch,
      title: 'Resume Analyzer (ML)',
      description: 'Analyze your resume for skill coverage and relevance to roles using ML-driven insights.',
    },
    {
      icon: Sparkles,
      title: 'Mock Interview',
      description: 'Practice interview questions and improve responses with guided feedback.',
    },
    {
      icon: ShieldCheck,
      title: 'Personalized Experience',
      description: 'Save your profile locally and continue your journey seamlessly across sessions.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: 'text.primary',
        background:
          'radial-gradient(1200px 600px at 20% 0%, rgba(33,150,243,0.22), transparent 60%), radial-gradient(900px 520px at 80% 10%, rgba(156,39,176,0.20), transparent 55%), linear-gradient(135deg, #0b1020, #0b1020)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative grid */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.16,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          pointerEvents: 'none',
        }}
      />

      {/* Top Bar */}
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Box
          sx={{
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo: Robot Avatar + Title only */}
          <Stack direction="row" spacing={1.2} alignItems="center">
            <RobotAvatarCircle size={38} />
            <Typography fontWeight={900} letterSpacing={0.2}>
              Student Success AI
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            {isAuthenticated ? (
              <>
                <Button
                  variant="contained"
                  onClick={onContinue || onLogin}
                  sx={{
                    background: 'linear-gradient(135deg, #2196f3, #9c27b0)',
                    fontWeight: 900,
                  }}
                >
                  Dashboard
                </Button>
                {onLogout && (
                  <Button
                    variant="outlined"
                    onClick={onLogout}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.22)',
                      color: 'rgba(255,255,255,0.92)',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.32)' },
                    }}
                  >
                    Logout
                  </Button>
                )}
              </>
            ) : (
              <>
                {onRegister && (
                  <Button
                    variant="outlined"
                    onClick={onRegister}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.22)',
                      color: 'rgba(255,255,255,0.92)',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.32)' },
                    }}
                  >
                    Register
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={onLogin}
                  sx={{
                    background: 'linear-gradient(135deg, #2196f3, #9c27b0)',
                    fontWeight: 800,
                  }}
                >
                  Login
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Container>

      {/* Hero */}
      <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 6, md: 9 } }}>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={7}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Typography
                variant="h2"
                fontWeight={950}
                sx={{
                  letterSpacing: -0.8,
                  lineHeight: 1.05,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.75))',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ML-Driven system for student success and opportunity mapping
              </Typography>

              <Typography sx={{ mt: 2.5, maxWidth: 640, color: 'rgba(255,255,255,0.78)', lineHeight: 1.8 }}>
                A single place to assess skills, learn faster, prepare for placements, improve your resume, and practice
                interviews—powered by a modern UI and ML-backed insights.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  size="large"
                  variant="contained"
                  onClick={(isAuthenticated ? onContinue : onLogin) || onLogin}
                  sx={{
                    py: 1.3,
                    px: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #2196f3, #9c27b0)',
                    fontWeight: 900,
                  }}
                >
                  {isAuthenticated ? 'Continue to Dashboard' : 'Access Features (Login)'}
                </Button>
                {onRegister && (
                  <Button
                    size="large"
                    variant="outlined"
                    onClick={onRegister}
                    disabled={!!isAuthenticated}
                    sx={{
                      py: 1.3,
                      px: 3,
                      borderRadius: 3,
                      borderColor: 'rgba(255,255,255,0.22)',
                      color: 'rgba(255,255,255,0.92)',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.32)' },
                    }}
                  >
                    Create Account
                  </Button>
                )}
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 4, color: 'rgba(255,255,255,0.72)' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: 999, background: '#2196f3' }} />
                  <Typography variant="body2">Skill Gap Analysis</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: 999, background: '#9c27b0' }} />
                  <Typography variant="body2">Opportunity Mapping</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: 999, background: '#e91e63' }} />
                  <Typography variant="body2">Interview Practice</Typography>
                </Stack>
              </Stack>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={5}>
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65 }}>
              <RoboAnimation />
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Features */}
      <Container maxWidth="lg" sx={{ position: 'relative', pb: { xs: 7, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={950} sx={{ color: 'rgba(255,255,255,0.95)' }}>
            Everything you need, in one project
          </Typography>
          <Typography sx={{ mt: 1.2, color: 'rgba(255,255,255,0.70)', maxWidth: 760, mx: 'auto', lineHeight: 1.75 }}>
            Explore the complete feature set built into this app—login to unlock the dashboard and tools.
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <FeatureCard icon={f.icon} title={f.title} description={f.description} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.14)' }} />
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              pt: 3,
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ color: 'rgba(255,255,255,0.68)' }}>
              Built with React + MUI, smooth animations, and an ML-ready backend module for resume analysis.
            </Typography>
            <Button
              onClick={(isAuthenticated ? onContinue : onLogin) || onLogin}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #2196f3, #9c27b0)',
                fontWeight: 900,
                borderRadius: 3,
                px: 3,
              }}
            >
              {isAuthenticated ? 'Continue to Dashboard' : 'Login to Continue'}
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
