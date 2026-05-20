/* global google */
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import FormHelperText  from '@mui/material/FormHelperText'
import { createTheme, styled } from '@mui/material/styles';
import { GoogleIcon} from './CustomIcons';
import ReCAPTCHA from 'react-google-recaptcha';
import { loginUser, createUser, getLoginUsers,verifyEmail,googleLogin,resendVerificationCode } from '../user';
import { FaUser, FaLock } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import SecureStorage from 'react-secure-storage';
import ParticlesComponent from '../Homepage/tsparticles';
import { motion } from 'framer-motion';
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


export default function SignUp() {
  const [mode, setMode] = useState('light');
  const [showCustomTheme, setShowCustomTheme] = useState(true);
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
  const [tags, setTags] = useState([]);
  const [linkedin, setLinkedin] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinError, setLinkedinError] = useState(false);
  const [linkedinErrorMessage, setLinkedinErrorMessage] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const navigate = useNavigate();
  const [tagsError, setTagsError] = useState(false);
  const [tagsErrorMessage, setTagsErrorMessage] = useState('');
  const availableTags = [
     "NYU - MFG",
    "Purdue - Boiler Quant",
    "Johns Hopkins Salant Investing Group",
    "Purdue - Investment Group",
    "UNC - Carolina investment group"
  ];
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleRecaptchaChange = (token) => {
      setRecaptchaToken(token);
    
  };
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
  }, []);
  async function handleCredentialResponse(response) {
   

    const success = await googleLogin(response.credential, SecureStorage.getItem('recaptchaToken'));
   
    if (success) {
      const token = SecureStorage.getItem('userToken');
      const username = SecureStorage.getItem('username');
      const data = await getLoginUsers(username)
     
      SecureStorage.setItem('user_id', data.id);
      SecureStorage.setItem('email', data.email);
     
      const id = data.id;
    
      if (!!token) {
     
        SecureStorage.setItem('Current Page','My Ports');
        navigate(`/loading`);
        
      } else {
        alert("Incorrect username or password")
        
      }
    } else {
      alert("Incorrect username or password/Captcha Not Verified")
      
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isCodeSent) {
      if (!validateInputs()) {
        return;
      }

        // Initial registration step
        try {
            await createUser(username, password, email, bio, tags, linkedin);
            setIsCodeSent(true);
            alert("Verification code sent to your email. Please check your spam/junk");
        } catch (error) {
            console.error("Registration error:", error);
            alert("Registration failed. Please try again.");
        }
      } else {
            
            const veri = await verifyEmail(email, verificationCode);
            

            if(!veri) {
              handleVerificationRetry();
            } else {

        
            // Attempt to log in
            const success = await loginUser(veri, password, recaptchaToken);
            SecureStorage.setItem('userToken', success);
            
            if(success) { 
              SecureStorage.setItem('username', veri);
                    
              // Fetch additional user data
              const data = await getLoginUsers(veri);
              
              // Store user details
              SecureStorage.setItem('user_id', data.id);
              SecureStorage.setItem('user_name', data.username);
              SecureStorage.setItem('email', data.email);
              SecureStorage.setItem('Current Page', 'My Ports');
              SecureStorage.setItem('justLoggedIn', true);
              
              navigate('/settings', { state: { message: 'Scroll to video' } });
              

            } else {
              handleVerificationRetry();
            }
          }
      }


};

