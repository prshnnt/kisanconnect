import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Divider from "@mui/material/Divider"
import Chip from "@mui/material/Chip"
import ScaleIcon from "@mui/icons-material/Scale"
import ScienceIcon from "@mui/icons-material/Science"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import WarehouseIcon from "@mui/icons-material/Warehouse"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import { formatINR } from "../../utils/format.js"

const SERVICE_ICONS = {
  weighing: ScaleIcon,
  testing: ScienceIcon,
  transport: LocalShippingIcon,
  storage: WarehouseIcon,
}
const SERVICE_COLORS = {
  weighing: "#3730A3",
  testing: "#15803D",
  transport: "#B45309",
  storage: "#1D4ED8",
}

const MOCK_PAYOUTS = [
  {
    id: 1,
    type: "weighing",
    customer: "Ramesh Kumar",
    date: "Sep 20",
    amount: 375,
    status: "paid",
  },
  {
    id: 2,
    type: "testing",
    customer: "Green Mills Ltd",
    date: "Sep 18",
    amount: 500,
    status: "paid",
  },
  {
    id: 3,
    type: "transport",
    customer: "Suresh Yadav",
    date: "Sep 24",
    amount: 1200,
    status: "pending",
  },
  {
    id: 4,
    type: "storage",
    customer: "FPO Ganga",
    date: "Sep 23",
    amount: 640,
    status: "pending",
  },
]

export default function S5Earnings() {
  const { lang } = useLang()
  const [tab, setTab] = useState(0)

  const filtered = MOCK_PAYOUTS.filter((p) =>
    tab === 0 ? p.status === "pending" : p.status === "paid",
  )
  const pendingTotal = MOCK_PAYOUTS.filter(
    (p) => p.status === "pending",
  ).reduce((s, p) => s + p.amount, 0)
  const paidTotal = MOCK_PAYOUTS.filter((p) => p.status === "paid").reduce(
    (s, p) => s + p.amount,
    0,
  )

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "कमाई" : "Earnings"} />

      <Box sx={{ px: 2, py: 2 }}>
        <Card sx={{ mb: 2, bgcolor: "#15803D" }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AccountBalanceWalletIcon sx={{ color: "#fff", fontSize: 32 }} />
            <Box>
              <Typography variant="caption" sx={{ color: "#D1FAE5" }}>
                {lang === "hi"
                  ? "कुल कमाई (इस महीने)"
                  : "Total earnings (this month)"}
              </Typography>
              <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
                {formatINR(pendingTotal + paidTotal)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi" ? "लंबित" : "Pending"}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#B45309" }}
              >
                {formatINR(pendingTotal)}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi" ? "भुगतान हुआ" : "Paid out"}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#15803D" }}
              >
                {formatINR(paidTotal)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{ mb: 1.5 }}
        >
          <Tab label={lang === "hi" ? "लंबित" : "Pending"} />
          <Tab label={lang === "hi" ? "इतिहास" : "History"} />
        </Tabs>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {filtered.length === 0 && (
            <Typography
              variant="body2"
              sx={{ color: "#6B7280", textAlign: "center", py: 4 }}
            >
              {lang === "hi" ? "कोई रिकॉर्ड नहीं" : "No records here"}
            </Typography>
          )}
          {filtered.map((p) => {
            const Icon = SERVICE_ICONS[p.type]
            return (
              <Card key={p.id}>
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1.5,
                    "&:last-child": { pb: 1.5 },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: `${SERVICE_COLORS[p.type]}1A`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      sx={{ color: SERVICE_COLORS[p.type], fontSize: 20 }}
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {p.customer}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      {p.date}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatINR(p.amount)}
                    </Typography>
                    <Chip
                      size="small"
                      label={
                        p.status === "paid"
                          ? lang === "hi"
                            ? "भुगतान हुआ"
                            : "Paid"
                          : lang === "hi"
                            ? "लंबित"
                            : "Pending"
                      }
                      sx={{
                        height: 18,
                        fontSize: 10,
                        bgcolor: p.status === "paid" ? "#D1FAE5" : "#FEF3C7",
                        color: p.status === "paid" ? "#15803D" : "#B45309",
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
