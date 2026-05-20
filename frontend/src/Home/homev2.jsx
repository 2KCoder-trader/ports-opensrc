import React, { useState, } from "react";
import { useNavigate } from "react-router-dom";
import portsImage from "./images/ports_logo.png";
import  HomeIcon  from "./images/HomeIcon.png";
import CreateIcon from "./images/CreateIcon.png";
import LeaderboardIcon from "./images/leaderboard.png";
import { Box, CssBaseline, IconButton, TextField } from "@mui/material";
import PortMarket from "../Market/marketv2.jsx";
import MyPorts from "../Personal/myports.jsx";
import PendingPorts from "../Pending/pending.jsx";
import PortInfo from "../Detail/detailv2.jsx"
import {Tooltip } from "@mui/material";
import { createEmail } from "../user.js";
import Grid from "@mui/material/Grid2";
import { Card, PersonalCard, RiskBar, colorCode } from "../Cards/cardv2.jsx";
// import DetailPage from "../../old_stuff/detail_page.jsx";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import SecureStorage from 'react-secure-storage';
import 'chartjs-adapter-date-fns';
import AdBlockDetector  from "../AdBlockDetector.js";
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import DevelopmentNoticeModal from "./DevelopmentNoticeModal.jsx";
import Person2Icon from '@mui/icons-material/Person2';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { useMediaQuery } from "@mui/material";
import FeedbackIcon from '@mui/icons-material/Feedback';
import styles from '../Create/modal.module.css';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
// import { trackEvent } from "../analytics.js";
import  LayeredBackground from './Layeredimage.jsx'

Chart.register(...registerables);




const adminUserIds = [16, 15, 51];


