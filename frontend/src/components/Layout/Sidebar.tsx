import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Box, useTheme, useMediaQuery } from '@mui/material';
import { Home, Brain, BookOpen, FileText, Video, Menu as MenuIcon, X, Moon, Sun, Briefcase, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeContext } from '../../contexts/ThemeContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'assessment', label: 'Skill Assessment', icon: Brain },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'placement', label: 'Placement Prep', icon: Award },
  { id: 'jobs', label: 'Job Portals', icon: Briefcase },
  { id: 'resume', label: 'Resume Analyzer', icon: FileText },
  { id: 'interview', label: 'Mock Interview', icon: Video },
];

export const Sidebar = ({ open, onClose, currentPage, onNavigate }: SidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, toggleTheme } = useThemeContext();

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Brain size={32} color={theme.palette.primary.main} />
            <Box>
              <Box sx={{ fontWeight: 700, fontSize: '1.2rem' }}>StudentSuccess</Box>
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>AI-Powered Platform</Box>
            </Box>
          </Box>
        </motion.div>
        {isMobile && (
          <IconButton onClick={onClose}>
            <X size={20} />
          </IconButton>
        )}
      </Box>

      <List sx={{ flex: 1 }}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    onNavigate(item.id);
                    if (isMobile) onClose();
                  }}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      color: 'white',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? 'white' : 'inherit', minWidth: 40 }}>
                    <Icon size={20} />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            </motion.div>
          );
        })}
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>Theme</Box>
          <IconButton onClick={toggleTheme} color="primary">
            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer anchor="left" open={open} onClose={onClose}>
          <Box sx={{ width: 260 }}>{drawerContent}</Box>
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: 260,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 260,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};
