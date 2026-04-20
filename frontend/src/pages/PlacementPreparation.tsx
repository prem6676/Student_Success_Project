import { Box, Card, CardContent, Typography, Button, Grid, Chip, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { BookMarked, ExternalLink, Award, Code, FileText, Users, Zap } from 'lucide-react';

interface EducationSite {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  speciality: string;
  url: string;
  features: string[];
}

const educationSites: EducationSite[] = [
  {
    id: 'prepinsta',
    name: 'PrepInsta',
    description: 'One-stop destination for placement preparation with courses, contests, and mock interviews',
    icon: Award,
    color: '#FF6B6B',
    speciality: 'Comprehensive Placement Training',
    url: 'https://www.prepinsta.com',
    features: ['Live Contests', 'Mock Interviews', 'Placement Guarantees', 'Interview Experiences'],
  },
  {
    id: 'geeksforgeeks',
    name: 'GeeksforGeeks (GFG)',
    description: 'Largest computer science portal with tutorials, DSA, and interview preparation',
    icon: Code,
    color: '#2DBE60',
    speciality: 'Data Structures & Algorithms',
    url: 'https://www.geeksforgeeks.org',
    features: ['DSA Problems', 'Interview Questions', 'Tutorials', 'Practice Contests'],
  },
  {
    id: 'strivers',
    name: 'Striver Sheet (TakeUForward)',
    description: 'Curated list of 180+ coding problems for interview preparation',
    icon: FileText,
    color: '#4ECDC4',
    speciality: 'Problem Solving Roadmap',
    url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2',
    features: ['180+ DSA Problems', 'Topic Wise', 'Solutions Included', 'Difficulty Level'],
  },
  {
    id: 'leetcode',
    name: 'LeetCode',
    description: 'Premium coding platform with thousands of problems and contests',
    icon: Code,
    color: '#FFA500',
    speciality: 'Competitive Programming',
    url: 'https://www.leetcode.com',
    features: ['1000+ Problems', 'Mock Interviews', 'Company Wise Problems', 'Contests'],
  },
  {
    id: 'interviewbit',
    name: 'InterviewBit',
    description: 'Structured interview preparation with company-specific problems',
    icon: Users,
    color: '#667EEA',
    speciality: 'Company Specific Prep',
    url: 'https://www.interviewbit.com',
    features: ['Company Problems', 'System Design', 'Mock Interviews', 'Success Stories'],
  },
  {
    id: 'hackerrank',
    name: 'HackerRank',
    description: 'Coding challenges and certifications for skill verification',
    icon: Zap,
    color: '#1BA98C',
    speciality: 'Skill Certifications',
    url: 'https://www.hackerrank.com',
    features: ['Certifications', 'Challenges', 'Skill Tests', 'Domain Wise'],
  },
  {
    id: 'scaler',
    name: 'Scaler (InterviewBit Academy)',
    description: 'Live interactive classes for DSA and system design mastery',
    icon: Award,
    color: '#FF6B9D',
    speciality: 'Live Coding Classes',
    url: 'https://www.scaler.com',
    features: ['Live Classes', 'DSA Mastery', 'Job Guarantee', 'Doubt Support'],
  },
  {
    id: 'codechef',
    name: 'CodeChef',
    description: 'Competitive programming platform with global contests and learning resources',
    icon: Code,
    color: '#5B42F3',
    speciality: 'Competitive Contests',
    url: 'https://www.codechef.com',
    features: ['Monthly Contests', 'Tutorials', 'Mentorship', 'Internships'],
  },
];

export const PlacementPreparation = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BookMarked size={32} color="#2196f3" />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Placement Preparation Resources
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Curated education platforms for your interview and placement success
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {educationSites.map((site, index) => {
          const Icon = site.icon;
          return (
            <Grid item xs={12} sm={6} lg={4} key={site.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 6,
                      background: `linear-gradient(90deg, ${site.color}, ${site.color}80)`,
                    }}
                  />

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background: `${site.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={28} color={site.color} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {site.name}
                        </Typography>
                        <Chip
                          label={site.speciality}
                          size="small"
                          sx={{
                            mt: 0.5,
                            bgcolor: `${site.color}20`,
                            color: site.color,
                            fontWeight: 500,
                            height: 24,
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {site.description}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, flex: 1 }}>
                      {site.features.map((feature) => (
                        <Tooltip key={feature} title={feature}>
                          <Chip
                            label={feature}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: `${site.color}50`,
                              color: site.color,
                              fontSize: '0.75rem',
                              height: 28,
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>

                    <Button
                      variant="contained"
                      endIcon={<ExternalLink size={16} />}
                      onClick={() => window.open(site.url, '_blank')}
                      fullWidth
                      sx={{
                        background: `linear-gradient(135deg, ${site.color}, ${site.color}dd)`,
                        color: 'white',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${site.color}, ${site.color}99)`,
                        },
                      }}
                    >
                      Visit Website
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
