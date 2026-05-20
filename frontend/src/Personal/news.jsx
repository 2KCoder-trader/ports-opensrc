// import React, { useState, useEffect } from 'react';

// const TerminalNews = () => {
//   const [headlines, setHeadlines] = useState([]);
  
//   // Simulate API call - replace this with your actual API
//   const fetchNews = async () => {
//     // Simulated data - replace with your API call
//     const mockData = [
//       {
//         id: Date.now() + 1,
//         time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
//         source: "REUTERS",
//         headline: "Global Markets Show Signs of Recovery as Tech Stocks Surge",
//         sentiment: 1
//       },
//       {
//         id: Date.now() + 2,
//         time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
//         source: "BLOOMBERG",
//         headline: "Oil Prices Drop Amid Supply Chain Concerns",
//         sentiment: -1
//       },
//       // Add more mock headlines as needed
//     ];
    
//     // Keep only the latest 50 headlines to prevent excessive memory usage
//     setHeadlines(prevHeadlines => {
//       const combined = [...mockData, ...prevHeadlines];
//       return combined.slice(0, 50);
//     });
//   };

//   // Fetch new headlines every 500ms
//   useEffect(() => {
//     const interval = setInterval(fetchNews, 500);
//     return () => clearInterval(interval);
//   }, []);

//   const getSentimentDisplay = (sentiment) => {
//     if (sentiment > 0) return <span className="text-green-400">Positive</span>;
//     if (sentiment < 0) return <span className="text-red-400">Negative</span>;
//     return <span className="text-gray-400">Neutral</span>;
//   };

//   return (
//     <div className="w-full max-w-4xl" style={{ backgroundColor: '#080823' }}>
//       <div className="p-4 font-mono text-white">
//         <div className="flex items-center space-x-2 mb-4 bg-opacity-20 bg-white p-2">
//           <div className="bg-blue-500 text-white px-2">NEWS</div>
//           <div className="text-white opacity-70">Dow Jones Top News</div>
//           <div className="text-white opacity-70">Filtered Feed</div>
//           <div className="ml-auto text-white opacity-70">+</div>
//         </div>
        
//         <div className="text-xs">
//           <div className="grid grid-cols-12 gap-2 text-white opacity-70 mb-2">
//             <div className="col-span-1">TIME</div>
//             <div className="col-span-2">SOURCE</div>
//             <div className="col-span-7">HEADLINE</div>
//             <div className="col-span-2 text-right">SENTIMENT</div>
//           </div>
          
//           <div className="h-96 overflow-y-auto" style={{ scrollbarColor: 'rgba(255,255,255,0.3) rgba(255,255,255,0.1)' }}>
//             {headlines.map((item) => (
//               <div key={item.id} className="grid grid-cols-12 gap-2 hover:bg-white hover:bg-opacity-5 py-1 cursor-pointer">
//                 <div className="col-span-1 text-white opacity-70">{item.time}</div>
//                 <div className="col-span-2 text-white opacity-70">{item.source}</div>
//                 <div className="col-span-7 text-white">{item.headline}</div>
//                 <div className="col-span-2 text-right">
//                   {getSentimentDisplay(item.sentiment)}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TerminalNews;

import React, { useState, useEffect } from 'react';
import * as Mui from "@mui/material";
import Grid from "@mui/material/Grid2";
import {getNewsData} from '../user';

const News = () => {
  const [headlines, setHeadlines] = useState([]);
  
  // Simulate API call - replace with your actual API
  const fetchNews = async () => {
    // Simulated data - replace with your API call
      let data = await getNewsData();
      

    // const mockData = [
    //   {
    //     id: Date.now() + 1,
    //     time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    //     source: "REUTERS",
    //     headline: "Global Markets Show Signs of Recovery as Tech Stocks Surge",
    //     sentiment: 1
    //   },
    //   {
    //     id: Date.now() + 2,
    //     time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    //     source: "BLOOMBERG",
    //     headline: "Oil Prices Drop Amid Supply Chain Concerns",
    //     sentiment: -1
    //   },
    // ];
    
    setHeadlines(prevHeadlines => {
      const combined = [...data, ...prevHeadlines];
      return combined.slice(0, 50);
    });
  };

  useEffect(() => {
    // Fetch immediately on component mount
    fetchNews();
    
    // Set interval for 2 hours (in milliseconds)
    const interval = setInterval(fetchNews, 2 * 60 * 60 * 1000);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);
  return (
    <Mui.Box
      sx={{
        width: "380px",
        backgroundColor: "#080823",
        borderRadius: "5px",
        alignSelf: "center",
        fontFamily: "monospace",
      }}
    >
      <Mui.Box
        sx={{
          p: 2,
          color: "white",
        }}
      >
        <Mui.Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            p: 1,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <Mui.Box
            sx={{
              backgroundColor: "#1976d2",
              px: 1,
              py: 0.5,
            }}
          >
            NEWS
          </Mui.Box>
          <Mui.Typography
            sx={{
              opacity: 0.7,
              fontSize: "0.875rem",
            }}
          >
             Top News
          </Mui.Typography>
          <Mui.Typography
            sx={{
              opacity: 0.7,
              fontSize: "0.875rem",
            }}
          >
          
          </Mui.Typography>
          <Mui.Box sx={{ flexGrow: 1 }} />

        </Mui.Box>

        <Grid container sx={{ fontSize: "0.75rem", mb: 1, opacity: 0.7 }}>
          <Grid xs={1.5}>TIME</Grid>
          <Grid xs={2.5}>SOURCE</Grid>
          <Grid xs={6}>HEADLINE</Grid>
          <Grid xs={2} sx={{ textAlign: "right" }}>SENTIMENT</Grid>
        </Grid>

        <Mui.Box
          sx={{
            height: "384px",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
          }}
        >
          {headlines.map((item) => (
            <Grid
              container
              key={item.id}
              sx={{
                py: 0.5,
                fontSize: "0.75rem",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
              }}
            >
              <Grid xs={1.5} sx={{ opacity: 0.7 }}>{item.time}</Grid>
              <Grid xs={2.5} sx={{ opacity: 0.7 }}>{item.source}</Grid>
              <Grid xs={6} sx={{ color: "white" }}>{item.title}</Grid>
              <Grid xs={2} sx={{ textAlign: "right", color: item.sentiment > 0 ? "#4caf50" : "#f44336" }}>
                {item.sentiment > 0 ? "Positive" : "Negative"}
              </Grid>
            </Grid>
          ))}
        </Mui.Box>
      </Mui.Box>
    </Mui.Box>
  );
};

export default News;