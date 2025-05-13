import React, { useEffect, useState } from 'react';
import axios from "../services/axiosInstance";
import {Avatar,Box,Button,Container,FormControl,MenuItem,Select,Snackbar,Alert,Stack,Typography,Table,TableBody,TableCell,TableContainer,TableHead,
  TableRow,Paper,Chip,IconButton,Collapse} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

const statusOptions = ['Applied', 'Reviewed', 'Accepted', 'Rejected'];

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

const getInitials = (name: string) =>
  name?.split(' ').map((word) => word[0]).join('').toUpperCase();

const Applicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [statusMap, setStatusMap] = useState<{ [id: string]: string }>({});
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `/api/applications/job/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setApplicants(response.data);
        setStatusMap(
          response.data.reduce((acc: any, app: any) => {
            acc[app._id] = app.status;
            return acc;
          }, {})
        );
      } catch (err) {
        console.error('Error fetching applicants:', err);
      }
    };

    if (id) fetchApplicants();
  }, [id]);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/applications/${applicationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplicants((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
    } catch (err) {
      console.error('Status update failed:', err);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        ← Back
      </Button>

      <Typography variant="h4" fontWeight="bold" color="#2D2F48" mb={3}>
        Job Applicants
      </Typography>

      {applicants.length ? (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                <TableCell>Applicant</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Update</TableCell>
                <TableCell>Resume</TableCell>
                <TableCell>Cover Letter</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applicants.map((app) => (
                <>
                  <TableRow key={app._id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: '#7A5FFF' }}>
                          {getInitials(app.applicant?.name || 'U')}
                        </Avatar>
                        <Typography>{app.applicant?.name || 'Unnamed'}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{app.applicant?.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusMap[app._id]}
                        color={statusColor(statusMap[app._id])}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={statusMap[app._id]}
                          onChange={(e) =>
                            setStatusMap({ ...statusMap, [app._id]: e.target.value })
                          }
                        >
                          {statusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        sx={{ mt: 1 }}
                        disabled={statusMap[app._id] === app.status}
                        onClick={() => handleStatusChange(app._id, statusMap[app._id])}
                      >
                        Update
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        href={app.resumeLink}
                        target="_blank"
                        sx={{
                          backgroundColor: '#7A5FFF',
                          '&:hover': { backgroundColor: '#684ef0' },
                          textTransform: 'none',
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [app._id]: !prev[app._id],
                          }))
                        }
                      >
                        {expanded[app._id] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 0 }}>
                      <Collapse in={expanded[app._id]}>
                        <Box sx={{ p: 2, backgroundColor: '#f9fafb' }}>
                          <Typography variant="body2" whiteSpace="pre-wrap">
                            {app.coverLetter || 'No cover letter provided.'}
                          </Typography>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography mt={5} align="center" color="text.secondary">
          No applicants have applied yet.
        </Typography>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Applicants;
