import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';
import styled from 'styled-components';
import axios from 'axios';

interface ApplyModalProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (payload: { resumeLink: string; coverLetter: string; jobId: string }) => Promise<boolean>;
  jobId: string;
}

const StyledBox = styled(Box)`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  margin: auto;
  margin-top: 10%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ApplyModal: React.FC<ApplyModalProps> = ({ open, handleClose, onSubmit, jobId }) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeLink, setResumeLink] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = async () => {
    let finalResumeLink = resumeLink;

    if (resumeFile) {
      try {
        const fileFormData = new FormData();
        fileFormData.append('resume', resumeFile);

        const res = await axios.post('http://localhost:5000/api/upload', fileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        finalResumeLink = res.data.resumeUrl;
      } catch (err) {
        console.error('Resume upload failed', err);
        return;
      }
    }

    const payload = {
      resumeLink: finalResumeLink,
      coverLetter,
      jobId,
    };

    const success = await onSubmit(payload);
    if (success) {
      setSnackbarOpen(true);
      handleClose();
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <StyledBox>
          <Typography variant="h6">Apply for Job</Typography>

          <TextField
            label="Paste Resume Link (optional)"
            value={resumeLink}
            onChange={(e) => setResumeLink(e.target.value)}
            fullWidth
          />

          <Typography align="center">or</Typography>

          <Button variant="outlined" component="label">
            Upload Resume (PDF only)
            <input
              type="file"
              accept=".pdf"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) setResumeFile(e.target.files[0]);
              }}
            />
          </Button>
          {resumeFile && <Typography>{resumeFile.name}</Typography>}

          <TextField
            label="Cover Letter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            multiline
            rows={4}
            fullWidth
          />
          <Button variant="contained" onClick={handleSubmit}>
            Submit Application
          </Button>
        </StyledBox>
      </Modal>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Application submitted successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ApplyModal;
