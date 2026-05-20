// import React, { useState, useMemo, useEffect } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Card,
//   CardContent,
//   CardHeader,
//   Typography,
//   Switch,
//   FormControlLabel,
//   TextField,
//   Avatar,
//   Box,
//   InputAdornment
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import {
//   Search as SearchIcon,
//   EmojiEvents as TrophyIcon,
//   MilitaryTech as MedalIcon,
//   SportsKabaddi as SwordIcon,
//   Shield as ShieldIcon
// } from '@mui/icons-material';
// // import Navbar from '../../old_stuff/New_Header_Navigation/navbar.js';
// import {getPortfolioLeaderboard, getDailyPnL} from '../user.js';
// // Mock data for the leaderboards
// const playerLeaderboardData = [
//   { rank: 1, name: "Alex Johnson", score: 2800, avatar: "/placeholder.svg?height=32&width=32" },
//   { rank: 2, name: "Sam Smith", score: 2750, avatar: "/placeholder.svg?height=32&width=32" },
//   { rank: 3, name: "Jamie Lee", score: 2700, avatar: "/placeholder.svg?height=32&width=32" },
//   { rank: 4, name: "Taylor Swift", score: 2650, avatar: "/placeholder.svg?height=32&width=32" },
//   { rank: 5, name: "Morgan Freeman", score: 2600, avatar: "/placeholder.svg?height=32&width=32" },
//   { rank: 6, name: "Emma Watson", score: 2550, avatar: "/placeholder.svg?height=32&width=32" },
//   { rank: 7, name: "Chris Evans", score: 2500, avatar: "/placeholder.svg?height=32&width=32" },
//   { rank: 8, name: "Scarlett Johansson", score: 2450, avatar: "/placeholder.svg?height=32&width=32" },
//   { rank: 9, name: "Tom Hanks", score: 2400, avatar: "/placeholder.svg?height=32&width=32" },
//   { rank: 10, name: "Meryl Streep", score: 2350, avatar: "/placeholder.svg?height=32&width=32" },
// ];

// const itemLeaderboardData = [
//   { rank: 1, name: "Excalibur", score: 1000, icon: <SwordIcon /> },
//   { rank: 2, name: "Aegis Shield", score: 950, icon: <ShieldIcon /> },
//   { rank: 3, name: "Mjolnir", score: 900, icon: <SwordIcon /> },
//   { rank: 4, name: "Invisibility Cloak", score: 850, icon: <ShieldIcon /> },
//   { rank: 5, name: "Elder Wand", score: 800, icon: <SwordIcon /> },
//   { rank: 6, name: "One Ring", score: 750, icon: <ShieldIcon /> },
//   { rank: 7, name: "Lightsaber", score: 700, icon: <SwordIcon /> },
//   { rank: 8, name: "Infinity Gauntlet", score: 650, icon: <ShieldIcon /> },
//   { rank: 9, name: "Master Sword", score: 600, icon: <SwordIcon /> },
//   { rank: 10, name: "Kryptonite", score: 550, icon: <ShieldIcon /> },
// ];

// // Author's rank data
// const authorRank = { rank: 42, name: "You", score: 1500, avatar: "/placeholder.svg?height=32&width=32" };

// const StyledTableContainer = styled(TableContainer)({
//   maxHeight: 400,

//   // '&::-webkit-scrollbar': {
//   //   width: '0.4em',
//   //   height: '0.4em',
//   // },
//   // '&::-webkit-scrollbar-track': {
//   //   boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
//   //   webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
//   // },
//   // '&::-webkit-scrollbar-thumb': {
//   //   backgroundColor: 'rgba(0,0,0,.1)',
//   //   outline: '1px solid slategrey',
//   // }
// });

// export default function Leaderboard() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [leaderboardData, setLeaderboardData] = useState([]);
//   const leaderboardType = "Port"

//   const getRankIcon = (rank) => {
//     if (rank === 1) return <TrophyIcon style={{ color: '#FFD700' }} />;
//     if (rank === 2) return <MedalIcon style={{ color: '#C0C0C0' }} />;
//     if (rank === 3) return <MedalIcon style={{ color: '#CD7F32' }} />;
//     return <Typography>{rank}</Typography>;
//   };
//   function colorCode(value, type){
//     let color;
//     let new_value;
//     if (value > 0){
//       color = 'green';
//       if (type === 'percent'){
//         new_value = '+' + value + '%';
//       }else if (type === 'dollar'){
//         new_value = '+$' + value;
//       }
//     }
//     else if (value < 0){
//       color = 'red';
//       if (type === 'percent'){

//         new_value = value + '%';
//       }else if (type === 'dollar'){
//         new_value = '-$'+ value.toString().slice(1);
//       }
//     }else{
//       color = '#1B263B';
//     }
//     return <span style={{color: color}}>{new_value}</span>;
//   }
//   React.useEffect(() => {
//     const fetchData = async () => {
//       const data = await getPortfolioLeaderboard();
      

//       setLeaderboardData(JSON.parse(data));
//     };
//     fetchData();
//   }, []);
   
//   return (
//     <>
//     {/* <Navbar/> */}
//     <Box sx={{ minHeight: '100vh', backgroundColor: "#F0F0F5", py: 4, px: { xs: 2, sm: 3, md: 4 }, paddingTop:'10%' }}>
//       <Card sx={{ maxWidth: 800, mx: 'auto' }}>
//         <CardHeader
//           title={<Typography variant="h4" align="center" color="primary">Leaderboard</Typography>}
//         />
//         <CardContent>
//           {/* <TextField
//             fullWidth
//             variant="outlined"
//             placeholder={`Search ${leaderboardType}s...`}
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               ),
//             }}
//             sx={{ mb: 2 }}
//           /> */}
//           <StyledTableContainer>
//             <Table stickyHeader aria-label="leaderboard table">
//               <TableHead>
//                 <TableRow>
//                   <TableCell>Rank</TableCell>
//                   <TableCell>Port</TableCell>
//                   <TableCell>User</TableCell>
//                   <TableCell align="right">Today's PNL</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {leaderboardData.map((entry) => (
//                   <TableRow key={entry.rank}>
//                     <TableCell>{getRankIcon(entry.rank)}</TableCell>
//                     <TableCell>
//                       {entry.title}
//                     </TableCell>
//                     <TableCell>
//                     {entry.author}
//                       </TableCell>
//                     <TableCell align="right">{colorCode(parseFloat(entry.pnl),'dollar')}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </StyledTableContainer>
//           {/* <StyledTableContainer>
//             <Table stickyHeader aria-label="leaderboard table">
//               <TableHead>
//                 <TableRow>
//                   <TableCell style={{ visibility: 'hidden' }}>Rank</TableCell>
//                   <TableCell style={{ visibility: 'hidden' }}>Port</TableCell>
//                   <TableCell style={{ visibility: 'hidden' }}>User</TableCell>
//                   <TableCell align="right" style={{ visibility: 'hidden' }}>Today's PNL</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                   <TableRow key={10}>
//                     <TableCell>{getRankIcon(10)}</TableCell>
//                     <TableCell style={{transform: 'translateX(-3%)'}}>
//                       Port
//                     </TableCell>
//                     <TableCell style={{transform: 'translateX(-4.5%)'}}>
//                       User
//                       </TableCell>
//                     <TableCell align="right" style={{ paddingRight: '4%' }}>PnL</TableCell>
//                   </TableRow>
               
//               </TableBody>
//             </Table>
//           </StyledTableContainer> */}
          
//         </CardContent>
//       </Card>
//     </Box>
//     </>
//   );
// }