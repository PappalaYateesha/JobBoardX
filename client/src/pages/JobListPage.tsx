import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobFilters, { FilterState } from '../components/JobFilters';
import {Box,Button,Card,Chip,TextField,Typography,Avatar,InputAdornment,Stack,IconButton} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { Link } from 'react-router-dom';

const JobListPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    location: [],
    industry: [],
    salary: [],
    employmentType: [],
    experienceLevel: [],
    isRemote: null,
    skills: [],
  });

  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();

    const stored = localStorage.getItem('savedJobs');
    if (stored) setSavedJobs(JSON.parse(stored));
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    setSelectedFilters(filters);
  };

  const toggleSaveJob = (jobId: string) => {
    let updated;
    if (savedJobs.includes(jobId)) {
      updated = savedJobs.filter((id) => id !== jobId);
    } else {
      updated = [...savedJobs, jobId];
    }
    setSavedJobs(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      selectedFilters.location.length === 0 ||
      selectedFilters.location.includes(job.location);

    const matchesIndustry =
      selectedFilters.industry.length === 0 ||
      selectedFilters.industry.includes(job.industry);

    const matchesSalary =
      selectedFilters.salary.length === 0 ||
      selectedFilters.salary.some((range) => {
        const salaryNum = parseInt(job.salary?.replace(/[^0-9]/g, '') || '0');
        if (range === '$0-$60,000') return salaryNum <= 60000;
        if (range === '$61,000-$99,000') return salaryNum > 60000 && salaryNum < 100000;
        if (range === '$100,000 & More') return salaryNum >= 100000;
        return false;
      });

    const matchesEmploymentType =
      selectedFilters.employmentType.length === 0 ||
      selectedFilters.employmentType.includes(job.employmentType);

    const matchesExperience =
      selectedFilters.experienceLevel.length === 0 ||
      selectedFilters.experienceLevel.includes(job.experienceLevel);

    const matchesRemote =
      selectedFilters.isRemote === null || job.isRemote === selectedFilters.isRemote;

    const matchesSkills =
      selectedFilters.skills.length === 0 ||
      selectedFilters.skills.every((skill) => job.skillsRequired?.includes(skill));

    return (
      matchesSearch &&
      matchesLocation &&
      matchesIndustry &&
      matchesSalary &&
      matchesEmploymentType &&
      matchesExperience &&
      matchesRemote &&
      matchesSkills
    );
  });

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F8F4FF', minHeight: '100vh', px: 4, py: 6, gap: 4 }}>
      {/* Sidebar Filters */}
      <Box sx={{ width: 260 }}>
        <JobFilters onFilterChange={handleFilterChange} />
      </Box>

      {/* Job List Area */}
      <Box sx={{ flexGrow: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="What are you looking for?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 8,
              backgroundColor: '#fff',
              boxShadow: 1,
              px: 1,
              py: 0.5,
            },
          }}
        />

        {/* Jobs Grid */}
        <Box mt={4} display="flex" flexWrap="wrap" gap={3} justifyContent="flex-start">
          {filteredJobs.map((job) => (
           <Card
           key={job._id}
           sx={{
             width: 280,
             p: 2,
             borderRadius: 5,
             background: 'linear-gradient(to bottom right, #fdfbff, #f3f3f9)',
             boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
             border: '1px solid #f1f5f9',
             position: 'relative',
             transition: 'all 0.3s ease',
             '&:hover': {
               transform: 'translateY(-4px)',
               boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
             },
           }}
         >
           {/* Bookmark */}
           <IconButton
             onClick={() => toggleSaveJob(job._id)}
             sx={{
               position: 'absolute',
               top: 12,
               right: 12,
               color: savedJobs.includes(job._id) ? '#7A5FFF' : '#cbd5e1',
               transition: 'color 0.3s',
               '&:hover': { color: '#7A5FFF' },
             }}
           >
             {savedJobs.includes(job._id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
           </IconButton>
         
           {/* Company Info */}
           <Stack direction="row" alignItems="center" spacing={1} mb={1}>
             <Avatar sx={{ bgcolor: '#7A5FFF', fontSize: 14 }}>
               {job.company?.charAt(0)}
             </Avatar>
             <Typography variant="body2" color="text.secondary">
               {job.company} · {job.location}
             </Typography>
           </Stack>
         
           {/* Job Title */}
           <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
             {job.title}
           </Typography>
         
           {/* Tags */}
           <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
             <Chip
               label={`${job.numberOfOpenings || 1} Positions`}
               size="small"
               sx={{
                 backgroundColor: '#DCFCE7',
                 color: '#15803D',
                 fontWeight: 500,
                 fontSize: 12,
                 height: 24,
                 borderRadius: 2,
               }}
             />
             <Chip
               label={job.employmentType || 'Full-time'}
               size="small"
               sx={{
                 backgroundColor: '#FEF9C3',
                 color: '#CA8A04',
                 fontWeight: 500,
                 fontSize: 12,
                 height: 24,
                 borderRadius: 2,
               }}
             />
             <Chip
               label={job.isRemote ? 'Remote' : 'WFO'}
               size="small"
               sx={{
                 backgroundColor: '#DBEAFE',
                 color: '#2563EB',
                 fontWeight: 500,
                 fontSize: 12,
                 height: 24,
                 borderRadius: 2,
               }}
             />
             <Chip
               label={job.experienceLevel || 'Any level'}
               size="small"
               sx={{
                 backgroundColor: '#E0E7FF',
                 color: '#4338CA',
                 fontWeight: 500,
                 fontSize: 12,
                 height: 24,
                 borderRadius: 2,
               }}
             />
           </Box>
         
           {/* Description */}
           <Typography
             variant="body2"
             color="text.secondary"
             sx={{ mb: 2, minHeight: 48 }}
           >
             {job.description?.slice(0, 80)}...
           </Typography>
         
           {/* Buttons */}
           <Box display="flex" justifyContent="space-between">
             <Button
               component={Link}
               to={`/jobs/${job._id}`}
               size="small"
               variant="contained"
               sx={{
                 background: 'linear-gradient(to right, #7A5FFF, #6242FF)',
                 textTransform: 'none',
                 borderRadius: 2,
                 fontWeight: 500,
                 fontSize: 13,
                 px: 2,
                 py: 0.5,
                 '&:hover': {
                   background: 'linear-gradient(to right, #6242FF, #7A5FFF)',
                 },
               }}
             >
               Apply Now
             </Button>
         
             <Button
               component={Link}
               to={`/jobs/${job._id}`}
               size="small"
               variant="outlined"
               sx={{
                 borderColor: '#7A5FFF',
                 color: '#7A5FFF',
                 textTransform: 'none',
                 borderRadius: 2,
                 fontWeight: 500,
                 fontSize: 13,
                 px: 2,
                 py: 0.5,
                 '&:hover': {
                   backgroundColor: '#ede9fe',
                   borderColor: '#7A5FFF',
                 },
               }}
             >
               View Details
             </Button>
           </Box>
         </Card>
         
          ))}
        </Box>

        {filteredJobs.length === 0 && (
          <Typography
            variant="body1"
            color="text.secondary"
            mt={4}
            textAlign="center"
          >
            No jobs found.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default JobListPage;

