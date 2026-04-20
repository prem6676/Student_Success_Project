import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, ListItemIcon } from '@mui/material';
import { Menu as MenuIcon, LogOut, User } from 'lucide-react';
import { JobNotificationBell } from './JobNotificationPanel';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  onLogout?: () => void;
  onProfile?: () => void;
  user?: { name?: string; email?: string } | null;
}

export const Header = ({ onMenuClick, title, onLogout, onProfile, user }: HeaderProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    onProfile?.();
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    onLogout?.();
  };

  const initials =
    (user?.name &&
      user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase())
        .join('')) ||
    (user?.email ? user.email.charAt(0).toUpperCase() : '?');

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(30, 30, 30, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 1px 3px rgba(0, 0, 0, 0.3)'
            : '0 1px 3px rgba(0, 0, 0, 0.1)',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        {/* Hamburger — mobile only */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon size={24} />
        </IconButton>

        {/* Page title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {title}
        </Typography>

        {/* ── Right side actions ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

          {/* Job notification bell — always visible when logged in */}
          {user && <JobNotificationBell />}

          {/* Profile avatar + dropdown */}
          {user && (
            <>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{ ml: 0.5 }}
                aria-haspopup="true"
                aria-controls={menuOpen ? 'profile-menu' : undefined}
                aria-expanded={menuOpen ? 'true' : undefined}
              >
                <Avatar
                  sx={{
                    width: 32, height: 32,
                    background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
              </IconButton>

              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {/* User info at top of menu */}
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', minWidth: 180 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{user.name || 'User'}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{user.email}</Typography>
                </Box>

                <MenuItem onClick={handleProfileClick}>
                  <ListItemIcon><User size={18} /></ListItemIcon>
                  My Profile
                </MenuItem>

                {onLogout && (
                  <MenuItem onClick={handleLogoutClick}>
                    <ListItemIcon><LogOut size={18} /></ListItemIcon>
                    Logout
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