// Modified verification retry function
const handleVerificationRetry = async () => {
  try {
      // Instead of deleting/recreating user, just resend the verification code
      await resendVerificationCode(email); // Create this new function
      setVerificationCode(''); // Clear the verification code input
      alert("A new verification code has been sent to your email.");
  } catch (error) {
      console.error("Error resending verification code:", error);
      alert("Failed to resend verification code. Please try again.");
  }
};
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!isCodeSent) {
//         // Initial registration step
//         try {
//             await createUser(username, password, email, bio, tags, linkedin);
//             setIsCodeSent(true);
//             alert("Verification code sent to your email.");
//         } catch (error) {
//             console.error("Registration error:", error);
//             alert("Registration failed. Please try again.");
//         }
//     } else {
//         // Verification step
//         try {
//             // Attempt to verify the email
//             const veri = await verifyEmail(email, verificationCode);
            
//             // Attempt to log in
//             const success = await loginUser(veri, password, recaptchaToken);
            
//             if (success) {
//                 try {
//                     // Store basic user info
//                     SecureStorage.setItem('username', username);
                    
//                     // Fetch additional user data
//                     const data = await getLoginUsers(username);
                    
//                     // Store user details
//                     SecureStorage.setItem('user_id', data.id);
//                     SecureStorage.setItem('user_name', data.username);
//                     SecureStorage.setItem('email', data.email);
                    
//                     const token = SecureStorage.getItem('userToken');
                    
//                     if (token) {
//                         SecureStorage.setItem('Current Page', 'My Ports');
//                         navigate('/settings', { state: { message: 'Scroll to video' } });
//                         
//                     } else {
//                         throw new Error('No token received after login');
//                     }
//                 } catch (error) {
//                     console.error("Error during login process:", error);
//                     handleVerificationRetry();
//                 }
//             } else {
//                 handleVerificationRetry();
//             }
//         } catch (error) {
//             console.error("Verification error:", error);
//             handleVerificationRetry();
//         }
//     }
// };

// // Separate function to handle verification retry
// const handleVerificationRetry = async (id) => {
//     try {
//         await deleteuser(username);
//         await createUser(username, password, email, bio, tags, linkedin);
//         alert("Verification failed. A new code has been sent to your email.");
//         setVerificationCode(''); // Clear the verification code input
//     } catch (error) {
//         console.error("Error resending verification code:", error);
//         alert("Failed to resend verification code. Please try registering again.");
//         setIsCodeSent(false); // Reset to registration state
//     }
// };

  const toggleColorMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    SecureStorage.setItem('themeMode', newMode);
  };

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };

 const validateInputs = () => {
    let isValid = true;

    if (!username || username.length < 1) {
      setUsernameError(true);
      setUsernameErrorMessage('Username is required.');
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!tags || tags.length === 0) {
      setTagsError(true);
      setTagsErrorMessage('Please select at least one college.');
      isValid = false;
    } else {
      setTagsError(false);
      setTagsErrorMessage('');
    }

    return isValid;
  };
  const [error, setError] = useState(false);
  const handleChange = (event) => {
    const value = event.target.value;
    setTags(value);
    if (value.length === 0) {
      setTagsError(true);
      setTagsErrorMessage('Please select at least one college.');
    } else {
      setTagsError(false);
      setTagsErrorMessage('');
    }
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
        <ParticlesComponent/>
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
            Sign up for Ports
          </Typography>
          {/* {errorMessage && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
          )} */}
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
            {!isCodeSent ? (
              <>
            <FormControl>
                  <FormLabel htmlFor="username" sx={{ color: '#1B263B' }}>Username</FormLabel>
                  <TextField
                    autoComplete="username"
                    name="username"
                    required
                    fullWidth
                    id="username"
                    placeholder="johndoe123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={usernameError}
                    helperText={usernameErrorMessage}
                    color={usernameError ? 'error' : 'primary'}
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
                    // InputProps={{
                    //   startAdornment: <FaUser className='icon' />,
                    // }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="email" sx={{ color: '#1B263B' }}>Email</FormLabel>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    placeholder="your@email.com"
                    name="email"
                    autoComplete="email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={emailError}
                    helperText={emailErrorMessage}
                    color={emailError ? 'error' : 'primary'}
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
                    // InputProps={{
                    //   startAdornment: <MdEmail className='icon' />,
                    // }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="password" sx={{ color: '#1B263B' }}>Password</FormLabel>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    placeholder="••••••"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={passwordError}
                    helperText={passwordErrorMessage}
                    color={passwordError ? 'error' : 'primary'}
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
                    // InputProps={{
                    //   startAdornment: <FaLock className='icon' />,
                    // }}
                  />
                </FormControl>

                <FormControl error={tagsError} required>
      <FormLabel htmlFor="tags" sx={{ color: '#1B263B' }}>College *</FormLabel>
      <Select
        multiple
        value={tags}
        onChange={handleChange}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
        sx={{
          marginTop: '0.5rem',
          borderRadius: '1rem',
          backgroundColor: 'white',
          '& .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px',
            borderColor: tagsError ? '#d32f2f' : '#949494',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderWidth: '3px',
            borderColor: tagsError ? '#d32f2f' : '#949494',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '3px',
            borderColor: tagsError ? '#d32f2f' : '#949494',
          },
        }}
      >
        {availableTags.map((tag) => (
          <MenuItem key={tag} value={tag}>
            {tag}
          </MenuItem>
        ))}
      </Select>
      {tagsError && (
        <FormHelperText error>{tagsErrorMessage}</FormHelperText>
      )}
    </FormControl>

              <FormControl>
                <FormLabel htmlFor="linkedin" sx={{ color: '#1B263B' }}>LinkedIn Profile</FormLabel>
                <TextField
                  fullWidth
                  id="linkedin"
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  name="linkedin"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  error={linkedinError}
                  helperText={linkedinErrorMessage}
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
                    },
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="bio" sx={{ color: '#1B263B' }}>Professional Bio</FormLabel>
                <TextField
                  fullWidth
                  id="bio"
                  placeholder="Tell us about yourself..."
                  name="bio"
                  multiline
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      marginTop: '0.5rem',
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
              </>
              ) : (
                <FormControl>
                  <FormLabel htmlFor="verificationCode" sx={{ color: '#1B263B' }}>Verification Code</FormLabel>
                  <TextField
                    required
                    fullWidth
                    id="verificationCode"
                    placeholder="Enter verification code"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    InputProps={{
                      startAdornment: <MdEmail className='icon' />,
                    }}
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



              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                
              >
                {isCodeSent ? 'Verify Code' : 'Sign Up'}
              </Button>
              <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  Sign in
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
                Sign Up with Google
              </Button>
            </Box>
            <Typography sx={{ textAlign: 'center' }}>
            Signing up is agreeing with our{' '}
            <Link component={RouterLink} to="/privacy" variant="body2">
              Privacy Policy
            </Link>
          </Typography>
          </Card>
        {/* </SignInContainer> */}
        </motion.div>
       
      </Box>
    );
  }
  