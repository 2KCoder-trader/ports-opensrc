import React  from "react";
import { useParams } from "react-router-dom";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";  
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import * as Mui from "@mui/material";
import Grid from "@mui/material/Grid2";
import {Card} from "../Cards/cardv2";
import SecureStorage from 'react-secure-storage';
import {searchPublicPorts,getProfilePortfolios,searchPersonalPorts} from "../user.js";
function BrowsePortsSearchBar({window, setPortDatas, view}) {
    
    const itemsInRow = Math.floor((window - 460)/(221+64))
        
    const width = (itemsInRow * 221) + ((itemsInRow - 1) * 64);
    
    const [selectedSortOption, setSelectedSortOption] = React.useState("title");
    const [direction, setDirection] = React.useState("asc");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [pendingSelection, setPendingSelection] = React.useState("ports");



const handleSortChange = (event) => {
  setSelectedSortOption(event.target.value);
};
const handleSearchChange = (event) => {
  setSearchQuery(event.target.value); // Update the searchQuery state
};

const handleDirectionToggle = () => {
  if (direction === "desc") {
    setDirection("asc");
  }
  else {
    setDirection("desc");
  }
};
  return (
    <Mui.Box
      sx={{
        width: width,
      }}
    >
      <Mui.Box
        sx={{
          width: "100%",
          display: "flex",
          displayDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Mui.Typography
          sx={{
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "28px",
          }}
        >
          Browse Ports
        </Mui.Typography>
        <Mui.Box
        sx = {{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
        }}
        >
          {view === "pending" &&(<PortToggles pendingSelection={pendingSelection} setPendingSelection={setPendingSelection}/>)}
        <Mui.Select
  id="dropdown-basic"
  value={selectedSortOption}
  onChange={handleSortChange}
  sx={{
    width: "190px",
    height: "35px",
    borderRadius: "5px",
    fontSize: "20px",
    border: "0.5px solid rgba(255, 255, 255, 0.3)",
    padding: "0 8px",
    color: "#ffffff",
    ".MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    "& .MuiSelect-icon": {
      color: "#ffffff",
    },
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  }}
> 
  <Mui.MenuItem value="title">Title</Mui.MenuItem>
  <Mui.MenuItem value="risk">Risk</Mui.MenuItem>
  <Mui.MenuItem value="annualReturn">Annual Return</Mui.MenuItem>
  <Mui.MenuItem value="dailyPnl">Daily Change</Mui.MenuItem>
</Mui.Select>
<Mui.IconButton
  onClick={handleDirectionToggle}
  sx={{
    width: "35px",
    height: "35px",
    borderRadius: "5px",
    border: "0.5px solid rgba(255, 255, 255, 0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  }}
>
  {direction === "asc" ? (
    <ArrowUpwardIcon
      sx={{
        fontSize: "20px",
        color: "#ffffff",
      }}
    />
  ) : (
    <ArrowDownwardIcon
      sx={{
        fontSize: "20px",
        color: "#ffffff",
      }}
    />
  )}
</Mui.IconButton>
</Mui.Box>
      </Mui.Box>
      <Mui.Box
        sx={{
          width: "100%",
          display: "flex",
          displayDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
          gap: "10px",
        }}
      >
        <Mui.TextField
          id="outlined-basic"
          placeholder="Search Ports"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            width: "100%",
            ".MuiOutlinedInput-root": {
              height: "35px",
              borderRadius: "5px",
              "& fieldset": {
                border: "0.5px solid rgba(255, 255, 255, 0.3)",
              },
              "&:hover fieldset": {
                border: "0.5px solid rgba(255, 255, 255, 0.5)",
              },
              "&.Mui-focused fieldset": {
                border: "0.5px solid rgba(255, 255, 255, 0.7)",
              },
            },
            ".MuiInputBase-input": {
              padding: "8px",
              paddingLeft: "30px",
              fontSize: "20px",
              color: "#ffffff",
              "&::placeholder": {
                color: "rgba(255, 255, 255, 0.7)",
                opacity: 1,
              },
            },
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          }}
        />
      </Mui.Box>
    </Mui.Box>
  );
}


function PortToggles({pendingSelection, setPendingSelection}){

    const handleSortChange = (event) => {
      setPendingSelection(event.target.value);
      };
  
    return(
      <Mui.Select
      id="dropdown-basic"
      value={pendingSelection}
      onChange={handleSortChange}
      sx={{
        width: "190px",
        height: "35px",
        borderRadius: "5px",
        fontSize: "20px",
        border: "0.5px solid #08082380",
        padding: "0 8px",
        ".MuiOutlinedInput-notchedOutline": {
          border: "none",
        },
      }}
    > <Mui.MenuItem value="ports">Ports</Mui.MenuItem>
      <Mui.MenuItem value="stocks">Stocks</Mui.MenuItem>
      
    </Mui.Select>
    )
  }
  
  
  function PortMarket({setPortData, view}) {
    const [portDatas, setPortDatas] = React.useState([]);
    
  
  
    return (
      <Grid
      container
      sx={{
        position: "relative",
        backgroundColor: "#111152",
        padding: "10px 20px 10px 20px",
        flexGrow: 1,
        display: "flex",
        alignContent: "flex-start",
        justifyContent: "center",
        // Align rows to the top
      }}
    >
      <BrowsePortsSearchBar window = {window.innerWidth} setPortDatas= {setPortDatas} view={view}/>
      <Grid
        container
        spacing={8}
        sx={{
          paddingTop: "20px",
          paddingLeft: "3.4%",
          paddingRight: "3%",
          display: "grid", // Switch to CSS grid for precise row alignment
          gridTemplateColumns: "repeat(auto-fit, 221px)", // Auto-adjust column count
          justifyContent: "center",
          width: "100%",
          height: "700px", // Fixed height for the grid container
          overflowY: "auto", // Enable vertical scrolling
          overflowX: "hidden", // Prevent horizontal scrolling
          scrollbarWidth: "none", // For Firefox
          alignItems: "start",
          justifyContent: "left",
      "&::-webkit-scrollbar": { // For Chrome, Safari, Edge
        display: "none",
      },
        }}
      >
        {portDatas.map((portData) => {
          return (
            <Grid
              item
              sx={{
                display: "flex",
                justifyContent: "center", // Center items within each cell
                alignItems: "center",
              }}
            >
              <Card portData={portData} setIsClicked={setPortData} />
            </Grid>
          );
        })}
      </Grid>
    </Grid>
    );
  }


  export default PortMarket;