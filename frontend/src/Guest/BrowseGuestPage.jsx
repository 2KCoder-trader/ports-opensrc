import React from "react";
import Grid from "@mui/material/Grid2";
import portsImage from "../Homepage/Images/ports_logo.png";
import { SignInButton, SignUpButton, DiscordButton } from "../Homepage/HeaderButtons.jsx";
import { Card } from "../Cards/cardv2";
import * as Mui from "@mui/material";
import { useNavigate } from "react-router-dom";
import Footer from "../Homepage/Footer.jsx"; // Import Footer component

function BrowseGuestPage() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #080823 0%, #1e1e7f 35%, #3939bf 100%)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header Section */}
      <Grid container spacing={3} sx={{ 
        padding: "10px", 
        alignItems: "center",
        background: "rgba(8, 8, 35, 0.8)",
        backdropFilter: "blur(10px)"
      }}>
        <Grid item md={6} xs={4}>
          <a href="/">
              <img
                src={portsImage}
                alt="Ports Logo"
                style={{ 
                  width: "72px", 
                  height: "64px",
                  marginRight: "12px",
                  filter: "drop-shadow(0 0 8px rgba(139, 109, 190, 0.3))"
                }}
              />
          </a>
        </Grid>
        <Grid container spacing={2} sx={{ 
          alignItems: "center", 
          justifyContent: "flex-start",
          gap: "10px",
          marginLeft: "20px"
        }}>
          <Grid item>
            <SignUpButton />
          </Grid>
          <Grid item>
            <SignInButton />
          </Grid>
          <Grid item>
            <DiscordButton />
            </Grid>
        </Grid>
      </Grid>

      {/* DemoMarket Section */}
      <DemoMarket />

      {/* Footer Section */}
      <Footer /> {/* Add Footer component here */}
    </div>
  );
}

function DemoMarket() {
  const navigate = useNavigate();
  const [portDatas, setPortDatas] = React.useState([]);

  // React.useEffect(() => {
  //   const fetchData = async () => {
  //     const ports = await searchPublicPorts("", "title", "asc", 0, null);
  //     setPortDatas(ports.content);
  //   };
  //   fetchData();
  // }, []);

  const setPortData = () => {
    navigate("/register");
  };

  return (
    <Grid
      container
      sx={{
        position: "relative",
        background: "rgba(17, 17, 82, 0.7)",
        backdropFilter: "blur(5px)",
        padding: "10px 20px",
        flexGrow: 1,
        display: "flex",
        alignContent: "flex-start",
        justifyContent: "center",
      }}
    >
      <Grid
        container
        spacing={8}
        sx={{
          paddingTop: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, 221px)",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
          alignItems: "start",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {portDatas.map((portData) => (
          <Grid
            item
            key={portData.id}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Card portData={portData} setIsClicked={setPortData} />
          </Grid>
        ))}
        <Mui.Box sx={{ height: "350px" }}></Mui.Box>
      </Grid>
    </Grid>
  );
}

export default BrowseGuestPage;
