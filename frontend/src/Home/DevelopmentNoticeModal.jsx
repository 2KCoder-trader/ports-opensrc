import React, { useState, useEffect } from "react";
import SecureStorage from 'react-secure-storage';
import {
  Modal,
  Box,
  Typography,
  Button,
  Backdrop,
  Fade,
} from "@mui/material";
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#1e1e1e",
  borderRadius: "12px",
  boxShadow: 24,
  padding: "32px",
  width: "90%",
  maxWidth: "400px",
  color: "#fff",
  outline: "none",
};

function DevelopmentNoticeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (SecureStorage.getItem("justLoggedIn") === true){
      setOpen(true); 
      SecureStorage.setItem("justLoggedIn", false); // Reset the flag after showing the modal
    }
    
  }, []);

  const handleClose = () => setOpen(false);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 300 }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            🚧 Under Development
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: "16px" }}>
            This website is still heavily under development. You may encounter bugs and issues with many of the features.
            With that being said, enjoy exploring <strong>Ports</strong>!
          </Typography>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              backgroundColor: "#00B4D8",
              color: "#fff",
              textTransform: "none",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#0077B6",
              },
            }}
            fullWidth
          >
            Got it!
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
}

export default DevelopmentNoticeModal;
