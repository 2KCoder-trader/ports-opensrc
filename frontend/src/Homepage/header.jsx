import React from 'react';
import styles from './header.module.css';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import logo from './Images/ports_logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import DiscordLink from './discord.jsx'
import { Disc } from 'lucide-react';


function Header({setAboutPressed, setRerender}) {
    const navigate = useNavigate();
    const location = useLocation();
    const handleSignInClick = () => {
        navigate(`/login`)

    };
    const handleSignUpClick = () => {
        navigate(`/register`)
    };
    const handleAboutClick = () => {
        navigate(`/`)
        if (location.pathname == '/') {
            setAboutPressed(true);
            setRerender(prev => prev + 1);
        }
    };
    const handlePrivacyClick = () => {
        navigate(`/privacy`)
    };
    
    
    return (
        <AppBar sx={{ backgroundColor: "#1B263B"  }}>
            <Toolbar>
                    <img src={logo} alt="Logo" className={styles.logo} />
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}></Box>
                    <Button sx={signButtonStyles} onClick={handleAboutClick} disableRipple disableFocusRipple>About</Button>
                    <Button sx={signButtonStyles} onClick={handleSignInClick} disableRipple disableFocusRipple>Sign In</Button>
                    <Button sx={signButtonStyles} onClick={handleSignUpClick} disableRipple disableFocusRipple>Sign Up</Button>
                    <Box sx={{ flexGrow: 1 }}></Box>
                    <DiscordLink />
            </Toolbar>
        </AppBar>
    );
}
const signButtonStyles = {
    marginLeft: '20px',
    backgroundColor: "#1B263B",
    border: 'white 1px solid',
    color: 'white',
    padding: '3px 8px',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '20px',
    cursor: 'pointer',
    borderRadius: '8px',
    
    '&:hover': {
        backgroundColor: 'white',
        color: '#1B263B',
    },
    '@media (max-width: 600px)': {
        fontSize: '16px', // Smaller font size for small screens
        padding: '8px 4px 8px 4px', // Adjust padding for small screens
        lineHeight: '1.2', // Adjust line height for small screens
        textAlign: 'center', // Center text for small screens
    },
};
export default Header;
