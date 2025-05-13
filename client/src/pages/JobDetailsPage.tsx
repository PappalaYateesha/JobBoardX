import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Stack, Chip, Divider,
  Alert
} from '@mui/material';
import ApplyModal from '../components/ApplyModal';
import { useJobDetails } from '../hooks/useJobDetails';
import axios from '../services/axiosInstance';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [openApplyModal, setOpenApplyModal] = useState(false);

  const {
    job,
    isApplied,
    loading,
    setIsApplied,
    setLoading,
  } = useJobDetails(id);

  const handleApply = async ({
    
    resumeLink,
    coverLetter,
    jobId,
  }: {
    
    resumeLink: string;
    coverLetter: string;
    jobId: string;
  }): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return false;
      }

      setLoading(true);
      const response = await axios.post(
        '/api/applications',
        { resumeLink, coverLetter, jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setIsApplied(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error applying:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  if (!job) {
    return (
      <Box minHeight="80vh" display="flex" justifyContent="center" alignItems="center">
        <Typography variant="h6" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: 2 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={700}>{job.title}</Typography>
          `{job.status === 'Closed' && (
    <Alert severity="warning" variant="filled" sx={{ borderRadius: 2 }}>
      This job is closed and is no longer accepting applications.
    </Alert>
  )}`
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
            <Chip label={job.company} color="primary" />
            {job.isRemote ? (
              <Chip label="Remote" color="success" />
            ) : (
              <Chip label={job.location} color="secondary" />
            )}
            <Chip label={job.employmentType} variant="outlined" />
            <Chip label={`${job.experienceLevel} Level`} variant="outlined" />
            <Chip label={job.status} color={job.status === 'Open' ? 'success' : 'default'} />
          </Stack>

          <Typography variant="h6" mt={2}>Job Description</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{job.description}</Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Box>
              <Typography fontWeight={600}>Industry:</Typography>
              <Typography>{job.industry || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography fontWeight={600}>Salary:</Typography>
              <Typography>{job.salary || 'Not Disclosed'}</Typography>
            </Box>
            <Box>
              <Typography fontWeight={600}>Number of Openings:</Typography>
              <Typography>{job.numberOfOpenings}</Typography>
            </Box>
            <Box>
              <Typography fontWeight={600}>Application Deadline:</Typography>
              <Typography>
                {job.applicationDeadline
                  ? new Date(job.applicationDeadline).toLocaleDateString()
                  : 'Not specified'}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {job.skillsRequired?.length > 0 && (
            <>
              <Typography fontWeight={600}>Required Skills:</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {job.skillsRequired.map((skill: string, index: number) => (
                  <Chip key={index} label={skill} variant="outlined" />
                ))}
              </Stack>
            </>
          )}

          {job.jobBenefits?.length > 0 && (
            <>
              <Typography fontWeight={600} mt={2}>Job Benefits:</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {job.jobBenefits.map((benefit: string, index: number) => (
                  <Chip key={index} label={benefit} color="info" variant="outlined" />
                ))}
              </Stack>
            </>
          )}

<Box mt={3}>
  {job.status === 'Closed' ? (
    <Button variant="outlined" color="error" fullWidth disabled>
      Applications Closed
    </Button>
  ) : isApplied ? (
    <Button variant="outlined" color="success" fullWidth disabled>
      Already Applied
    </Button>
  ) : (
    <Button
      variant="contained"
      fullWidth
      disabled={loading}
      onClick={() => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
        } else {
          setOpenApplyModal(true);
        }
      }}
    >
      {loading ? 'Applying...' : 'Apply Now'}
    </Button>
  )}
</Box>

        </Stack>
      </Paper>

      <ApplyModal
  open={openApplyModal}
  handleClose={() => setOpenApplyModal(false)}
  onSubmit={handleApply}
  jobId={job._id}
/>

    </Box>
  );
};

export default JobDetailsPage;
