import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { decodeToken } from '../utils/decodeToken';
import LatestJobs from '../components/LatestJobs';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quotes = [
    "Success is not final; failure is not fatal. It is the courage to continue that counts.",
    "The future depends on what you do today.",
    "Don't watch the clock; do what it does. Keep going.",
    "Opportunities don't happen. You create them.",
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = decodeToken(token);
          if (decoded?.role && decoded?.name) {
            setRole(decoded.role);
            setUserName(decoded.name);
          } else {
            setRole(null);
            setUserName(null);
          }
        } catch (error) {
          setRole(null);
          setUserName(null);
        }
      } else {
        setRole(null);
        setUserName(null);
      }
    };
  
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, [location]);
  

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #dfe9f3 0%, #ffffff 100%)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(135deg, rgba(122,95,255,0.9) 0%, rgba(168,144,255,0.8) 100%)',
          color: 'white',
          borderRadius: 6,
          my: 6,
          mx: 'auto',
          p: 6,
          maxWidth: 800,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <Typography variant="h3" fontWeight="bold" mb={2}>
          {userName ? `${getGreeting()}, ${userName}` : 'Discover Your Dream Job'}
        </Typography>
        <Typography variant="subtitle1" mb={3}>
          {userName ? today : 'Join thousands of job seekers and employers'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/jobs')}
          sx={{
            background: 'white',
            color: '#7A5FFF',
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 'bold',
            boxShadow: 3,
            '&:hover': {
              background: '#f1f5ff',
            },
          }}
        >
          {userName ? 'Explore Opportunities' : 'Get Started'}
        </Button>
      </Box>

      {/* Action Cards */}
      {userName && (
        <Container sx={{ my: 6 }}>
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={4}>
            {role === 'Employer' ? (
              <>
                <ActionCard
                  icon={<WorkIcon sx={{ fontSize: 40, color: '#7A5FFF' }} />}
                  title="Post a Job"
                  description="Reach top talent fast."
                  onClick={() => navigate('/post-job')}
                />
                <ActionCard
                  icon={<AssignmentIndIcon sx={{ fontSize: 40, color: '#7A5FFF' }} />}
                  title="My Job Listings"
                  description="Manage and edit your job posts."
                  onClick={() => navigate('/my-jobs')}
                />
              </>
            ) : (
              <>
                <ActionCard
                  icon={<WorkIcon sx={{ fontSize: 40, color: '#7A5FFF' }} />}
                  title="Browse Jobs"
                  description="Find jobs that match your skills."
                  onClick={() => navigate('/jobs')}
                />
                <ActionCard
                  icon={<AssignmentIndIcon sx={{ fontSize: 40, color: '#7A5FFF' }} />}
                  title="My Applications"
                  description="Track your job applications."
                  onClick={() => navigate('/my-applications')}
                />
              </>
            )}
          </Box>
        </Container>
      )}

      {/* Quote */}
      <Box sx={{ textAlign: 'center', mt: 4, px: 2 }}>
        <Typography variant="h6" fontStyle="italic" color="text.secondary">
          “{randomQuote}”
        </Typography>
      </Box>

      {/* Latest Jobs */}
        <Box sx={{ mt: 6, px: 2 }}>
          <LatestJobs />
        </Box>
      
    </Box>
  );
};

const ActionCard = ({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <Card
    onClick={onClick}
    sx={{
      width: 280,
      p: 3,
      borderRadius: 4,
      textAlign: 'center',
      cursor: 'pointer',
      background: 'rgba(255, 255, 255, 0.6)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        transform: 'translateY(-5px)',
        transition: 'all 0.3s ease',
      },
    }}
  >
    <CardContent>
      <Box mb={1}>{icon}</Box>
      <Typography variant="h6" fontWeight="bold" mb={1}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

export default HomePage;
