import { useState, useEffect } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';

import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { GradientBackground } from './components/GradientBackground';
import { ProfilePage } from './pages/ProfilePage';

import { Dashboard } from './pages/Dashboard';
import { SkillAssessment } from './pages/SkillAssessment';
import { Resources } from './pages/Resources';
import { PlacementPreparation } from './pages/PlacementPreparation';
import { JobPortals } from './pages/JobPortals';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer';
import { MockInterview } from './pages/MockInterview';

import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/landing';
import ChatBot from './components/ChatBot';

const pageTitle: Record<string, string> = {
  dashboard: 'Dashboard',
  assessment: 'Skill Assessment',
  resources: 'Resources',
  placement: 'Placement Preparation',
  jobs: 'Job Portals',
  resume: 'Resume Analyzer',
  interview: 'Mock Interview',
  profile: 'My Profile',
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authPage, setAuthPage] = useState<'landing' | 'login' | 'register' | 'app'>('landing');
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [prevPage, setPrevPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resourceHighlight, setResourceHighlight] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // On mount: restore auth state AND last visited page
  useEffect(() => {
    const stored = localStorage.getItem('ml_user');
    const savedAuthPage = localStorage.getItem('ml_auth_page') as 'landing' | 'login' | 'register' | 'app' | null;
    const savedPage = localStorage.getItem('ml_current_page');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
        setIsAuthenticated(true);
        // Restore last page — default to 'app' if they were authenticated
        setAuthPage(savedAuthPage === 'app' ? 'app' : 'app');
        if (savedPage && savedPage !== 'profile') {
          setCurrentPage(savedPage);
        }
      } catch {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setAuthPage('landing');
      }
    } else {
      setIsAuthenticated(false);
      // Restore landing/login/register state for unauthenticated users
      if (savedAuthPage === 'login' || savedAuthPage === 'register') {
        setAuthPage(savedAuthPage);
      } else {
        setAuthPage('landing');
      }
    }
  }, []);

  // Persist authPage whenever it changes
  useEffect(() => {
    if (isAuthenticated !== null) {
      localStorage.setItem('ml_auth_page', authPage);
    }
  }, [authPage, isAuthenticated]);

  // Persist currentPage whenever it changes
  useEffect(() => {
    if (currentPage) {
      localStorage.setItem('ml_current_page', currentPage);
    }
  }, [currentPage]);

  const handleAuthSuccess = (user: any) => {
    localStorage.setItem('ml_user', JSON.stringify(user));
    setIsAuthenticated(true);
    setCurrentUser(user);
    setCurrentPage('dashboard');
    setAuthPage('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('ml_user');
    localStorage.removeItem('ml_auth_page');
    localStorage.removeItem('ml_current_page');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthPage('landing');
  };

  const handleUserUpdate = (updatedUser: any) => {
    setCurrentUser(updatedUser);
  };

  const handleOpenProfile = () => {
    setPrevPage(currentPage);
    setCurrentPage('profile');
  };

  const handleBackFromProfile = () => {
    setCurrentPage(prevPage);
  };

  if (isAuthenticated === null) return null;

  if (authPage === 'landing') {
    return (
      <Landing
        isAuthenticated={!!isAuthenticated}
        onLogin={() => setAuthPage('login')}
        onRegister={() => setAuthPage('register')}
        onContinue={() => (isAuthenticated ? setAuthPage('app') : setAuthPage('login'))}
        onLogout={handleLogout}
      />
    );
  }

  if (!isAuthenticated) {
    return authPage === 'login' ? (
      <Login onSuccess={handleAuthSuccess} onSwitch={() => setAuthPage('register')} />
    ) : (
      <Register onSuccess={handleAuthSuccess} onSwitch={() => setAuthPage('login')} />
    );
  }

  // Full-screen Profile Page (no sidebar/header)
  if (currentPage === 'profile') {
    return (
      <>
        <ProfilePage
          currentUser={currentUser}
          onBack={handleBackFromProfile}
          onUserUpdate={handleUserUpdate}
        />
        <ChatBot
          onNavigateToResources={(id) => {
            setResourceHighlight(id);
            setCurrentPage('resources');
            setTimeout(() => setResourceHighlight(null), 4000);
          }}
        />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':  return <Dashboard />;
      case 'assessment': return <SkillAssessment />;
      case 'resources':  return <Resources highlightId={resourceHighlight} />;
      case 'placement':  return <PlacementPreparation />;
      case 'jobs':       return <JobPortals />;
      case 'resume':     return <ResumeAnalyzer />;
      case 'interview':  return <MockInterview />;
      default:           return <Dashboard />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <GradientBackground />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: 'calc(100% - 260px)' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={pageTitle[currentPage]}
          user={currentUser}
          onLogout={handleLogout}
          onProfile={handleOpenProfile}
        />

        <Box sx={{
          flexGrow: 1,
          mt: '64px',
          p: { xs: 2, sm: 3, md: 4 },
          overflowY: 'auto',
          width: '100%',
        }}>
          {renderPage()}
        </Box>
      </Box>

      <ChatBot
        onNavigateToResources={(id) => {
          setResourceHighlight(id);
          setCurrentPage('resources');
          setTimeout(() => setResourceHighlight(null), 4000);
        }}
      />
    </Box>
  );
}

export default App;
