import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, TextField, Box, Typography } from '@mui/material';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from '../services/axiosInstance';
import { decodeToken } from '../utils/decodeToken';

const JobApplicationPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`/api/jobs/${jobId}`);
        setJob(response.data);
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  const initialValues = {
    resumeLink: '',
    coverLetter: '',
  };

  const validationSchema = Yup.object({
    resumeLink: Yup.string().url('Invalid URL').required('Resume link is required'),
    coverLetter: Yup.string().required('Cover letter is required'),
  });

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token found. Please login again.');
        return;
      }

      const decoded: any = decodeToken(token);
      const fullName = decoded?.name || 'Anonymous';

      const applicationData = {
        ...values,
        fullName,
      };

      await axios.post(
        `/api/applications/apply/${jobId}`,
        applicationData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Application error:', error);
      alert('Failed to apply.');
    }
  };

  if (!job) return <Typography align="center" mt={4}>Loading job details...</Typography>;

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Typography variant="h5" mb={2}>Apply for {job.title}</Typography>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, handleChange }) => (
          <Form>
            <TextField
              fullWidth
              label="Resume Link"
              name="resumeLink"
              value={values.resumeLink}
              onChange={handleChange}
              margin="normal"
            />
            <div style={{ color: 'red' }}>
  <ErrorMessage name="resumeLink" component="div" />
</div>

            <TextField
              fullWidth
              label="Cover Letter"
              name="coverLetter"
              value={values.coverLetter}
              onChange={handleChange}
              multiline
              rows={4}
              margin="normal"
            />
            <div style={{ color: 'red' }}>
  <ErrorMessage name="coverLetter" component="div" />
</div>

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Submit Application
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default JobApplicationPage;
