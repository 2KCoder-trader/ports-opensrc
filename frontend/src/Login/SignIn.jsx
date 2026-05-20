/* global google */
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Divider, TextField, Typography, Link, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, FormLabel} from '@mui/material';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ReCAPTCHA from 'react-google-recaptcha';
import { loginUser, googleLogin, sendforgotEmail, verifyForgotConfirmationCode, forgorPassword } from '../user.js';
import SecureStorage from 'react-secure-storage';
import { GoogleIcon } from './CustomIcons.js';
import { trackEvent } from "../analytics.js";
import LoginButton from "../analytics.js"
import { Particle } from 'tsparticles-engine';
import ParticlesComponent from "../Homepage/tsparticles";
import { motion } from "framer-motion";

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
}));

const ForgotPassword = ({ open, onClose, sendforgotEmail, verifyForgotConfirmationCode, forgorPassword }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSendEmail = async () => {
    try {
      await sendforgotEmail(email,"username");
      setStep(2);
      setError('');
    } catch (err) {
      setError('Failed to send confirmation email. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    try {
     let isVerified  = await verifyForgotConfirmationCode(email, confirmationCode);

      if (isVerified) {
      setStep(3);
      setError('');
    } else {
      setError('Invalid confirmation code. Please try again.');
    }
    } catch (err) {
      setError('Invalid confirmation code. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    try {
      await forgorPassword(email, newPassword,confirmationCode);
      onClose();
      alert("Password changed")
    } catch (err) {
      setError('Failed to change password. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent>
        {error && <Typography color="error">{error}</Typography>}
        {step === 1 && (
          <Box>
            <Typography>Enter your email address to receive a confirmation code.</Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
        )}
        {step === 2 && (
          <Box>
            <Typography>Enter the confirmation code sent to your email.</Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Confirmation Code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
            />
          </Box>
        )}
        {step === 3 && (
          <Box>
            <Typography>Enter your new password.</Typography>
            <TextField
              fullWidth
              margin="normal"
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {step === 1 && <Button onClick={handleSendEmail}>Send Code</Button>}
        {step === 2 && <Button onClick={handleVerifyCode}>Verify Code</Button>}
        {step === 3 && <Button onClick={handleChangePassword}>Change Password</Button>}
      </DialogActions>
    </Dialog>
  );
};

export default function SignIn() {
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const location = useLocation();
  const errorMessage = location.state?.error || '';
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleRecaptchaChange = (token) => {
    SecureStorage.setItem('recaptchaToken', token);
    setRecaptchaToken(token);
   
  };



  const handleCredentialResponse = useCallback(async (response) => {
      
    const success = await googleLogin(response.credential, null);

    if (success) {
        navigate(`/loading`);
        
      } else {
        alert("Incorrect username or password")
        
      }
  }, [navigate]);

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: "244477881106-iplsdl5s9335sn0bpjr4rq4e6uafnk40.apps.googleusercontent.com",
      callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
      document.getElementById("buttonDiv"),
      { theme: "outline", size: "large" }  // customization attributes
    );
    google.accounts.id.prompt(); // also display the One Tap dialog
  }, [handleCredentialResponse]);

  const handleSubmit = async (e) => {
    // await deleteData();
    e.preventDefault();
    if (forgotPasswordOpen) return;
    const success = await loginUser(username, password, recaptchaToken);
    SecureStorage.setItem('userToken', success);
   
    if (success) {
        SecureStorage.setItem("user_name",username);
        // const data = await getLoginUsers(veri);
        // SecureStorage.setItem('user_id', data.id);
        SecureStorage.setItem('suc',true);
        navigate(`/loading`);
        
    } else {
      alert("Incorrect username or password")
      
    }
  };

  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  // const validateInputs = () => {
  //   let isValid = true;

  //   if (!username || !/\S+@\S+\.\S+/.test(username)) {
  //     setEmailError(true);
  //     setEmailErrorMessage('Please enter a valid email address.');
  //     isValid = false;
  //   } else {
  //     setEmailError(false);
  //     setEmailErrorMessage('');
  //   }

  //   if (!password || password.length < 6) {
  //     setPasswordError(true);
  //     setPasswordErrorMessage('Password must be at least 6 characters long.');
  //     isValid = false;
  //   } else {
  //     setPasswordError(false);
  //     setPasswordErrorMessage('');
  //   }

  //   return isValid;
  // };

  const handleForgotPasswordClick = () => {
    setForgotPasswordOpen(true);
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        backgroundColor: "#111152",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
        margin: 0,
        padding: 0,
      }}
    >
      <ParticlesComponent />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >


      <Card variant="outlined"
        sx={{
          backgroundColor: "#F0F0F5",
          justifyContent: "center",
          alignItems: "center",
          '@media (max-width: 600px)': {
            position: "absolute",
            width: "100vw",
            height: "100vh",
          },
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', color: '#1B263B' }}
        >
          Sign in to Ports
        </Typography>
        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="email" sx={{color: "#1B263B"}}>Username</FormLabel>
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              type="text"
              name="email"
              placeholder="username"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={emailError ? 'error' : 'primary'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  marginTop: '0.5rem',
                  height: '40px',
                  borderRadius: '1rem',
                  backgroundColor: 'white',
                  borderColor: 'primary',
                  borderWidth: '2px',
                  '& fieldset': {
                    borderWidth: '2px',
                    borderColor: '#949494',
                  },
                  '&:hover fieldset': {
                    borderWidth: '3px',
                    borderColor: '#949494',
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: '3px',
                    borderColor: '#949494',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '0.5rem',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 30px white inset',
                    WebkitTextFillColor: '#000',
                    transition: 'background-color 5000s ease-in-out 0s',
                  },
                },
              }}
            />
          </FormControl>
          <FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <FormLabel htmlFor="password" sx={{color: "#1B263B"}}>Password</FormLabel>
              <Link
                component="button"
                onClick={handleForgotPasswordClick}
                variant="body2"
                sx={{ alignSelf: 'baseline' }}
              >
                Forgot your password?
              </Link> 
            </Box>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              required
              fullWidth
              color={passwordError ? 'error' : '#1B263B'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  marginTop: '0.5rem',
                  height: '40px',
                  borderRadius: '1rem',
                  backgroundColor: 'white',
                  borderColor: 'primary',
                  borderWidth: '2px',
                  '& fieldset': {
                    borderWidth: '2px',
                    borderColor: '#949494',
                  },
                  '&:hover fieldset': {
                    borderWidth: '3px',
                    borderColor: '#949494',
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: '3px',
                    borderColor: '#949494',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '0.5rem',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 30px white inset',
                    WebkitTextFillColor: '#000',
                    transition: 'background-color 5000s ease-in-out 0s',
                  },
                },
              }}
            />
          </FormControl>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              transformOrigin: '0 0',
              '@media (max-width: 600px)': {
                transform: 'scale(0.85)',
              },
              '@media (max-width: 400px)': {
                transform: 'scale(0.75)',
              },
            }}
          >
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
              />
            </Box>
            <LoginButton username={username} onLoginSuccess={SecureStorage.getItem('suc')} />
            {/* <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={() =>
                trackEvent({
                    category: "Button",
                    action: "login",
                    label: "Homepage Button",
                    value: 1,
                })
            }
            >
              Sign in
            </Button> */}
            <Typography sx={{ textAlign: 'center' }}>
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} to="/register" variant="body2">
                Sign up
              </Link>
            </Typography>
          </Box>
          <Divider>
                <Typography sx={{ color: 'text.secondary' }}>or</Typography>
              </Divider>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              id="buttonDiv"
              startIcon={<GoogleIcon />}
              sx={{
                display: 'inline-flex',
                textTransform: 'none', // Ensure no text transformation
                '&:hover': {
                  backgroundColor: 'transparent', // Remove hover background color
                },
              }}
            >
              Sign In with Google
            </Button>
          </Box>
          <Typography sx={{ textAlign: 'center' }}>
            Read our{' '}
            <Link component={RouterLink} to="/privacy" variant="body2">
              Privacy Policy
            </Link>
          </Typography>
        </Card>
      {/* </SignInContainer> */}
      <ForgotPassword
        open={forgotPasswordOpen}
        onClose={handleForgotPasswordClose}
        sendforgotEmail={sendforgotEmail}
        verifyForgotConfirmationCode={verifyForgotConfirmationCode}
        forgorPassword={forgorPassword}
      />
      </motion.div>
    </Box>
  );
}
