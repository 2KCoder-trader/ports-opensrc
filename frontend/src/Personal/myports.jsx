import React from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";  
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import * as Mui from "@mui/material";
import Grid from "@mui/material/Grid2";
import {DummyPersonalCard, PersonalCard} from "../Cards/cardv2";
import {searchPersonalPortIds, searchInvestPorts} from "../user.js";
import SecureStorage from 'react-secure-storage';
import News from './news.jsx';

function MyPorts({setPortData}) {
    const [portIds, setPortIds] = React.useState([]);
    
    return (
      <Grid
        container
        sx={{
          backgroundColor: "#111152",
          height: "100vh",
          color: "white",
          borderLeft: "1px solid black",
          width: "420px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        <MyPortsSearchBar setPortIds={setPortIds} 
        sx={{
          backgroundColor: "#111152",
        }}/>
        
        {/* Portfolio Cards Section */}
        <Grid
          container
          spacing={4}
          sx={{
            flex: "1 1 50%", // Take up half the remaining space
            paddingTop: "20px",
            paddingLeft: "20px",
            paddingRight: "20px",
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
            alignContent: "center",
            overflowY: "auto",
            backgroundColor: "#111152",
            overflowX: "hidden",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {portIds.map((id) => (
            <PersonalCard key={id} id ={id}/>
          ))}
          <DummyPersonalCard/>
        </Grid>
      </Grid>
    );
}

function MyPortsSearchBar({setPortIds}) {
    const [selectedSortOption, setSelectedSortOption] = React.useState("title");
    const [toggleCreateAndInvest, setToggleCreateAndInvest] = React.useState("create");
    const [direction, setDirection] = React.useState("asc");
    const [searchQuery, setSearchQuery] = React.useState("");
  
    React.useEffect(() => {
      const fetchData = async () => {
        console.log("searching:", selectedSortOption);
        let test;
        let ports = [];
        let port;
        // if(toggleCreateAndInvest === "create"){
         test = await searchPersonalPortIds(searchQuery, selectedSortOption, direction, 0, SecureStorage.getItem("userId"));
        //  for (let id of test){
        //   port = await getPort(id);
        //   console.log("port:", port);
        //   ports.push(port);
        //  }
        // } else{
        //   test = await searchInvestPorts(searchQuery, selectedSortOption, direction, 0, SecureStorage.getItem("userId"));
        // }
        console.log("searching:", ports);
        setPortIds(test);
      };
      fetchData();
      // const intervalId = setInterval(fetchData, 60000);

      // return () => clearInterval(intervalId); 
    }, [selectedSortOption, direction, searchQuery, toggleCreateAndInvest]);
  
    const handleSortChange = (event) => {
      setSelectedSortOption(event.target.value);
    };
    
    const handleSearchChange = (event) => {
      setSearchQuery(event.target.value);
    };
    
    const handlePortTypeToggle = () => {
      setToggleCreateAndInvest(prev => prev === "create" ? "invest" : "create");
    };

    const handleDirectionToggle = () => {
      setDirection(prev => prev === "desc" ? "asc" : "desc");
    };
  
    return (
      <Mui.Box
        sx={{
          width: "380px",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          alignSelf: "center",
          color: "white",
          flexShrink: 0,
          backgroundColor: "#111152",
        }}
      >
        <Mui.Box
          sx={{
            width: "100%",
            display: "flex",
            color: "white",
            displayDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            backgroundColor: "#111152",
          }}
        >
          <Mui.Typography
            sx={{
              fontWeight: "700",
              fontSize: "28px",
              backgroundColor: "#111152",
              color: "white",
            }}
          >
            My Ports
          </Mui.Typography>
          <Mui.Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              backgroundColor: "#111152",
              color: "white",
            }}
          >
            <Mui.Select
              value={selectedSortOption}
              onChange={handleSortChange}
              sx={{
                width: "155px",
                height: "35px",
                borderRadius: "5px",
                fontSize: "20px",
                color: "white",
                border: "0.5px solid white",
                padding: "0 8px",
                ".MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                backgroundColor: "#111152",
                "& .MuiSelect-icon": {
                  color: "white"
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "#111152",
                    color: "white"
                  }
                }
              }}
            >
              <Mui.MenuItem value="title" sx={{ color: "white", backgroundColor: "#111152" }}>Title</Mui.MenuItem>
              <Mui.MenuItem value="lastValue" sx={{ color: "white", backgroundColor: "#111152" }}>Value</Mui.MenuItem>
              <Mui.MenuItem value="risk" sx={{ color: "white", backgroundColor: "#111152" }}>Risk</Mui.MenuItem>
              <Mui.MenuItem value="dailyPnl" sx={{ color: "white", backgroundColor: "#111152" }}>Daily Change</Mui.MenuItem>
            </Mui.Select>
            <Mui.IconButton
              onClick={handlePortTypeToggle}
              sx={{
                width: "35px",
                height: "35px",
                borderRadius: "5px",
                border: "0.5px solid white",
                color: "white",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <Mui.Typography color="white">
                {toggleCreateAndInvest === "create" ? "C" : "I"}
              </Mui.Typography>
            </Mui.IconButton>
            <Mui.IconButton
              onClick={handleDirectionToggle}
              sx={{
                width: "35px",
                height: "35px",
                borderRadius: "5px",
                border: "0.5px solid white",
                color: "white",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {direction === "asc" ? (
                <ArrowUpwardIcon sx={{ fontSize: "20px", color: "white" }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: "20px", color: "white" }} />
              )}
            </Mui.IconButton>
          </Mui.Box>
        </Mui.Box>
        <Mui.TextField
          placeholder="Search My Ports"
          value={searchQuery} 
          onChange={handleSearchChange}
          sx={{
            width: "100%",
            ".MuiOutlinedInput-root": {
              height: "35px",
              borderRadius: "5px",
              color: "white",
              "& fieldset": {
                border: "0.5px solid white",
              },
              "&:hover fieldset": {
                borderColor: "white",
              },
              "&.Mui-focused fieldset": {
                borderColor: "white",
              },
            },
            ".MuiInputBase-input": {
              padding: "8px",
              fontSize: "20px",
              paddingLeft: "30px",
              color: "white",
              "&::placeholder": {
                color: "rgba(255, 255, 255, 0.7)",
                opacity: 1,
              },
            },
            "& .MuiInputLabel-root": {
              color: "white",
            },
          }}
          InputProps={{
            sx: {
              color: "white",
            }
          }}
        />
      </Mui.Box>
    );
}

export default MyPorts;