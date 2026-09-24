import React from "react"
import Box from "@mui/material/Box"
import BottomNavigation from "@mui/material/BottomNavigation"
import BottomNavigationAction from "@mui/material/BottomNavigationAction"
import HomeIcon from "@mui/icons-material/Home"
import ShowChartIcon from "@mui/icons-material/ShowChart"
import AgricultureIcon from "@mui/icons-material/Agriculture"
import HandshakeIcon from "@mui/icons-material/Handshake"
import PersonIcon from "@mui/icons-material/Person"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import BalveerFAB from "../../components/BalveerFAB.jsx"

const TABS = [
  { path: "/farmer", icon: HomeIcon, hi: "आज", en: "Today" },
  { path: "/farmer/prices", icon: ShowChartIcon, hi: "भाव", en: "Prices" },
  {
    path: "/farmer/sell",
    icon: AgricultureIcon,
    hi: "बेचें",
    en: "Sell",
    raised: true,
  },
  { path: "/farmer/deals", icon: HandshakeIcon, hi: "सौदे", en: "Deals" },
  { path: "/farmer/me", icon: PersonIcon, hi: "मेरा", en: "Me" },
]

export default function FarmerShell() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()

  const currentTab = TABS.findIndex(
    (t) =>
      t.path === location.pathname ||
      location.pathname.startsWith(t.path + "/"),
  )

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFFBF5",
        display: "flex",
        flexDirection: "column",
        maxWidth: 390,
        mx: "auto",
        position: "relative",
      }}
    >
      <Box sx={{ flex: 1, overflowY: "auto", pb: "80px" }}>
        <Outlet />
      </Box>

      <BalveerFAB bottomOffset={90} />

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 390,
          bgcolor: "#FFFFFF",
          borderTop: "1px solid #F3E8D0",
          zIndex: 1200,
        }}
      >
        <BottomNavigation
          value={currentTab}
          onChange={(_, v) => navigate(TABS[v].path)}
          showLabels
          sx={{ bgcolor: "#FFFFFF", height: 70 }}
        >
          {TABS.map((tab, i) => {
            const Icon = tab.icon
            const isRaised = tab.raised
            const isActive = currentTab === i
            return (
              <BottomNavigationAction
                key={tab.path}
                value={i}
                label={lang === "hi" ? tab.hi : tab.en}
                icon={
                  isRaised ? (
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        bgcolor: "#F5A524",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(245,165,36,0.4)",
                        mt: -2,
                      }}
                    >
                      <Icon sx={{ color: "#1F2937", fontSize: 26 }} />
                    </Box>
                  ) : (
                    <Icon sx={{ color: isActive ? "#F5A524" : "#6B7280" }} />
                  )
                }
                sx={{
                  minWidth: 0,
                  color: isActive ? "#F5A524" : "#6B7280",
                  "&.Mui-selected": { color: "#F5A524" },
                  "& .MuiBottomNavigationAction-label": {
                    fontSize: lang === "hi" ? "0.7rem" : "0.65rem",
                    color: isActive ? "#F5A524" : "#6B7280",
                    fontWeight: isActive ? 700 : 400,
                    opacity: 1,
                  },
                  "&.Mui-selected .MuiBottomNavigationAction-label": {
                    color: "#F5A524",
                    fontWeight: 700,
                    opacity: 1,
                  },
                }}
              />
            )
          })}
        </BottomNavigation>
      </Box>
    </Box>
  )
}
