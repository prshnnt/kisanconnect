import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import { useLang } from "../contexts/LanguageContext.jsx"

export default function VerifiedBadge({ size = "small" }) {
  const { lang } = useLang()
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        color: "#3730A3",
      }}
    >
      <VerifiedUserIcon sx={{ fontSize: size === "small" ? 16 : 20 }} />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: "#3730A3",
          fontSize: size === "small" ? "0.75rem" : "0.875rem",
        }}
      >
        {lang === "hi" ? "सत्यापित" : "Verified"}
      </Typography>
    </Box>
  )
}
