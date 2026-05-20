import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FaDiscord } from "react-icons/fa";

export function SignUpButton() {
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => navigate("/register")}
      sx={{
        height: "44px",
        minWidth: "120px",
        borderRadius: "8px",
        backgroundColor: "#00B4D8",
        color: "#FFFFFF",
        fontSize: "16px",
        fontWeight: 500,
        textTransform: "none",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "#0077B6",
          transform: "translateY(-1px)",
        },
        "@media (max-width: 606px)": {
          fontSize: "14px",
          height: "40px",
          minWidth: "100px",
        }
      }}
    >
      Sign Up
    </Button>
  );
}

export function SignInButton() {
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => navigate("/login")}
      sx={{
        height: "44px",
        minWidth: "120px",
        borderRadius: "8px",
        backgroundColor: "transparent",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        color: "#FFFFFF",
        fontSize: "16px",
        fontWeight: 500,
        textTransform: "none",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(255, 255, 255, 0.5)",
          transform: "translateY(-1px)",
        },
        "@media (max-width: 606px)": {
          fontSize: "14px",
          height: "40px",
          minWidth: "100px",
        }
      }}
    >
      Sign In
    </Button>
  );
}

export function DiscordButton() {
  return (
    <Button
      onClick={() => window.open("https://discord.gg/wdKZK6kGBs", "_blank")}
      sx={{
        height: "44px",
        minWidth: "120px",
        borderRadius: "8px",
        backgroundColor: "#5865F2",
        color: "#FFFFFF",
        fontSize: "16px",
        fontWeight: 500,
        textTransform: "none",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: "#4752C4",
          transform: "translateY(-1px)",
        },
        "@media (max-width: 606px)": {
          fontSize: "14px",
          height: "40px",
          minWidth: "100px",
        }
      }}
    >
      Discord
      <FaDiscord style={{ width: "40px" }} />
    </Button>
  );
}
