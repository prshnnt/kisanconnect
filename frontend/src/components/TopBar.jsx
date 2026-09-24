import React from "react"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import Chip from "@mui/material/Chip"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined"
import VolumeUpIcon from "@mui/icons-material/VolumeUp"
import { useLang } from "../contexts/LanguageContext.jsx"

export default function TopBar({ title, onNotifications, onHelp }) {
  const { lang, setLang } = useLang()

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#FFFBF5",
        borderBottom: "1px solid #F3E8D0",
        color: "#1F2937",
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          {title || "KisanConnect"}
        </Typography>

        <Chip
          label={lang === "hi" ? "हिं" : "EN"}
          size="small"
          onClick={() => setLang(lang === "hi" ? "en" : "hi")}
          sx={{
            fontWeight: 700,
            cursor: "pointer",
            bgcolor: "#F5A524",
            color: "#1F2937",
          }}
        />

        <IconButton size="small" onClick={onHelp} aria-label="Help">
          <HelpOutlineIcon sx={{ color: "#3730A3" }} />
        </IconButton>

        <IconButton size="small" aria-label="Read aloud">
          <VolumeUpIcon sx={{ color: "#3730A3" }} />
        </IconButton>

        <IconButton
          size="small"
          onClick={onNotifications}
          aria-label="Notifications"
        >
          <NotificationsNoneIcon sx={{ color: "#1F2937" }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
