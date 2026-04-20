import { Box } from '@mui/material';
import { motion } from 'framer-motion';

export const GradientBackground = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(33, 150, 243, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(156, 39, 176, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(233, 30, 99, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(33, 150, 243, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 80% 20%, rgba(156, 39, 176, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 80%, rgba(233, 30, 99, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 20%, rgba(33, 150, 243, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(156, 39, 176, 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    </Box>
  );
};
