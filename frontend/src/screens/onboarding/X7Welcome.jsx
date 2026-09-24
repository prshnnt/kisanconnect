import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import Button from "@mui/material/Button"
import CelebrationIcon from "@mui/icons-material/Celebration"
import AgricultureIcon from "@mui/icons-material/Agriculture"
import ShowChartIcon from "@mui/icons-material/ShowChart"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import StoreIcon from "@mui/icons-material/Store"
import PeopleIcon from "@mui/icons-material/People"
import ReceiptIcon from "@mui/icons-material/Receipt"
import BuildIcon from "@mui/icons-material/Build"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import { useAuth } from "../../contexts/AuthContext.jsx"

const FIRST_STEPS = {
  farmer: [
    {
      icon: ShowChartIcon,
      hi: "अपनी फसल के भाव देखें",
      en: "Check prices for your crop",
      path: "/farmer/prices",
    },
    {
      icon: AgricultureIcon,
      hi: "पहली लॉट डालें",
      en: "Create your first lot",
      path: "/farmer/sell",
    },
    {
      icon: AccountBalanceWalletIcon,
      hi: "बैंक खाता जोड़ें",
      en: "Add your bank account",
      path: "/farmer/me",
    },
  ],
  buyer: [
    { icon: StoreIcon, hi: "फसल खोजें", en: "Find produce", path: "/buyer/find" },
    {
      icon: PeopleIcon,
      hi: "अपनी मांग दर्ज करें",
      en: "Post your demand",
      path: "/buyer/demand",
    },
    {
      icon: ReceiptIcon,
      hi: "ट्रेड लाइसेंस जोड़ें",
      en: "Add trade licence",
      path: "/buyer/trust",
    },
  ],
  agent: [
    {
      icon: PeopleIcon,
      hi: "किसान जोड़ें",
      en: "Add a farmer",
      path: "/agent/farmers",
    },
    {
      icon: AgricultureIcon,
      hi: "किसान की लॉट बनाएं",
      en: "Create a lot for a farmer",
      path: "/agent/lots",
    },
    {
      icon: AccountBalanceWalletIcon,
      hi: "अपना कमीशन देखें",
      en: "View your commission",
      path: "/agent/money",
    },
  ],
  provider: [
    {
      icon: BuildIcon,
      hi: "अपनी सेवा दर्ज करें",
      en: "Register your service",
      path: "/provider/services",
    },
    {
      icon: CalendarTodayIcon,
      hi: "काम का शेड्यूल देखें",
      en: "View your schedule",
      path: "/provider/calendar",
    },
    {
      icon: AccountBalanceWalletIcon,
      hi: "कमाई देखें",
      en: "Check your earnings",
      path: "/provider/earnings",
    },
  ],
  admin: [
    {
      icon: AdminPanelSettingsIcon,
      hi: "डैशबोर्ड देखें",
      en: "View dashboard",
      path: "/admin",
    },
    {
      icon: CheckCircleIcon,
      hi: "अनुमोदन की जांच करें",
      en: "Check approvals",
      path: "/admin/approvals",
    },
    {
      icon: PeopleIcon,
      hi: "उपयोगकर्ता प्रबंधन",
      en: "Manage users",
      path: "/admin/people",
    },
  ],
}

export default function X7Welcome() {
  const { lang } = useLang()
  const { role } = useAuth()
  const navigate = useNavigate()
  const steps = FIRST_STEPS[role] || FIRST_STEPS.farmer

  function getDashboardPath() {
    const paths = {
      farmer: "/farmer",
      buyer: "/buyer",
      agent: "/agent",
      provider: "/provider",
      admin: "/admin",
    }
    return paths[role] || "/farmer"
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFFBF5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 390, textAlign: "center" }}>
        <CelebrationIcon sx={{ fontSize: 64, color: "#F5A524", mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === "hi" ? "स्वागत है!" : "Welcome!"}
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 4 }}>
          {lang === "hi"
            ? "KisanConnect से जुड़ने के लिए धन्यवाद। अब शुरू करें:"
            : "Thanks for joining KisanConnect. Get started:"}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 4 }}>
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <Card key={i} sx={{ border: "1px solid #F3E8D0" }}>
                <CardActionArea
                  onClick={() => navigate(step.path)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    textAlign: "left",
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: "#FEF3C7",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ color: "#F5A524", fontSize: 24 }} />
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {lang === "hi" ? step.hi : step.en}
                  </Typography>
                  <Box
                    sx={{
                      ml: "auto",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: "#E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: "#6B7280" }}
                    >
                      {i + 1}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            )
          })}
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => navigate(getDashboardPath())}
        >
          {lang === "hi" ? "होम पर जाएं" : "Go to home"}
        </Button>
      </Box>
    </Box>
  )
}
