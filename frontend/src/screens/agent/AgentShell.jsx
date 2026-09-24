import React from "react"
import Box from "@mui/material/Box"
import BottomNavigation from "@mui/material/BottomNavigation"
import BottomNavigationAction from "@mui/material/BottomNavigationAction"
import TodayIcon from "@mui/icons-material/Today"
import PeopleIcon from "@mui/icons-material/People"
import AgricultureIcon from "@mui/icons-material/Agriculture"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import PersonIcon from "@mui/icons-material/Person"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"

const TABS = [
  { path: "/agent", icon: TodayIcon, hi: "आज", en: "Today" },
  { path: "/agent/farmers", icon: PeopleIcon, hi: "किसान", en: "Farmers" },
  { path: "/agent/lots", icon: AgricultureIcon, hi: "लॉट", en: "Lots" },
  {
    path: "/agent/money",
    icon: AccountBalanceWalletIcon,
    hi: "पैसा",
    en: "Money",
  },
  { path: "/agent/me", icon: PersonIcon, hi: "मेरा", en: "Me" },
]

export default function AgentShell() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const currentTab = TABS.findIndex(
    (t) =>
      location.pathname === t.path ||
      location.pathname.startsWith(t.path + "/"),
  )

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFFBF5",
        maxWidth: 390,
        mx: "auto",
        position: "relative",
      }}
    >
      <Box sx={{ pb: "80px" }}>
        <Outlet />
      </Box>
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
          sx={{ height: 70 }}
        >
          {TABS.map((tab, i) => {
            const Icon = tab.icon
            const isActive = currentTab === i
            return (
              <BottomNavigationAction
                key={tab.path}
                value={i}
                label={lang === "hi" ? tab.hi : tab.en}
                icon={<Icon sx={{ color: isActive ? "#F5A524" : "#6B7280" }} />}
                sx={{
                  minWidth: 0,
                  color: isActive ? "#F5A524" : "#6B7280",
                  "&.Mui-selected": { color: "#F5A524" },
                  "& .MuiBottomNavigationAction-label": {
                    fontSize: "0.65rem",
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
