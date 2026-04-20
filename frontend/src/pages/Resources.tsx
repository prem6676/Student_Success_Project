import { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Chip, TextField, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Code, Database, Globe, Brain, Cpu, LineChart, Search, Server, Shield, Smartphone } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  topics: string[];
  links: { name: string; url: string; type: 'video' | 'article' | 'practice' | 'course' | 'docs' }[];
}

const resources: Resource[] = [
  {
    id: 'java',
    title: 'Java Programming',
    description: 'Master Java fundamentals, OOP concepts, and advanced features',
    icon: Code,
    color: '#f44336',
    topics: ['Core Java', 'Collections', 'Multithreading', 'Spring Boot', 'JVM', 'Design Patterns'],
    links: [
      { name: 'Java Full Course – Telusko', url: 'https://www.youtube.com/watch?v=BGTx91t8q50', type: 'video' },
      { name: 'Java by Kunal Kushwaha', url: 'https://www.youtube.com/watch?v=rZ41y93P2Qo&list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ', type: 'video' },
      { name: 'GeeksforGeeks Java', url: 'https://www.geeksforgeeks.org/java/', type: 'article' },
      { name: 'Java Documentation', url: 'https://docs.oracle.com/en/java/', type: 'docs' },
      { name: 'Spring Boot Guides', url: 'https://spring.io/guides', type: 'docs' },
      { name: 'LeetCode – Java Problems', url: 'https://leetcode.com/problemset/?topicSlugs=java', type: 'practice' },
      { name: 'Baeldung – Java Tutorials', url: 'https://www.baeldung.com/', type: 'article' },
    ],
  },
  {
    id: 'python',
    title: 'Python Development',
    description: 'Learn Python from basics to advanced libraries and frameworks',
    icon: Brain,
    color: '#4caf50',
    topics: ['Syntax', 'Data Structures', 'Django', 'Flask', 'FastAPI', 'Machine Learning'],
    links: [
      { name: 'Python for Beginners – freeCodeCamp', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', type: 'video' },
      { name: 'Python by Corey Schafer', url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU', type: 'video' },
      { name: 'Real Python', url: 'https://realpython.com/', type: 'article' },
      { name: 'GeeksforGeeks Python', url: 'https://www.geeksforgeeks.org/python-programming-language/', type: 'article' },
      { name: 'Python Official Docs', url: 'https://docs.python.org/3/', type: 'docs' },
      { name: 'FastAPI Documentation', url: 'https://fastapi.tiangolo.com/', type: 'docs' },
      { name: 'HackerRank – Python', url: 'https://www.hackerrank.com/domains/python', type: 'practice' },
    ],
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    description: 'Essential DSA concepts for coding interviews and problem solving',
    icon: Cpu,
    color: '#2196f3',
    topics: ['Arrays', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Recursion'],
    links: [
      { name: "Striver's A2Z DSA Sheet", url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2', type: 'course' },
      { name: 'DSA by Abdul Bari', url: 'https://www.youtube.com/watch?v=0IAPZzGSbME&list=PLAXnLdrLnQpRcveZTtD644gM9uzYqJCwr', type: 'video' },
      { name: 'NeetCode Roadmap', url: 'https://neetcode.io/roadmap', type: 'course' },
      { name: 'LeetCode Problemset', url: 'https://leetcode.com/problemset/all/', type: 'practice' },
      { name: 'GeeksforGeeks DSA', url: 'https://www.geeksforgeeks.org/data-structures/', type: 'article' },
      { name: 'Codeforces – Contests', url: 'https://codeforces.com/', type: 'practice' },
      { name: 'Visualgo – Visualizations', url: 'https://visualgo.net/en', type: 'docs' },
    ],
  },
  {
    id: 'webdev',
    title: 'Web Development',
    description: 'Full-stack web development with modern frameworks and tools',
    icon: Globe,
    color: '#ff9800',
    topics: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'TypeScript', 'Next.js'],
    links: [
      { name: 'The Odin Project', url: 'https://www.theodinproject.com/', type: 'course' },
      { name: 'freeCodeCamp Web Dev', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', type: 'course' },
      { name: 'React Official Docs', url: 'https://react.dev/', type: 'docs' },
      { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/', type: 'docs' },
      { name: 'JavaScript.info', url: 'https://javascript.info/', type: 'article' },
      { name: 'Traversy Media – YouTube', url: 'https://www.youtube.com/@TraversyMedia', type: 'video' },
      { name: 'Frontend Mentor – Challenges', url: 'https://www.frontendmentor.io/', type: 'practice' },
    ],
  },
  {
    id: 'database',
    title: 'Database Management',
    description: 'Learn SQL, NoSQL, and database design principles',
    icon: Database,
    color: '#9c27b0',
    topics: ['SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Database Design', 'Indexing'],
    links: [
      { name: 'SQL Tutorial – W3Schools', url: 'https://www.w3schools.com/sql/', type: 'article' },
      { name: 'MongoDB University', url: 'https://learn.mongodb.com/', type: 'course' },
      { name: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'article' },
      { name: 'GeeksforGeeks DBMS', url: 'https://www.geeksforgeeks.org/dbms/', type: 'article' },
      { name: 'SQLZoo – Practice', url: 'https://sqlzoo.net/', type: 'practice' },
      { name: 'Redis University', url: 'https://university.redis.com/', type: 'course' },
      { name: 'DB Fiddle – SQL Playground', url: 'https://www.db-fiddle.com/', type: 'practice' },
    ],
  },
  {
    id: 'datascience',
    title: 'Data Science & ML',
    description: 'Analytics, machine learning, and data visualization',
    icon: LineChart,
    color: '#00bcd4',
    topics: ['Statistics', 'ML Algorithms', 'Pandas', 'NumPy', 'TensorFlow', 'Visualization'],
    links: [
      { name: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', type: 'course' },
      { name: 'fast.ai – Practical Deep Learning', url: 'https://www.fast.ai/', type: 'course' },
      { name: 'Towards Data Science', url: 'https://towardsdatascience.com/', type: 'article' },
      { name: 'Scikit-learn Docs', url: 'https://scikit-learn.org/stable/', type: 'docs' },
      { name: 'StatQuest – YouTube', url: 'https://www.youtube.com/@statquest', type: 'video' },
      { name: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', type: 'course' },
      { name: 'Kaggle Competitions', url: 'https://www.kaggle.com/competitions', type: 'practice' },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud',
    description: 'CI/CD, containerization, and cloud platforms',
    icon: Server,
    color: '#ff5722',
    topics: ['Docker', 'Kubernetes', 'AWS', 'GitHub Actions', 'Linux', 'CI/CD'],
    links: [
      { name: 'Docker Official Docs', url: 'https://docs.docker.com/', type: 'docs' },
      { name: 'AWS Free Tier + Training', url: 'https://aws.amazon.com/training/', type: 'course' },
      { name: 'TechWorld with Nana – YouTube', url: 'https://www.youtube.com/@TechWorldwithNana', type: 'video' },
      { name: 'Linux Journey', url: 'https://linuxjourney.com/', type: 'course' },
      { name: 'KodeKloud – DevOps', url: 'https://kodekloud.com/', type: 'course' },
      { name: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions', type: 'docs' },
      { name: 'Play with Docker', url: 'https://labs.play-with-docker.com/', type: 'practice' },
    ],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Ethical hacking, network security, and secure coding practices',
    icon: Shield,
    color: '#607d8b',
    topics: ['Network Security', 'Ethical Hacking', 'OWASP', 'Cryptography', 'Penetration Testing'],
    links: [
      { name: 'TryHackMe', url: 'https://tryhackme.com/', type: 'practice' },
      { name: 'Hack The Box', url: 'https://www.hackthebox.com/', type: 'practice' },
      { name: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', type: 'docs' },
      { name: 'Cybrary – Free Courses', url: 'https://www.cybrary.it/', type: 'course' },
      { name: 'Professor Messer – CompTIA', url: 'https://www.professormesser.com/', type: 'video' },
      { name: 'PortSwigger Web Security', url: 'https://portswigger.net/web-security', type: 'course' },
      { name: 'SANS Cyber Aces', url: 'https://www.cyberaces.org/', type: 'course' },
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile Development',
    description: 'Build Android and iOS apps with modern frameworks',
    icon: Smartphone,
    color: '#3f51b5',
    topics: ['React Native', 'Flutter', 'Android', 'iOS', 'Expo', 'Kotlin'],
    links: [
      { name: 'React Native Docs', url: 'https://reactnative.dev/docs/getting-started', type: 'docs' },
      { name: 'Flutter Documentation', url: 'https://flutter.dev/docs', type: 'docs' },
      { name: 'Android Developers', url: 'https://developer.android.com/courses', type: 'course' },
      { name: 'William Candillon – React Native', url: 'https://www.youtube.com/@wcandillon', type: 'video' },
      { name: 'Flutter by Vandad Nahavandipoor', url: 'https://www.youtube.com/watch?v=VPvVD8t02U8', type: 'video' },
      { name: 'Expo Snack – Playground', url: 'https://snack.expo.dev/', type: 'practice' },
      { name: 'AppBrewery – Flutter Bootcamp', url: 'https://www.appbrewery.co/p/flutter-development-bootcamp-with-dart', type: 'course' },
    ],
  },
];

// Type badge colors
const typeBadge: Record<string, { bg: string; color: string; label: string }> = {
  video:    { bg: '#ff000020', color: '#f44336', label: '▶ Video' },
  course:   { bg: '#4caf5020', color: '#4caf50', label: '🎓 Course' },
  article:  { bg: '#ff980020', color: '#ff9800', label: '📄 Article' },
  practice: { bg: '#2196f320', color: '#2196f3', label: '💻 Practice' },
  docs:     { bg: '#9c27b020', color: '#9c27b0', label: '📚 Docs' },
};

interface ResourcesProps {
  highlightId?: string | null;
}

export const Resources = ({ highlightId }: ResourcesProps) => {
  const [search, setSearch] = useState('');
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [glowing, setGlowing] = useState<string | null>(null);

  // Auto-scroll + glow when chatbot navigates here
  useEffect(() => {
    if (highlightId) {
      setGlowing(highlightId);
      setTimeout(() => {
        cardRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      setTimeout(() => setGlowing(null), 3000);
    }
  }, [highlightId]);

  const filtered = resources.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.topics.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BookOpen size={32} color="#2196f3" />
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Learning Resources
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Curated resources to boost your skills
          </Typography>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search by topic, e.g. Java, DSA, Docker..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filtered.map((resource, index) => {
          const Icon = resource.icon;
          const isGlowing = glowing === resource.id;
          return (
            <Grid item xs={12} md={6} key={resource.id}>
              <div ref={(el) => { cardRefs.current[resource.id] = el; }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.07 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
                      overflow: 'visible',
                      transition: 'box-shadow 0.4s ease',
                      boxShadow: isGlowing
                        ? `0 0 0 3px ${resource.color}, 0 8px 32px ${resource.color}55`
                        : undefined,
                      '&:hover': { boxShadow: 6 },
                    }}
                  >
                    <CardContent>
                      {/* Title row */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: `${resource.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={28} color={resource.color} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                          {resource.title}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {resource.description}
                      </Typography>

                      {/* Topic chips */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {resource.topics.map((topic) => (
                          <Chip
                            key={topic}
                            label={topic}
                            size="small"
                            sx={{
                              bgcolor: `${resource.color}15`,
                              color: resource.color,
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Box>

                      {/* Links */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {resource.links.map((link) => {
                          const badge = typeBadge[link.type];
                          return (
                            <Button
                              key={link.name}
                              variant="outlined"
                              endIcon={<ExternalLink size={14} />}
                              onClick={() => window.open(link.url, '_blank')}
                              sx={{
                                justifyContent: 'space-between',
                                borderColor: `${resource.color}50`,
                                color: resource.color,
                                textAlign: 'left',
                                '&:hover': {
                                  borderColor: resource.color,
                                  bgcolor: `${resource.color}10`,
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  component="span"
                                  sx={{
                                    fontSize: '10px',
                                    px: 0.8,
                                    py: 0.2,
                                    borderRadius: 1,
                                    bgcolor: badge.bg,
                                    color: badge.color,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {badge.label}
                                </Box>
                                {link.name}
                              </Box>
                            </Button>
                          );
                        })}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
