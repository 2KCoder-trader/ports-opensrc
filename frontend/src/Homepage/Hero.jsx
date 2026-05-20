import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticlesComponent from './tsparticles';

export function Hero() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "0 20px",
        position: "relative"
      }}
    >
      <Box sx={{
        position: "absolute",
        top: "-50%",
        left: "-50%",
        right: "-50%",
        bottom: "-50%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.6
      }}>
        <ParticlesComponent />
      </Box>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Typography
          sx={{
            fontSize: { xs: "40px", sm: "50px", md: "60px" },
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "1.5rem",
            lineHeight: 1.2,
            textShadow: "0 0 20px rgba(139, 109, 190, 0.3)",
            background: "linear-gradient(135deg, #ffffff 0%, #e0d5f3 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          A Simpler and Cheaper Way to Diversify
        </Typography>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <Typography
          sx={{
            fontSize: { xs: "18px", sm: "20px" },
            color: "#e0d5f3",
            fontWeight: "400",
            textAlign: "center",
            maxWidth: "800px",
            marginBottom: "3rem",
            lineHeight: 1.6,
            opacity: 0.9
          }}
        >
          Search for user-curated portfolios, custom built with safety and
          security in mind
        </Typography>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem"
          }}
        >
          <Button
            variant="contained"
            onClick={() => navigate("/demo")}
            sx={{
              height: "60px",
              minWidth: "250px",
              background: "linear-gradient(135deg, #8b6dbe 0%, #6b4d9e 100%)",
              borderRadius: "30px",
              fontSize: "20px",
              fontWeight: "600",
              textTransform: "none",
              color: "#ffffff",
              boxShadow: "0 8px 20px rgba(107, 77, 158, 0.3)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 25px rgba(107, 77, 158, 0.4)",
                background: "linear-gradient(135deg, #9d7fd0 0%, #7c5eb0 100%)"
              },
              "&:active": {
                transform: "translateY(1px)"
              }
            }}
          >
            Browse Ports
          </Button>

          <Typography
            sx={{
              fontSize: { xs: "22px", sm: "28px" },
              color: "#ffffff",
              fontWeight: "bold",
              textAlign: "center",
              opacity: 0.9,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            Start investing with as little as $5
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
}