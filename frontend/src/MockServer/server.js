const express = require('express');
const cors = require('cors');  // Import cors package
const app = express();
const port = 777;

// Mock data
const searchPublicPorts = require('./searchPublicPorts.json');
const searchPersonalPorts = require('./searchPersonalPorts.json');
const searchInvestPorts = require('./searchInvestPorts.json');
const getPort = require('./getPort.json');
const getChartData = require('./getChartData.json');
const getInvestmentLeaderboard = require('./getInvestmentLeaderboard.json');
const getUserLeaderboard = require('./getUserLeaderboard.json');
const getClubLeaderboard = require('./getClubLeaderboard.json');
const getSocialInfo = require('./getSocialInfo.json');
const getComments = require('./getComments.json');

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000',  // Allow only the frontend to access the backend
  credentials: true,               // Allow credentials (cookies, HTTP authentication) to be included
}));
// Set up middleware to handle JSON requests
app.use(express.json());

// Mock POST /ports/user/verifyuser
app.post('/ports/user/verifyuser', (req, res) => {
  
  res.json({ id: 1 });
});

// Mock GET /ports/Portfolio/searchPublicPorts
app.get('/ports/Portfolio/searchPublicPorts', (req, res) => {
  res.json(searchPublicPorts);
});

// Mock GET /ports/Portfolio/searchPersonalPorts
app.get('/ports/Portfolio/searchPersonalPorts', (req, res) => {
  res.json(searchPersonalPorts);
});

// Mock GET /ports/Portfolio/searchInvestPorts
app.get('/ports/Portfolio/searchInvestPorts', (req, res) => {
  res.json(searchInvestPorts);
});

// Mock GET /ports/Portfolio/getPort
app.get('/ports/Portfolio/getPort', (req, res) => {
  res.json(getPort);
});
app.get('/ports/Portfolio/getChartData', (req, res) => {
  res.json(getChartData);
});
app.get('/ports/user/getUserLeaderboard', (req, res) => {
  res.json(getUserLeaderboard);
});
app.get('/ports/user/getInvestmentLeaderboard', (req, res) => {
  res.json(getInvestmentLeaderboard);
});
app.get('/ports/user/getClubLeaderboard', (req, res) => {
  res.json(getClubLeaderboard);
});
app.get('/ports/user/getSocialInfo', (req, res) => {
  res.json(getSocialInfo);
});
app.get('/ports/user/getComments', (req, res) => {
  res.json(getComments);
});

// Start the server
app.listen(port, () => {
  
});
