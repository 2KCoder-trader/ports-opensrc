import React from "react"
import { Box, Typography } from "@mui/material"

interface SectorData {
  name: string
  percentage: number
}

interface SectorPercentagesProps {
  sectors: SectorData[]
}

const SectorPercentages: React.FC<SectorPercentagesProps> = ({ sectors }) => {
  return (
    <Box sx={{ width: "100%", maxWidth: 400 }}>
      <Typography variant="h6" sx={{ 
        mb: 2, 
        fontWeight: "bold", 
        color: "#ffffff",
        fontSize: "24px",
        textShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}>
        Sector Allocation
      </Typography>
      {sectors.map((sector) => (
        <Box 
          key={sector.name} 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            mb: 1.5,
            padding: "8px 12px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            borderRadius: "6px",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            }
          }}
        >
          <Typography sx={{ 
            color: "#e0d5f3",
            fontSize: "16px",
            fontWeight: "500",
          }}>
            {sector.name}
          </Typography>
          <Typography sx={{ 
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "600",
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}>
            {sector.percentage.toFixed(2)}%
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export default SectorPercentages

