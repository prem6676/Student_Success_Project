import { Box, Card, CardContent, Typography, Button, Grid, Chip, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { Briefcase, ExternalLink, Bell, MapPin, TrendingUp, Globe } from 'lucide-react';

interface JobPortal {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  focus: string;
  url: string;
  features: string[];
  bestFor: string;
}

const jobPortals: JobPortal[] = [
  {
    id: 'naukri',
    name: 'Naukri.com',
    description: 'India\'s leading job portal with millions of active job listings',
    icon: TrendingUp,
    color: '#007BFF',
    focus: 'All Industries',
    url: 'https://www.naukri.com',
    features: ['Job Alerts', 'Resume Upload', 'Company Profiles', 'Salary Comparison', 'Mock Tests'],
    bestFor: 'Comprehensive Job Search',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional networking platform with targeted job opportunities',
    icon: Globe,
    color: '#0A66C2',
    focus: 'All Sectors',
    url: 'https://www.linkedin.com/jobs',
    features: ['Job Alerts', 'Direct Messaging', 'Recommendations', 'Company Insights', 'Application Tracking'],
    bestFor: 'Professional Network',
  },
  {
    id: 'unstop',
    name: 'Unstop (formerly HackerEarth)',
    description: 'Connects students with internships and jobs through challenges and assessments',
    icon: TrendingUp,
    color: '#FF6B35',
    focus: 'Tech & Startups',
    url: 'https://unstop.com',
    features: ['Hackathons', 'Internships', 'Challenges', 'Job Opportunities', 'Campus Drives'],
    bestFor: 'Students & Fresh Graduates',
  },
  {
    id: 'aicte',
    name: 'AICTE Internships',
    description: 'Official portal for AICTE-approved internships and job opportunities',
    icon: Briefcase,
    color: '#1FBC9C',
    focus: 'Students',
    url: 'https://aicte-india.org/internships',
    features: ['Internship Programs', 'Industry Recognition', 'College Partnerships', 'Skill Development'],
    bestFor: 'Engineering Students',
  },
  {
    id: 'internshala',
    name: 'Internshala',
    description: 'India\'s largest platform for internships and fresher jobs',
    icon: Bell,
    color: '#6C40E6',
    focus: 'Internships & Freshers',
    url: 'https://internshala.com',
    features: ['Internship Programs', 'Virtual Internships', 'Fresher Jobs', 'Job Alerts', 'Skill Certification'],
    bestFor: 'Students & Freshers',
  },
  {
    id: 'indeed',
    name: 'Indeed',
    description: 'Global job search engine with jobs across all countries and industries',
    icon: Globe,
    color: '#003366',
    focus: 'Global',
    url: 'https://www.indeed.com',
    features: ['Global Jobs', 'Remote Work', 'Salary Info', 'Reviews', 'Job Alerts'],
    bestFor: 'International Opportunities',
  },
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    description: 'Company reviews and job listings with insider perspectives on salary and culture',
    icon: MapPin,
    color: '#1A73E8',
    focus: 'Company Research',
    url: 'https://www.glassdoor.com',
    features: ['Company Reviews', 'Salary Data', 'Interview Questions', 'CEO Ratings', 'Salary Comparison'],
    bestFor: 'Company Research',
  },
  {
    id: 'angel',
    name: 'AngelList',
    description: 'Startup job board connecting talent with innovative companies',
    icon: TrendingUp,
    color: '#000000',
    focus: 'Startups',
    url: 'https://angel.co/jobs',
    features: ['Startup Jobs', 'Equity Opportunities', 'Founder Profiles', 'Pitch Decks', 'Fundraising'],
    bestFor: 'Startup Enthusiasts',
  },
  {
    id: 'monster',
    name: 'Monster',
    description: 'Career development platform with jobs across various sectors',
    icon: Briefcase,
    color: '#006DB3',
    focus: 'All Industries',
    url: 'https://www.monsterindia.com',
    features: ['Job Search', 'Career Resources', 'Company Profiles', 'Job Alerts', 'Interview Tips'],
    bestFor: 'Job Seekers',
  },
  {
    id: 'flexjobs',
    name: 'FlexJobs',
    description: 'Remote and flexible job opportunities vetted for legitimacy',
    icon: Globe,
    color: '#4A90E2',
    focus: 'Remote Work',
    url: 'https://www.flexjobs.com',
    features: ['Remote Jobs', 'Flexible Work', 'Verified Jobs', 'Freelance Gigs', 'Skill Tests'],
    bestFor: 'Remote Workers',
  },
];

export const JobPortals = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Briefcase size={32} color="#2196f3" />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Job Portals & Opportunities
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore top job portals to find your perfect career opportunity
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {jobPortals.map((portal, index) => {
          const Icon = portal.icon;
          return (
            <Grid item xs={12} sm={6} lg={4} key={portal.id}>
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
                      background: `linear-gradient(90deg, ${portal.color}, ${portal.color}80)`,
                    }}
                  />

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background: `${portal.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={28} color={portal.color} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {portal.name}
                        </Typography>
                        <Chip
                          label={portal.focus}
                          size="small"
                          sx={{
                            mt: 0.5,
                            bgcolor: `${portal.color}20`,
                            color: portal.color,
                            fontWeight: 500,
                            height: 24,
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {portal.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" fontWeight="600" color="text.secondary">
                        Best For: <span style={{ color: portal.color }}>{portal.bestFor}</span>
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, flex: 1 }}>
                      {portal.features.map((feature) => (
                        <Tooltip key={feature} title={feature}>
                          <Chip
                            label={feature}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: `${portal.color}50`,
                              color: portal.color,
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
                      onClick={() => window.open(portal.url, '_blank')}
                      fullWidth
                      sx={{
                        background: `linear-gradient(135deg, ${portal.color}, ${portal.color}dd)`,
                        color: 'white',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${portal.color}, ${portal.color}99)`,
                        },
                      }}
                    >
                      Explore Opportunities
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
