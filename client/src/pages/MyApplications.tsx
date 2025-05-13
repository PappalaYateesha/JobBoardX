import React, { useEffect, useState } from 'react';
import axios from '../services/axiosInstance';
import {Accordion,AccordionSummary,AccordionDetails,Box,Button,Chip,Container,Typography,TextField,MenuItem,Select,InputLabel,FormControl,Pagination
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const statusColor = (status: string) => {
  switch (status) {
    case 'Reviewed':
      return 'info';
    case 'Accepted':
      return 'success';
    case 'Rejected':
      return 'error';
    default:
      return 'default';
  }
};

const ITEMS_PER_PAGE = 10;

const MyApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApps, setFilteredApps] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/applications/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data);
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };
    fetchApplications();
  }, []);

  useEffect(() => {
    let apps = [...applications];

    if (statusFilter !== 'All') {
      apps = apps.filter((app) => app.status === statusFilter);
    }

    if (searchTerm) {
      apps = apps.filter((app) =>
        app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortOption) {
      case 'Title':
        apps.sort((a, b) => a.job?.title?.localeCompare(b.job?.title || '') || 0);
        break;
      case 'Company':
        apps.sort((a, b) => a.job?.company?.localeCompare(b.job?.company || '') || 0);
        break;
      case 'Oldest':
        apps.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      default:
        apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredApps(apps);
    setPage(1);
  }, [applications, searchTerm, statusFilter, sortOption]);

  const handleDeleteApplication = async (appId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/applications/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications((prev) => prev.filter((a) => a._id !== appId));
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const paginatedApps = filteredApps.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Applications
      </Typography>

      {/* Filters */}
      <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
        <TextField
          label="Search by Title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Accepted">Accepted</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="Reviewed">Reviewed</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortOption}
            label="Sort By"
            onChange={(e) => setSortOption(e.target.value)}
          >
            <MenuItem value="Newest">Newest</MenuItem>
            <MenuItem value="Oldest">Oldest</MenuItem>
            <MenuItem value="Title">Title</MenuItem>
            <MenuItem value="Company">Company</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Accordion List or Empty State */}
      <Box mt={4}>
        {filteredApps.length === 0 ? (
          <Box
            textAlign="center"
            p={4}
            borderRadius={3}
            bgcolor="rgba(255,255,255,0.05)"
            sx={{
              backdropFilter: 'blur(6px)',
              border: '1px dashed rgba(255, 255, 255, 0.2)',
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              No applications found
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Try adjusting your filters or search term.
            </Typography>
            <Button variant="contained" href="/jobs" sx={{ mt: 2 }}>
              Explore Jobs
            </Button>
          </Box>
        ) : (
          paginatedApps.map((app) => (
            <Accordion
              key={app._id}
              sx={{
                mb: 2,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&::before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box flex={1}>
                  <Typography fontWeight={600}>
                    {app.job?.title || 'Job no longer available'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {app.job?.company || 'This job has been removed or closed'}
                  </Typography>
                </Box>
                <Chip
                  label={app.status}
                  color={statusColor(app.status)}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </AccordionSummary>

              <AccordionDetails>
                <Typography variant="body2" gutterBottom>
                  Applied on: {new Date(app.createdAt).toLocaleDateString()}
                </Typography>

                <Typography variant="body2" gutterBottom>
                  Cover Letter:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {app.coverLetter || 'No cover letter provided.'}
                </Typography>

                {app.job ? (
                  <>
                    {app.resumeLink && (
                      <Button
                        variant="contained"
                        href={app.resumeLink}
                        target="_blank"
                        sx={{ mt: 2 }}
                      >
                        View Resume
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="primary"
                      href={`/jobs?search=${encodeURIComponent(app.job.title || '')}`}
                      sx={{ mt: 2, ml: 2 }}
                    >
                      Find Similar Jobs
                    </Button>
                  </>
                ) : (
                  <Box mt={2}>
                    <Typography variant="body2" color="error">
                      The job associated with this application is no longer available.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      sx={{ mt: 2 }}
                      onClick={() => handleDeleteApplication(app._id)}
                    >
                      Remove from My Applications
                    </Button>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      {/* Pagination */}
      {filteredApps.length > 0 && (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={Math.ceil(filteredApps.length / ITEMS_PER_PAGE)}
            page={page}
            onChange={(_, value) => setPage(value)}
          />
        </Box>
      )}
    </Container>
  );
};

export default MyApplications;
