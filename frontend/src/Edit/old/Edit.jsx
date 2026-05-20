// import React, { useState, useEffect } from 'react';
// import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Button } from '@mui/material';
// import styles from './page.module.css';
// import {createPort, getChartData, createTemporaryPort,investPort,getPrices,getDetail,getStocks,DeletePort,getStocksPerc, AdvaithcreatePort,Porttemp} from '../user';
// import SearchResults from './searchresults';
// import Header from '../New_Header_Navigation/navbar';
// import PortDraft from './port_draft';
// import { Line } from 'react-chartjs-2';
// import { useNavigate } from 'react-router-dom';
// import LoadModal from '../New_Home/loading_modal';
// import SecureStorage from 'react-secure-storage';
// function LineGraph({ dataa, labels, index }) {
//     const data = {
//       labels: labels,
//       datasets: [
//         {
//           label: 'Timestamp',
//           data: dataa,
//           fill: false,
//           backgroundColor: '#1B263B',
//           borderColor: '#1B263B', // Default border color
//           pointRadius: 0,
//           pointBackgroundColor: '#1B263B',
//           cubicInterpolationMode: 'monotone',
//         },
//       ],
//     };
  
//     const options = {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: {
//           display: false,
//           labels: {
//             color: '#1B263B',
//           },
//         },
//     },
//       scales: {
//         x: {
//           type: 'time',
//           time: {
//             unit: 'day', // Adjust the unit as needed (e.g., 'minute', 'hour', 'day', 'month')
//             displayFormats: {
//                 day: 'MMM d',// Format for the x-axis labels
//               }, // Adjust the display format as needed (e.g., 'MMM D, YYYY')
//                // Adjust the unit step size as needed
//           },
//           grid: {
//             color: '#949494',
//             borderColor: 'red',
//             drawBorder: false, // Remove the border line on the right
//             // borderDash: [0, 0], // Customize the grid line style
//             drawOnChartArea: false, // Remove the grid lines within the chart area
//             drawTicks: false, // Remove the ticks on the grid lines
//             lineWidth: 2,
//           },
//         },
//         y: {
//             grid: {
//                 color: '#949494',
//                 borderColor: 'red',
//                 drawBorder: false, // Remove the border line on the top
//                 borderDash: [0, 0], // Customize the grid line style
//                 drawOnChartArea: false, // Remove the grid lines within the chart area
//                 drawTicks: false, // Remove the ticks on the grid lines
//                 lineWidth: 2,

//             },
//             ticks:{
//             display: true,
//             }
//         },
//       }
// }
//     return (
//       <div className={styles.graphContainer}>
//         <Line data={data} options={options} className="canvas" />
//       </div>
//     );
//   };
// function SearchBar({ searchQuery, setSearchQuery }) {
//     return (
//         <div className={styles.searchbar_wrap}>
//             <input
//                 type="text"
//                 placeholder="Enter Ticker or Company Name"
//                 value={searchQuery}
//                 className={styles.searchbar}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//             />
//         </div>
//     );
// }

// function removeNulls(data) {
//     if (Array.isArray(data)) {
//         return data
//             .map(item => removeNulls(item))
//             .filter(item => item !== null);
//     } else if (data !== null && typeof data === 'object') {
//         return Object.fromEntries(
//             Object.entries(data)
//                 .map(([key, value]) => [key, removeNulls(value)])
//                 .filter(([key, value]) => value !== null)
//         );
//     } else {
//         return data;
//     }
// }

// async function searchedStocks(searchQuery) {
//     let raw_data = [];
//     raw_data = await getStocks(searchQuery);
//     const data_raw = removeNulls(raw_data);
//     const data = data_raw.map(stock => ({
//         symbol: stock.ticker,
//         percent: stock.dailyChange,
//         price: stock.price,
//         volume: stock.volume,
//         fullName: stock.fullName
//     }));
//     
//     return data;
// }
// async function selectedStocksPrices(symbols) {
//     let raw_data = await getPrices(symbols);
//         
//     const data = symbols.map((stock, index) => ({
//         symbol: stock,
//         price: raw_data[index]
//     }));

//     
//     return data;
// }


