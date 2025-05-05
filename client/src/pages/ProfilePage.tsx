import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Chip, Divider, Stack, Avatar, Link, Card, CardContent, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h6">No profile data found.</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" mt={5} px={2}>
      <Paper elevation={3} sx={{
        p: 4,
        borderRadius: 4,
        backdropFilter: 'blur(10px)',
        background: 'rgba(255, 255, 255, 0.9)'
      }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar
            src={profile.avatar || '/default-avatar.jpg'}
            sx={{ width: 72, height: 72, bgcolor: '#7A5FFF' }}
          >
            {profile?.user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={600}>{profile.user?.name || 'No Name'}</Typography>
            <Typography color="text.secondary">{profile.headline || 'No headline provided.'}</Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Bio & Contact */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Bio</Typography>
          <Typography>{profile.bio || 'No bio provided.'}</Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Contact</Typography>
          <Typography><strong>Location:</strong> {profile.location || 'N/A'}</Typography>
          <Typography><strong>Phone:</strong> {profile.phone || 'N/A'}</Typography>
          {profile.website && (
            <Typography>
              <strong>Website:</strong>{' '}
              <Link href={profile.website} target="_blank" rel="noopener">Visit</Link>
            </Typography>
          )}
        </Box>

        {/* Skills */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Skills</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {profile.skills?.length > 0 ? (
              profile.skills.map((skill: string, idx: number) => (
                <Chip key={idx} label={skill} color="primary" variant="outlined" />
              ))
            ) : (
              <Typography>No skills listed.</Typography>
            )}
          </Stack>
        </Box>

        {/* Experience */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Experience</Typography>
          {profile.experience?.map((exp: any, index: number) => (
            <Card key={index} variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600}>
                  {exp.title} @ {exp.company}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(exp.from).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.to).toLocaleDateString()}
                </Typography>
                {exp.description && <Typography mt={1}>{exp.description}</Typography>}
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Education */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Education</Typography>
          {profile.education?.map((edu: any, index: number) => (
            <Card key={index} variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600}>
                  {edu.degree} in {edu.fieldOfStudy}
                </Typography>
                <Typography>{edu.school}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(edu.from).toLocaleDateString()} - {edu.current ? 'Present' : new Date(edu.to).toLocaleDateString()}
                </Typography>
                {edu.description && <Typography mt={1}>{edu.description}</Typography>}
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Social Links */}
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>Social Profiles</Typography>
          <Stack spacing={1}>
            {profile.linkedin && (
              <Link href={profile.linkedin} target="_blank" rel="noopener">LinkedIn</Link>
            )}
            {profile.github && (
              <Link href={profile.github} target="_blank" rel="noopener">GitHub</Link>
            )}
          </Stack>
        </Box>

        {/* Edit Profile Button */}
        <Box mt={4}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/profile')}
            sx={{ backgroundColor: '#7A5FFF', borderRadius: 2, px: 4 }}
          >
            Edit Profile
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
