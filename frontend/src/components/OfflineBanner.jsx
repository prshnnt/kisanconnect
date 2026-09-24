import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import WifiOffIcon from "@mui/icons-material/WifiOff"

export default function OfflineBanner({ time }) {
  return (
    <Box
      sx={{
        bgcolor: "#FEF3C7",
        px: 2,
        py: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <WifiOffIcon sx={{ fontSize: 16, color: "#B45309" }} />
      <Typography variant="caption" sx={{ color: "#B45309", fontWeight: 500 }}>
        Showing prices from {time || "6:00 am"} • No internet
      </Typography>
    </Box>
  )
}
