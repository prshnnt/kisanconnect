import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction"
import Divider from "@mui/material/Divider"
import Avatar from "@mui/material/Avatar"
import Chip from "@mui/material/Chip"
import BuildIcon from "@mui/icons-material/Build"
import PhoneIcon from "@mui/icons-material/Phone"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import StarIcon from "@mui/icons-material/Star"
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import TranslateIcon from "@mui/icons-material/Translate"
import LogoutIcon from "@mui/icons-material/Logout"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import { useAuth } from "../../contexts/AuthContext.jsx"
import TopBar from "../../components/TopBar.jsx"

export default function S6MyProfile() {
  const { lang, setLang } = useLang()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const name = user?.name || (lang === "hi" ? "सेवा प्रदाता" : "Service provider")
  const mobile = user?.mobile || "+91 98XXXXXX67"

  function handleLogout() {
    logout()
    navigate("/")
  }

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "मेरी प्रोफाइल" : "My profile"} />

      <Box sx={{ px: 2, py: 2 }}>
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "#3730A3",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {name.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {mobile}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  size="small"
                  icon={<BuildIcon sx={{ fontSize: 14 }} />}
                  label={lang === "hi" ? "सेवा प्रदाता" : "Service provider"}
                  sx={{ bgcolor: "#E0E7FF", color: "#3730A3", fontWeight: 600 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-around",
              textAlign: "center",
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.25,
                }}
              >
                <StarIcon sx={{ fontSize: 16, color: "#F5A524" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  4.6
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi" ? "रेटिंग" : "Rating"}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                214
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi" ? "काम पूरे" : "Jobs done"}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                2
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi" ? "सेवाएं" : "Services"}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <List disablePadding>
            <ListItem>
              <ListItemIcon>
                <PhoneIcon sx={{ color: "#6B7280" }} />
              </ListItemIcon>
              <ListItemText
                primary={lang === "hi" ? "मोबाइल नंबर" : "Mobile number"}
                secondary={mobile}
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon>
                <LocationOnIcon sx={{ color: "#6B7280" }} />
              </ListItemIcon>
              <ListItemText
                primary={lang === "hi" ? "सेवा क्षेत्र" : "Service area"}
                secondary="Lucknow, 25 km radius"
              />
            </ListItem>
            <Divider component="li" />
            <ListItem button onClick={() => navigate("/provider/services")}>
              <ListItemIcon>
                <MiscellaneousServicesIcon sx={{ color: "#6B7280" }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  lang === "hi" ? "मेरी सेवाएं प्रबंधित करें" : "Manage my services"
                }
              />
              <ListItemSecondaryAction>
                <ChevronRightIcon sx={{ color: "#9CA3AF" }} />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider component="li" />
            <ListItem button onClick={() => navigate("/provider/calendar")}>
              <ListItemIcon>
                <CalendarMonthIcon sx={{ color: "#6B7280" }} />
              </ListItemIcon>
              <ListItemText
                primary={lang === "hi" ? "मेरा कैलेंडर देखें" : "View my calendar"}
              />
              <ListItemSecondaryAction>
                <ChevronRightIcon sx={{ color: "#9CA3AF" }} />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Card>

        <Card sx={{ mb: 2 }}>
          <List disablePadding>
            <ListItem
              button
              onClick={() => setLang(lang === "hi" ? "en" : "hi")}
            >
              <ListItemIcon>
                <TranslateIcon sx={{ color: "#6B7280" }} />
              </ListItemIcon>
              <ListItemText
                primary={lang === "hi" ? "भाषा" : "Language"}
                secondary={lang === "hi" ? "हिंदी" : "English"}
              />
              <ListItemSecondaryAction>
                <ChevronRightIcon sx={{ color: "#9CA3AF" }} />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider component="li" />
            <ListItem button>
              <ListItemIcon>
                <HelpOutlineIcon sx={{ color: "#6B7280" }} />
              </ListItemIcon>
              <ListItemText
                primary={lang === "hi" ? "सहायता और सपोर्ट" : "Help & support"}
              />
              <ListItemSecondaryAction>
                <ChevronRightIcon sx={{ color: "#9CA3AF" }} />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Card>

        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          sx={{ height: 52 }}
          onClick={handleLogout}
        >
          {lang === "hi" ? "लॉग आउट" : "Log out"}
        </Button>
      </Box>
    </Box>
  )
}
