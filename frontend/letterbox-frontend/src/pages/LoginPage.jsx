import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Paper,
  Grid,
  Container,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon
} from '@mui/icons-material';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Here you would add your authentication logic
      // For now, we'll just simulate a login process
      setTimeout(() => {
        setLoading(false);
        // Successful login would navigate to the home page
        // navigate('/'); 
        
        // For demo, let's just show how we'd handle errors
        setError('This is a demo. In a real app, we would authenticate with a backend.');
      }, 1000);
    } catch (err) {
      setError('Failed to login. Please check your credentials and try again.');
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Grid container component={Paper} elevation={6} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {/* Left side - Image/Brand */}
          <Grid
            item
            xs={false}
            sm={4}
            md={5}
            sx={{
              backgroundImage: 'url(https://source.unsplash.com/random?mailbox,letters)',
              backgroundRepeat: 'no-repeat',
              backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
              }}
            >
              <Typography component="h1" variant="h3" color="white" fontWeight="bold">
                LetterBox
              </Typography>
              <Typography variant="body1" color="white" align="center" sx={{ mt: 2 }}>
                Connect with friends, share updates, and explore content in one place.
              </Typography>
            </Box>
          </Grid>
          
          {/* Right side - Login Form */}
          <Grid item xs={12} sm={8} md={7}>
            <Box
              sx={{
                p: { xs: 3, md: 5 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Box sx={{ mb: 3, display: { xs: 'block', sm: 'none' } }}>
                <Typography component="h1" variant="h4" fontWeight="bold">
                  LetterBox
                </Typography>
              </Box>
              
              <Typography component="h1" variant="h5" fontWeight="500">
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please enter your details to sign in
              </Typography>

              {error && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" noValidate onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Box>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                  endIcon={<LoginIcon />}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
                
                <Grid container>
                  <Grid item xs>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                      onClick={() => alert('Google Sign In would be implemented here')}
                    >
                      Continue with Google
                    </Button>
                  </Grid>
                </Grid>
                
                <Grid container justifyContent="center">
                  <Grid item>
                    <Typography variant="body2" display="inline">
                      Don't have an account?{' '}
                    </Typography>
                    <Link href="#" variant="body2">
                      Sign up now
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      />
    </Container>
  );
};

export default LoginPage;