// const portfolioStats = {
//     AUTHOR: 'John Doe',
//     STATUS: 'Active',
//     PRICE: '$10,000',
//     TOTAL: '$50,000',
//     TODAY: '+2.5%',
//     RISK: 'Medium',
//     'MAX DRAWDOWN': '-15%',
//     ER: '0.5%'
//   };

//   const defaultStocks = [
//     { symbol: 'AAPL', price: 150.00, percent: '10.00', volume: 1000000, fullName: 'Apple Inc.' },
//     { symbol: 'GOOGL', price: 2800.00, percent: '5.00', volume: 500000, fullName: 'Alphabet Inc.' }


// ];



// const MakeAPort = () => {
//     const [loading, setLoading] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedStocks, setSelectedStocks] = useState([]);
//     const [detail, setDetail] = useState([]);
//     const [priceHist, setPriceHist] = useState([]);
//     const [dateObjectHist, setDateObjectHist] = useState([]);
//     const [showModal, setShowModal] = useState(false);
//     const [portId, setPortId] = useState(SecureStorage.getItem("port_id"));
//     const [isInitialized, setIsInitialized] = useState(false);
//     const navigate = useNavigate();
//     const [priceData, setPriceData] = useState([]);
//     const [queryData, setQueryData] = useState([]);

//     // Effect for handling search queries
//     useEffect(() => {
//         async function handleSearch() {
//             if (searchQuery) {
//                 const searchData = await searchedStocks(searchQuery);
//                 setQueryData(searchData);
//             } else {
//                 setQueryData([]);
//             }
//         }
//         handleSearch();
//     }, [searchQuery]);

//     // Effect for initial load of portfolio data
//     useEffect(() => {
//         async function initializePortfolio() {
//             if (isInitialized) return;

//             try {
//                 // Load initial portfolio stocks and their prices
//                 const stockss = await getStocksPerc(portId);
//                 const symbolss = stockss.map(stock => Object.keys(stock)[0]);
//                 const fetchedPrices = await selectedStocksPrices(symbolss);
//                 setPriceData(fetchedPrices);

//                 // Initialize selected stocks from portfolio
//                 if (stockss.length > 0) {
//                     const symbols = stockss.map(stock => {
//                         const symbol = Object.keys(stock)[0];
//                         const percentage = stock[symbol]; // Get the percentage value directly
//                         
//                         return {
//                             stock: symbol,
//                             percent: percentage,
//                             position: 'SHORT'
//                         };
//                     });
//                     setSelectedStocks(symbols);
//                 }

//                 // Load portfolio data
//                 const userId = SecureStorage.getItem("user_id");
//                 const portfolioData = await getDetail('personal', portId, userId);

//                 // Update portfolio details
//                 SecureStorage.setItem('name', portfolioData.name);
//                 SecureStorage.setItem('description', portfolioData.description);
//                 SecureStorage.setItem('raw_data.price', portfolioData.price);

//                 // Set statistics
//                 setDetail({
//                     AUTHOR: portfolioData.author,
//                     STATUS: portfolioData.status,
//                     PRICE: portfolioData.price,
//                     TOTAL_PNL: portfolioData.total_pnl,
//                     TODAY: portfolioData.pnl,
//                     RISK: portfolioData.risk,
//                     'MAX DRAWDOWN': portfolioData.max_drawdown,
//                     'EXPENSE RATIO': portfolioData.expense_ratio
//                 });

//                 // Load chart data
//                 const chartData = await getChartData('invest', portId, userId, "MAX");
//                 setPriceHist(chartData.value_hist);
//                 setDateObjectHist(chartData.date_hist.map(ts => new Date(ts * 1000)));

//                 setIsInitialized(true);
//             } catch (error) {
//                 console.error('Error initializing portfolio:', error);
//             }
//         }

//         initializePortfolio();
//     }, [portId]);

//     // Effect for updating price data when selected stocks change
//     useEffect(() => {
//         async function updatePriceData() {
//             if (selectedStocks.length > 0) {
//                 const symbols = selectedStocks.map(stock => stock.stock);
//                 const fetchedPrices = await selectedStocksPrices(symbols);
//                 setPriceData(fetchedPrices);
//             }
//         }
//         updatePriceData();
//     }, [selectedStocks]);

