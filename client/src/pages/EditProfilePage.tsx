
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Divider,
  Button, Stack, TextField, IconButton, Chip, InputAdornment,
  Snackbar, Checkbox, FormControlLabel
} from '@mui/material';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from "../services/axiosInstance"
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getIn } from 'formik';
import { Profile, Experience, Education } from '../services/Profile';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [initialValues, setInitialValues] = useState<Profile>({
    headline: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    skills: [],
    experience: [{
      title: '', company: '', location: '', from: '', to: '', current: false, description: ''
    }],
    education: [{
      school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false, description: ''
    }]
  });

  const validationSchema = Yup.object({
    headline: Yup.string().max(100),
    bio: Yup.string().max(1000),
    phone: Yup.string(),
    location: Yup.string(),
    website: Yup.string().url().nullable(),
    linkedin: Yup.string().url().nullable(),
    github: Yup.string().url().nullable(),
    skills: Yup.array().of(Yup.string()),
    experience: Yup.array().of(
      Yup.object({
        title: Yup.string().required('Title is required'),
        company: Yup.string().required('Company is required'),
        location: Yup.string(),
        from: Yup.date().required('From date is required'),
        to: Yup.date().nullable(),
        current: Yup.boolean(),
        description: Yup.string(),
      })
    ),
    education: Yup.array().of(
      Yup.object({
        school: Yup.string().required('School is required'),
        degree: Yup.string().required('Degree is required'),
        fieldOfStudy: Yup.string(),
        from: Yup.date().required('From date is required'),
        to: Yup.date().nullable(),
        current: Yup.boolean(),
        description: Yup.string(),
      })
    ),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
  
        const formatDate = (dateStr: string) =>
          dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
  
        setInitialValues({
          headline: data.headline || '',
          bio: data.bio || '',
          phone: data.phone || '',
          location: data.location || '',
          website: data.website || '',
          linkedin: data.linkedin || '',
          github: data.github || '',
          skills: Array.isArray(data.skills) ? data.skills : [],
          experience: data.experience?.map((exp: any) => ({
            ...exp,
            from: formatDate(exp.from),
            to: formatDate(exp.to),
          })) || [{
            title: '', company: '', location: '', from: '', to: '', current: false, description: ''
          }],
          education: data.education?.map((edu: any) => ({
            ...edu,
            from: formatDate(edu.from),
            to: formatDate(edu.to),
          })) || [{
            school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false, description: ''
          }]
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" mt={5} px={2}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" mb={3}>Edit Profile</Typography>
        <Divider sx={{ mb: 3 }} />

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const token = localStorage.getItem('token');
              await axios.put('/api/profile', values, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              });
              setSnackbarMessage('Profile updated successfully!');
              setOpenSnackbar(true);
              navigate('/profile/me');
            } catch (err: any) {
              console.error('Profile update failed:', err.response?.data || err.message);
              setSnackbarMessage('Failed to update profile!');
              setOpenSnackbar(true);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, handleChange, errors, touched, isSubmitting, setFieldValue }) => (
            <Form noValidate>
              {['headline', 'bio', 'phone', 'location', 'website', 'linkedin', 'github'].map((field) => (
                <TextField
                  key={field}
                  fullWidth
                  name={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={(values as any)[field]}
                  onChange={handleChange}
                  error={Boolean(getIn(touched, field) && getIn(errors, field))}
                  helperText={getIn(touched, field) && getIn(errors, field)}
                  variant="outlined"
                  margin="normal"
                />
              ))}

              <FieldArray name="skills">
                {(arrayHelpers) => (
                  <Stack spacing={1} mt={2}>
                    <Typography variant="h6">Skills</Typography>
                    <Stack direction="row" flexWrap="wrap" spacing={1}>
                      {values.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          onDelete={() => arrayHelpers.remove(index)}
                          color="primary"
                        />
                      ))}
                    </Stack>
                    <TextField
                      fullWidth
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSkill.trim()) {
                          e.preventDefault();
                          arrayHelpers.push(newSkill.trim());
                          setNewSkill('');
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => {
                              if (newSkill.trim()) {
                                arrayHelpers.push(newSkill.trim());
                                setNewSkill('');
                              }
                            }}>
                              <AddIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                )}
              </FieldArray>

              <FieldArray name="experience">
                {(arrayHelpers) => (
                  <Stack spacing={2} mt={3}>
                    <Typography variant="h6">Experience</Typography>
                    {values.experience.map((exp: Experience, index: number) => (
                      <Box key={index} sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}>
                        <Stack spacing={2}>
                          {['title', 'company', 'location', 'description'].map((field) => (
                            <TextField
                              key={field}
                              fullWidth
                              label={field.charAt(0).toUpperCase() + field.slice(1)}
                              name={`experience[${index}].${field}`}
                              value={exp[field as keyof Experience]}
                              onChange={handleChange}
                              error={Boolean(getIn(touched, `experience[${index}].${field}`) && getIn(errors, `experience[${index}].${field}`))}
                              helperText={getIn(touched, `experience[${index}].${field}`) && getIn(errors, `experience[${index}].${field}`)}
                            />
                          ))}
                          <Stack direction="row" spacing={2}>
                            <TextField
                              label="From"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              name={`experience[${index}].from`}
                              value={exp.from}
                              onChange={handleChange}
                              inputProps={{ max: new Date().toISOString().split('T')[0] }}
                            />
                            <TextField
                              label="To"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              name={`experience[${index}].to`}
                              value={exp.to}
                              onChange={handleChange}
                              disabled={exp.current}
                              inputProps={{ max: new Date().toISOString().split('T')[0] }}
                            />
                          </Stack>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={exp.current}
                                onChange={(e) => setFieldValue(`experience[${index}].current`, e.target.checked)}
                              />
                            }
                            label="Current"
                          />
                          <Button variant="text" color="error" onClick={() => arrayHelpers.remove(index)} startIcon={<DeleteIcon />}>
                            Remove
                          </Button>
                        </Stack>
                      </Box>
                    ))}
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() =>
                      arrayHelpers.push({ title: '', company: '', location: '', from: '', to: '', current: false, description: '' })
                    }>
                      Add Experience
                    </Button>
                  </Stack>
                )}
              </FieldArray>

              <FieldArray name="education">
                {(arrayHelpers) => (
                  <Stack spacing={2} mt={3}>
                    <Typography variant="h6">Education</Typography>
                    {values.education.map((edu: Education, index: number) => (
                      <Box key={index} sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}>
                        <Stack spacing={2}>
                          {['school', 'degree', 'fieldOfStudy', 'description'].map((field) => (
                            <TextField
                              key={field}
                              fullWidth
                              label={field.charAt(0).toUpperCase() + field.slice(1)}
                              name={`education[${index}].${field}`}
                              value={edu[field as keyof Education]}
                              onChange={handleChange}
                              error={Boolean(getIn(touched, `education[${index}].${field}`) && getIn(errors, `education[${index}].${field}`))}
                              helperText={getIn(touched, `education[${index}].${field}`) && getIn(errors, `education[${index}].${field}`)}
                            />
                          ))}
                          <Stack direction="row" spacing={2}>
                            <TextField
                              label="From"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              name={`education[${index}].from`}
                              value={edu.from}
                              onChange={handleChange}
                              inputProps={{ max: new Date().toISOString().split('T')[0] }}
                            />
                            <TextField
                              label="To"
                              type="date"
                              InputLabelProps={{ shrink: true }}
                              name={`education[${index}].to`}
                              value={edu.to}
                              onChange={handleChange}
                              disabled={edu.current}
                              inputProps={{ max: new Date().toISOString().split('T')[0] }}
                            />
                          </Stack>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={edu.current}
                                onChange={(e) => setFieldValue(`education[${index}].current`, e.target.checked)}
                              />
                            }
                            label="Current"
                          />
                          <Button variant="text" color="error" onClick={() => arrayHelpers.remove(index)} startIcon={<DeleteIcon />}>
                            Remove
                          </Button>
                        </Stack>
                      </Box>
                    ))}
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() =>
                      arrayHelpers.push({ school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false, description: '' })
                    }>
                      Add Education
                    </Button>
                  </Stack>
                )}
              </FieldArray>

              <Box mt={4}>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  Save Profile
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose} message={snackbarMessage} />
      </Paper>
    </Box>
  );
};

export default EditProfilePage;
