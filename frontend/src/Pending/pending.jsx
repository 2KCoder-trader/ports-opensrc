import React from "react";
import { getPendingPorts } from "../user.js";
import {Card} from "../Cards/cardv2";
import Grid from "@mui/material/Grid2";
import SecureStorage from 'react-secure-storage';
import { useNavigate } from "react-router-dom";
const adminUserIds = [16, 15, 51];
function PendingPorts() {
    const userId = SecureStorage.getItem("userId");
    const navigate = useNavigate();
    const [portDatas, setPortDatas] = React.useState([]);
    if(!adminUserIds.includes(userId)){
      navigate("/home");
    }

    
    React.useEffect(() => {
      const fetchData = async () =>{
        const ports = await getPendingPorts();
        setPortDatas(ports.content);    
      }
      fetchData();
    },[]);
  
  
    return (
      <Grid
      container
      sx={{
        position: "relative",
        backgroundColor: "#F6F5F5",
        padding: "10px 20px 10px 20px",
        flexGrow: 1,
        display: "flex",
        alignContent: "flex-start",
        justifyContent: "center",
        // Align rows to the top
      }}
    >
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
              <Card portData={portData} />
            </Grid>
          );
        })}
      </Grid>
    </Grid>
    );
  }

  export default PendingPorts;