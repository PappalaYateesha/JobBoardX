import React, { useEffect, useState } from 'react';
import {Typography,Box,Snackbar,Alert,CircularProgress,Chip,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,IconButton,Tooltip,
  Button} from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const MyJobsPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });


  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/jobs/my-jobs', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs', error);
        setSnackbar({ open: true, message: 'Failed to fetch jobs', severity: 'error' });
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== id));
      setSnackbar({ open: true, message: 'Job deleted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting job', error);
      setSnackbar({ open: true, message: 'Failed to delete the job', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Typography variant="h4" fontWeight={600} sx={{ color: '#2D2F48' }}>
          My Posted Jobs
        </Typography>

        <Button
          component={Link}
          to="/post-job"
          variant="contained"
          sx={{
            backgroundColor: '#7A5FFF',
            borderRadius: 2,
            fontWeight: 500,
            px: 3,
            py: 1,
            boxShadow: '0 3px 10px rgba(122, 95, 255, 0.3)',
            '&:hover': {
              backgroundColor: '#6750f0',
              boxShadow: '0 4px 12px rgba(122, 95, 255, 0.4)',
            },
          }}
        >
          + Post New Job
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress color="secondary" />
        </Box>
      ) : jobs.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f9f9fb' }}>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Openings</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Experience</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Posted</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow
                  key={job._id}
                  hover
                  sx={{ transition: '0.2s', '&:hover': { backgroundColor: '#f5f5f7' } }}
                >
                  <TableCell>
                    <Typography fontWeight={600} color="#2D2F48">
                      {job.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{job.numberOfOpenings || 1}</TableCell>
                  <TableCell>
                    <Chip
                      label={job.employmentType}
                      size="small"
                      sx={{ backgroundColor: '#7A5FFF', color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.experienceLevel}
                      size="small"
                      sx={{ backgroundColor: '#e1f5fe', color: '#0277bd' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.status === 'Closed' ? 'Closed' : 'Open'}
                      size="small"
                      color={job.status === 'Closed' ? 'error' : 'success'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(job.createdAt).fromNow()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Tooltip title="Applicants">
                        <IconButton
                          component={Link}
                          to={`/applications/job/${job._id}`}
                          color="primary"
                        >
                          <GroupIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          component={Link}
                          to={`/employer/jobs/${job._id}/edit`}
                          color="secondary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(job._id)} color="error">
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" color="text.secondary">
          You haven’t posted any jobs yet.
        </Typography>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyJobsPage;
