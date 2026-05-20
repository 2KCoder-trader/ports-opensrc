import React from "react";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";  
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import * as Mui from "@mui/material";
import Grid from "@mui/material/Grid2";
import {Card} from "../Cards/cardv2";
import {searchPublicPortIds,getPort,

} from "../user.js";
import {viewEntireDB,deleteData} from "../indexDB.js";
function BrowsePortsSearchBar({window, setPortIds, view}) {
    
    const itemsInRow = Math.round((window - 460)/(221+64))
    console.log("Items in row",itemsInRow)
        
    const width = (itemsInRow * 221) + ((itemsInRow - 1) * 64);
    
    const [selectedSortOption, setSelectedSortOption] = React.useState("title");
    const [direction, setDirection] = React.useState("asc");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [pendingSelection, setPendingSelection] = React.useState("ports");
    
    

    React.useEffect(() => {
      
      const fetchData = async () => {
        let ports  = [];
        let port;
        // await deleteData();
        let portIds = await searchPublicPortIds(searchQuery, selectedSortOption, direction, 0, null);
        if (portIds){
          setPortIds(portIds);
        }
        // await deleteData();
        // const db = await viewEntireDB();
        // console.log("Db",db);

        
      };
      fetchData();
      
      // const intervalId = setInterval(fetchData, 60000);

      // return () => clearInterval(intervalId); 
    }, [selectedSortOption, direction, searchQuery,pendingSelection]);

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
            fontWeight: "600",
            fontSize: "24px",
            letterSpacing: "0.5px"
          }}
        >
          Browse Ports
        </Mui.Typography>
        <Mui.Box
        sx = {{
          display: "flex",
          flexDirection: "row",
          gap: "12px",
          alignItems: "center"
        }}
        >
          {view === "pending" &&(<PortToggles pendingSelection={pendingSelection} setPendingSelection={setPendingSelection}/>)}
        <Mui.Select
          id="dropdown-basic"
          value={selectedSortOption}
          onChange={handleSortChange}
          sx={{
            width: "160px",
            height: "40px",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "500",
            border: "none",
            color: "#ffffff",
            ".MuiOutlinedInput-notchedOutline": {
              border: "1px solid rgba(255, 255, 255, 0.12)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "1px solid rgba(255, 255, 255, 0.2)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "1px solid rgba(255, 255, 255, 0.3)",
            },
            "& .MuiSelect-icon": {
              color: "rgba(255, 255, 255, 0.7)",
            },
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(10px)",
            transition: "all 0.2s ease-in-out",
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
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(10px)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          {direction === "asc" ? (
            <ArrowUpwardIcon
              sx={{
                fontSize: "20px",
                color: "rgba(255, 255, 255, 0.7)",
              }}
            />
          ) : (
            <ArrowDownwardIcon
              sx={{
                fontSize: "20px",
                color: "rgba(255, 255, 255, 0.7)",
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
              height: "40px",
              borderRadius: "8px",
              "& fieldset": {
                border: "1px solid rgba(255, 255, 255, 0.12)",
              },
              "&:hover fieldset": {
                border: "1px solid rgba(255, 255, 255, 0.2)",
              },
              "&.Mui-focused fieldset": {
                border: "1px solid rgba(255, 255, 255, 0.3)",
              },
            },
            ".MuiInputBase-input": {
              padding: "8px 16px",
              fontSize: "15px",
              fontWeight: "500",
              color: "#ffffff",
              "&::placeholder": {
                color: "rgba(255, 255, 255, 0.5)",
                opacity: 1,
              },
            },
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(10px)",
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
    const [portIds, setPortIds] = React.useState([]);
    
    const [windowSize, setWindowSize] = React.useState(window.innerWidth);
    React.useEffect(() => {
      const handleResize = () => {
        setWindowSize(window.innerWidth);
      };
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    
    }, []);

  
    return (
      <Grid
      container
      sx={{
        position: "relative",
        background: "linear-gradient(180deg, rgba(17, 17, 82, 0.95) 0%, rgba(13, 13, 62, 0.98) 50%, rgba(10, 10, 45, 1) 100%)",
        padding: "10px 20px 10px 20px",
        flexGrow: 1,
        display: "flex",
        alignContent: "flex-start",
        justifyContent: "center",
        boxShadow: "inset 0 0 100px rgba(0, 0, 0, 0.2)",
        minWidth: "385px",
      }}
    >
      <BrowsePortsSearchBar window = {windowSize} setPortIds= {setPortIds} view={view}/>
      <Grid
        container
        spacing={8}
        sx={{
          paddingTop: "20px",
          display: "grid", // Switch to CSS grid for precise row alignment
          gridTemplateColumns: "repeat(auto-fill,221px)", 
          justifyContent: "center",
          width: "100%",
          height: "100%", // Fixed height for the grid container
          overflowY: "auto", // Enable vertical scrolling
          overflowX: "hidden", // Prevent horizontal scrolling
          scrollbarWidth: "none", // For Firefox
          alignItems: "start",
          justifyContent: "center",
          backgroundColor:"#111152",
      "&::-webkit-scrollbar": { // For Chrome, Safari, Edge
        display: "none",
      },
        }}
      >
        {portIds.map((id) => {
          return (
            <Grid
              item
              sx={{
                display: "flex",
                justifyContent: "center", // Center items within each cell
                alignItems: "center",
              }}
            >
              <Card id={id} setIsClicked={setPortData} />
            </Grid>
          );
        })}
        <Mui.Box sx = {{
          height: "500px",
        }}>

        </Mui.Box>
      </Grid>
    </Grid>
    );
  }


  export default PortMarket;