//     const handleBuildPort = async () => {
//         try {
//             const stocks = selectedStocks.map(s => s.stock).join(' ');
//             const percentages = selectedStocks.map(s => s.percent).join(' ');
//             const positions = selectedStocks.map(s => s.position).join(' ');

//             const username = SecureStorage.getItem('username');
//             const title = SecureStorage.getItem('name');
//             const description = SecureStorage.getItem('description');

//             await DeletePort();

//             if (SecureStorage.getItem('STATUS') === 'PRIVATE') {
//                 const result = await AdvaithcreatePort(
//                     title, username, stocks, percentages,
//                     description, positions, portId
//                 );

//                 if (result === "Out of market") {
//                     alert("Cannot edit port out of market hours");
//                     return;
//                 }
//             } else {
//                 await Porttemp(
//                     title, username, stocks, percentages,
//                     description, positions, 0, portId
//                 );
//             }

//             setSelectedStocks([]);
//             navigate("/home");
//         } catch (error) {
//             console.error('Error building portfolio:', error);
//         }
//     };

//     const handleTestPort = async () => {
//         try {
//             setLoading(true);

//             const stocks = selectedStocks.map(s => s.stock);
//             const percentages = selectedStocks.map(s => s.percent);

//             SecureStorage.setItem("temp_stocks", stocks);
//             SecureStorage.setItem("temp_perc", percentages);

//             const username = SecureStorage.getItem('username');
//             const userId = SecureStorage.getItem('user_id');
//             const title = SecureStorage.getItem('name');
//             const description = SecureStorage.getItem('description');

//             const stocksStr = stocks.join(' ');
//             const percentagesStr = percentages.join(' ');
//             const positionsStr = selectedStocks.map(s => s.position).join(' ');

//             const result = await createTemporaryPort(
//                 title, username, stocksStr, percentagesStr,
//                 description, positionsStr, 0, userId
//             );

//             setSelectedStocks([]);
//             navigate("/home");
//         } catch (error) {
//             console.error('Error testing portfolio:', error);
//             alert("Sorry, you can only test ports during market hours!");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className={styles.structure}>
//             <div className={styles.mainContent}>
//                 <div className={styles.searchArea}>
//                     <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
//                     <div className={styles.searchResults}>
//                         <SearchResults
//                             searchQuery={searchQuery}
//                             setSearchQuery={setSearchQuery}
//                             data={queryData}
//                             selectedStocks={selectedStocks}
//                             setSelectedStocks={setSelectedStocks}
//                         />
//                     </div>
//                     <PortDraft
//                         data={priceData}
//                         selectedStocks={selectedStocks}
//                         setSelectedStocks={setSelectedStocks}
//                     />
//                 </div>
//                 {loading && <LoadModal />}

//                 <div className={styles.sidebar}>
//                     <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2, color: '#1B263B' }}>
//                         Portfolio Statistics
//                     </Typography>
//                     <TableContainer component={Paper} sx={{ mb: 4 }}>
//                         <Table>
//                             <TableBody>
//                                 {Object.entries(detail).map(([key, value]) => (
//                                     <TableRow key={key}>
//                                         <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', color: '#1B263B' }}>
//                                             {key.replace('_', ' ')}
//                                         </TableCell>
//                                         <TableCell align="right" sx={{ color: '#1B263B' }}>{value}</TableCell>
//                                     </TableRow>
//                                 ))}
//                             </TableBody>
//                         </Table>
//                     </TableContainer>
//                 </div>
//             </div>

//             <Box sx={{
//                 width: '60%',
//                 height: 300,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 mb: 4,
//                 borderRadius: 1
//             }}>
//                 <LineGraph
//                     dataa={priceHist}
//                     labels={dateObjectHist}
//                     index={dateObjectHist[0]}
//                     unit="day"
//                 />
//             </Box>

//             <div className={styles.buttonContainer}>
//                 <Button onClick={handleTestPort}>Test Port</Button>
//                 <Button onClick={handleBuildPort}>Create Port</Button>
//             </div>
//         </div>
//     );
// };

// export default MakeAPort;