function TopBar({handleMyPortsToggle,isMyPortsOpen}) {
  const navigate = useNavigate();
  const userId = SecureStorage.getItem("userId");
  const superSmall =useMediaQuery("(max-width:600px)");
 
  const [isAdmin, setIsAdmin] = React.useState(adminUserIds.includes(userId));

  const handleOpenNewTab = () => {
    const url = "https://docs.google.com/forms/d/e/1FAIpQLScaeQBU38O3NhFqP8zeq0_2d0uKTCK_4p9CKFu_R8WJkZTnXA/viewform?usp=dialog"; // Replace with your desired URL
    const newTab = window.open(url, "_blank", "noopener,noreferrer");
  };


  

  const username  = SecureStorage.getItem("user_name");
  // const userId =  SecureStorage.getItem("user_id");
  return (
    <Box>
      <Box
        sx={{
          height: "52px",
          backgroundColor: "#080823",
          width: "100%",
          padding: "3px",
          display: "flex",
          alignItems: "center", // Center vertically
          justifyContent: "space-between", // Space out logo and icons
        }}
      >
        {/* Left-aligned logo */}

        {!superSmall && (<a href="/">
              <img
                src={portsImage}
                alt="Ports Logo"
                style={{ width: "64px", padding: "10px"}}
              />
            </a>)}

        {/* Center-aligned icons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center", // Center icons horizontally
            gap: "2%", // Space between icons
            alignItems: "center", // Center icons vertically
            flex: 1, // Take up the remaining space to allow centering
          }}
        >
          <Tooltip title="Home">
            <IconButton onClick={() => navigate("/home")}>
              <img src={HomeIcon} alt="Home Icon" style={{ width: "24px" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Create">
            <IconButton onClick={() => navigate("/create")}>
              <img src={CreateIcon} alt="Create Icon" style={{ width: "24px" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Leaderboard">
            <IconButton onClick={() => navigate("/leaderboard")}>
              <img src={LeaderboardIcon} alt="Leaderboard Icon" style={{ width: "24px" }} />
            </IconButton>
          </Tooltip>
          {isAdmin && (
            <Tooltip title="Pending Ports">
              <IconButton onClick={() => navigate("/pending")}>
                <AccessAlarmIcon style={{ fontSize: "32", color: "white" }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Profile">
            <IconButton onClick={() =>   navigate(`/profile/${username}/${userId}`)}>
              <Person2Icon style={{ fontSize: "32", color: "white" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton onClick={() => navigate("/settings")}>
              <SettingsIcon style={{ fontSize: "32", color: "white" }} />
            </IconButton>
          </Tooltip>
        </Box>
          

   
        <Box>
        <Box
          sx={{
            gap: "6%", // Add space between the icons
          }}
        >
            <Tooltip title="My Ports">
              <IconButton onClick={handleMyPortsToggle}>
                {!isMyPortsOpen &&(<MenuIcon style={{ fontSize: 32, color: "white" }} />)}
                {isMyPortsOpen &&(<MenuOpenIcon style={{ fontSize: 32, color: "white" }} />)}
              </IconButton>
            </Tooltip>
          {!superSmall && (<Tooltip title="Feedback">
            <IconButton onClick={handleOpenNewTab}>
              <FeedbackIcon style={{ fontSize: "32", color: "white" }} />
            </IconButton>
          </Tooltip>)}
          <Tooltip title="Logout">
            <IconButton onClick={() => navigate("/login")}>
              <LogoutIcon style={{ fontSize: "32", color: "white" }} />
            </IconButton>
          </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}



function FeedbackModal(setShowFeedback) {
  const [inputValue, setInputValue] = useState('');


  const handleSendEmail = () => {
    createEmail(process.env.REACT_APP_FEEDBACK_EMAIL,"Feedback User " + SecureStorage.getItem("userId"),inputValue)
    setShowFeedback(false);
  }

return(
<div className={styles.modal_overlay}>
                    <div className={styles.modal}>
                        <div>
                            <TextField
                            value = {inputValue}
                            onChange = {(e) => setInputValue(e.target.value)}
                            sx = {{
                                width: "100%",
                                height: "200px",
                                marginBottom: "20px"
                            }}/>
                            <div className={styles.modal_close_button} onClick={handleSendEmail}>Send</div>
                        </div>
                    </div>
                </div>
);

}



function Home() {
  const navigate = useNavigate();
  // set to 0 eventually
  const [id , setId] = useState(-1);
  const [type, setType] = useState("public");
  

    // Recalculate on window resize
  return (
    <>

    <Box sx={{ flexGrow: 1 }}>
      <CssBaseline />
      <TopBar />
      <Box sx={{ flexGrow: 1 }}>
        <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 47px)",
          width: "100%",
          overflow: "hidden",
          position: "relative", // Ensure child components are positioned relative to this container
        }}
      >

        <Box
          sx={{
            display: "flex",
            height: "100vh",
            width: "100%",
          }}
        ><Box
        sx = {{
          display: id !== -1 ? "none" : "flex",
          flexGrow: 1,
        }}
        >
          <PortMarket setId={setId} setType={setType} />
        </Box>
        <Box
        sx = {{
          display: id === -1 ? "none" : "flex",
          flexGrow: 1,
        }}
        >
          <PortInfo id={id} setId={setId} type={type}  />
        </Box>
        </Box>
        
        <MyPorts setId={setId} setType={setType} />
      
      </Box>
      </Box>
    </Box>
  
    </>
  );
}



function Market(){
  const isMobile = useMediaQuery("(max-width:1000px)");

  const [isMyPortsOpen, setIsMyPortsOpen] = useState(SecureStorage.getItem("isMyPortsOpen"));
  
  
  

  const handleMyPortsToggle = () => {
    console.log("My Ports Toggled")
    setIsMyPortsOpen((prev) => !prev);
    SecureStorage.setItem("isMyPortsOpen", !isMyPortsOpen);
  }
  return (
    <LayeredBackground>
   
    <Box sx={{ flexGrow: 1 }}>
      <CssBaseline />
      <TopBar handleMyPortsToggle={handleMyPortsToggle} isMyPortsOpen={isMyPortsOpen} />
      <Box sx={{ flexGrow: 1 }}>
        <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 47px)",
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          position: "relative", // Ensure child components are positioned relative to this container
        }}
      >

        <Box
          sx={{
            display: "flex",
            height: "100vh",
            width: "100%",
          }}
        >
          <PortMarket />
        </Box>
          {isMyPortsOpen && (<MyPorts />)}
        {/* <MyPorts /> */}

      </Box>
 
      </Box>
    </Box>
          <DevelopmentNoticeModal />
    </LayeredBackground>
    
  );
}

function Detail(){

  const [isMyPortsOpen, setIsMyPortsOpen] = useState(SecureStorage.getItem("isMyPortsOpen"));
  
  

  const handleMyPortsToggle = () => {
    console.log("My Ports Toggled")
    setIsMyPortsOpen((prev) => !prev);
    SecureStorage.setItem("isMyPortsOpen", !isMyPortsOpen);
  }



  return (
    <Box sx={{ flexGrow: 1 }}>
      <CssBaseline />
      <TopBar handleMyPortsToggle={handleMyPortsToggle} isMyPortsOpen={isMyPortsOpen} />
      <Box sx={{ flexGrow: 1 }}>
        <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 47px)",
          width: "100%",
          overflow: "hidden",
          position: "relative", // Ensure child components are positioned relative to this container
        }}
      >

        <Box
          sx={{
            display: "flex",
            height: "100vh",
            width: "100%",
          }}
        >
          <PortInfo />
        </Box>
      
        <MyPorts />
      </Box>
      </Box>
    </Box>
  );

}

function Pending(){
  return (
    <Box sx={{ flexGrow: 1 }}>
      <CssBaseline />
      <TopBar />
      <Box sx={{ flexGrow: 1 }}>
        <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 47px)",
          width: "100%",
          overflow: "hidden",
          position: "relative", // Ensure child components are positioned relative to this container
        }}
      >

        <Box
          sx={{
            display: "flex",
            height: "100vh",
            width: "100%",
          }}
        >
          <PendingPorts />
        </Box>
      
        <MyPorts />
      </Box>
      </Box>
    </Box>
  );
}

export {Market, Detail, Pending, TopBar}