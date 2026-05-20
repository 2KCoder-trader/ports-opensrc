import React, { useEffect } from "react";
import SecureStorage from 'react-secure-storage';
import { useNavigate } from "react-router-dom";
import {getLeaderboards } from "../user.js";
import { Box, Typography, Paper } from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { TopBar } from "../Home/homev2.jsx";

const tableStyles = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
  "& .MuiTableCell-root": {
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: "16px",
  },
  "& .MuiTableHead-root": {
    background: "rgba(255, 255, 255, 0.1)",
  },
  "& .MuiTableHead-root .MuiTableCell-root": {
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "0.95rem",
  }
};

const sectionStyles = {
  color: "#ffffff",
  marginBottom: "2rem",
  "& h2": {
    fontSize: "2.5rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    textShadow: "0 0 20px rgba(139, 109, 190, 0.3)",
    letterSpacing: "0.5px",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
  },
  "& p": {
    fontSize: "1.1rem",
    opacity: 0.9,
    maxWidth: "650px",
    marginBottom: "2rem",
    fontWeight: 400,
    letterSpacing: "0.2px",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
  }
};

function UserLeaderboard({data, handleProfile}) {
  // const [data, setData] = React.useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await getUserLeaderboard();
  //     setData(data.content);
  //   };
  //   fetchData();
  // }, []);

  const getCollege = (tags) => {
    if (!tags) return "N/A";
    const collegeTag = tags.find(tag => tag.type === "college");
    return collegeTag ? collegeTag.name : "N/A";
  };

  return (
    <Box sx={sectionStyles}>
      <Typography variant="h2">Top Individual Ports</Typography>
      <Typography>The returns for each user's port are averaged.</Typography>
      <TableContainer component={Paper} sx={tableStyles}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell align="right">User</TableCell>
              <TableCell align="right">College</TableCell>
              <TableCell align="right">Average Return</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index+1}
                sx={{
                  background: index < 3 ? `rgba(139, 109, 190, ${0.3 - index * 0.08})` : "transparent",
                  transition: "background-color 0.3s",
                  "&:hover": {
                    background: index < 3 ? `rgba(139, 109, 190, ${0.35 - index * 0.08})` : "rgba(255, 255, 255, 0.05)"
                  }
                }}
              >
                <TableCell sx={{ color: "#ffffff", fontWeight: index < 3 ? 600 : 400 }}>
                  {index + 1}
                </TableCell>
                <TableCell
                  align="right"
                  onClick={() => handleProfile(row.username, row.id)}
                  sx={{
                    color: "#ffffff",
                    cursor: "pointer",
                    fontWeight: index < 3 ? 600 : 400,
                    "&:hover": { color: "#60a5fa" }
                  }}
                >
                  {row.username}
                </TableCell>
                <TableCell sx={{ color: "#ffffff", fontWeight: index < 3 ? 600 : 400 }}>
                  {getCollege(row.tags)}
                </TableCell>
                <TableCell sx={{ color: "#ffffff", fontWeight: index < 3 ? 600 : 400 }}>
                  {row.avgMaxReturn.toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function BalanceLeaderboard({data, handleProfile}) {
  // const [data, setData] = React.useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await getInvestmentLeaderboard();
  //     setData(data.content);
  //   };
  //   fetchData();
  // }, []);

  return (
    <Box sx={sectionStyles}>
      <Typography variant="h2">Individual Investing</Typography>
      <Typography>Each user is allocated $1,500 in simulated funds and must invest in others' ports.</Typography>
      <TableContainer component={Paper} sx={tableStyles}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell align="right">User</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index+1}
                sx={{
                  background: index < 3 ? `rgba(139, 109, 190, ${0.3 - index * 0.08})` : "transparent",
                  transition: "background-color 0.3s",
                  "&:hover": {
                    background: index < 3 ? `rgba(139, 109, 190, ${0.35 - index * 0.08})` : "rgba(255, 255, 255, 0.05)"
                  }
                }}
              >
                <TableCell sx={{ color: "#ffffff", fontWeight: index < 3 ? 600 : 400 }}>
                  {index + 1}
                </TableCell>
                <TableCell
                  align="right"
                  onClick={() => handleProfile(row.username, row.id)}
                  sx={{
                    color: "#ffffff",
                    cursor: "pointer",
                    fontWeight: index < 3 ? 600 : 400,
                    "&:hover": { color: "#60a5fa" }
                  }}
                >
                  {row.username}
                </TableCell>
                <TableCell sx={{ color: "#ffffff", fontWeight: index < 3 ? 600 : 400 }}>
                  ${(isNaN(row.totalBalance) || row.totalBalance === null || row.totalBalance === undefined ? 115432 : row.totalBalance).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function ClubLeaderboard({data}) {
  // const [data, setData] = React.useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await getClubLeaderboard();
  //     setData(data.content);
  //   };
  //   fetchData();
  // }, []);

  return (
    <Box sx={sectionStyles}>
      <Typography variant="h2">Top Club Ports</Typography>
      <Typography>The returns of the top 10 performing members in each club are averaged.</Typography>
      <TableContainer component={Paper} sx={tableStyles}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell align="right">Club</TableCell>
              <TableCell align="right">Avg Return</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index+1}
                sx={{
                  background: index < 3 ? `rgba(139, 109, 190, ${0.3 - index * 0.08})` : "transparent",
                  transition: "background-color 0.3s",
                  "&:hover": {
                    background: index < 3 ? `rgba(139, 109, 190, ${0.35 - index * 0.08})` : "rgba(255, 255, 255, 0.05)"
                  }
                }}
              >
                <TableCell sx={{ color: "#ffffff", fontWeight: index < 3 ? 600 : 400 }}>
                  {index + 1}
                </TableCell>
                <TableCell sx={{ color: "#ffffff", fontWeight: index < 3 ? 600 : 400 }} align="right">
                  {row.club}
                </TableCell>
                <TableCell sx={{ color: "#ffffff", fontWeight: index < 3 ? 600 : 400 }} align="right">
                  {row.score.toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function Leaderboard() {
  const [userData, setUserData] = React.useState([]);
  const [balanceData, setBalanceData] = React.useState([]);
  const [clubData, setClubData] = React.useState([]);
  const navigate = useNavigate();

  function handleProfile(username, id) {
    SecureStorage.setItem('u_id', username);
    navigate(`/profile/${username}/${id}`);
  }

  useEffect(() => {
    const fetchData = async () => {
      
      const data = await getLeaderboards();
      console.log("Fetching leaderboard data...",data);
      setUserData(data.userLeaderboard);
      setBalanceData(data.investmentLeaderboard);
      setClubData(data.clubLeaderboard);
    }
    fetchData();
  }, []);



  return (
    <Box sx={{ 
      background: "linear-gradient(180deg, rgba(17, 17, 82, 0.95) 0%, rgba(13, 13, 62, 0.98) 50%, rgba(10, 10, 45, 1) 100%)",
      position: "relative",
      minHeight: "100vh",
      minWidth: "520px",
      boxShadow: "inset 0 0 100px rgba(0, 0, 0, 0.2)",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 50% 0%, rgba(139, 109, 190, 0.15) 0%, rgba(17, 17, 82, 0) 50%)",
        pointerEvents: "none"
      },
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 80% 80%, rgba(188, 29, 202, 0.1) 0%, rgba(17, 17, 82, 0) 50%)",
        pointerEvents: "none"
      }
    }}>
      <TopBar />
      <Box sx={{
        padding: "40px 20px",
        maxWidth: "1400px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1
      }}>
        <Typography variant="h1" sx={{
          color: "#ffffff",
          fontSize: "3.5rem",
          fontWeight: 600,
          marginBottom: "3rem",
          textAlign: "center",
          textShadow: "0 0 20px rgba(139, 109, 190, 0.3)",
          letterSpacing: "1px",
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
        }}>
          Leaderboard
        </Typography>
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          gap: "80px",
          padding: "20px"
        }}>
          {<UserLeaderboard  data = {userData} handleProfile={handleProfile}/>}
          {<ClubLeaderboard data = {clubData} />}
          {<BalanceLeaderboard data={balanceData} handleProfile={handleProfile} />}
        </Box>
      </Box>
    </Box>
  );
}

export default Leaderboard;