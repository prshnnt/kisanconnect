import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import DownloadIcon from "@mui/icons-material/Download"
import { useState } from "react"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import StatusPill from "../../components/StatusPill.jsx"
import { formatINR } from "../../utils/format.js"

const MOCK_EARNINGS = [
  {
    id: 1,
    deal: "Wheat – Green Mills",
    farmer: "Ramesh Kumar",
    commission: 1506,
    status: "paid",
  },
  {
    id: 2,
    deal: "Potato – Sharma Traders",
    farmer: "Suresh Yadav",
    commission: 590,
    status: "pending",
  },
  {
    id: 3,
    deal: "Rice – Agro Foods",
    farmer: "Mohan Singh",
    commission: 4000,
    status: "pending",
  },
]

export default function A5Money() {
  const { lang } = useLang()
  const [tab, setTab] = useState(0)
  const pending = MOCK_EARNINGS.filter((e) => e.status === "pending").reduce(
    (s, e) => s + e.commission,
    0,
  )
  const paid = MOCK_EARNINGS.filter((e) => e.status === "paid").reduce(
    (s, e) => s + e.commission,
    0,
  )

  function exportCSV() {
    const rows = [
      ["Deal", "Farmer", "Commission", "Status"],
      ...MOCK_EARNINGS.map((e) => [e.deal, e.farmer, e.commission, e.status]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "agent-earnings.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "पैसा" : "Money"} />
      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Card
            sx={{ flex: 1, bgcolor: "#FEF3C7", border: "1px solid #FCD34D" }}
          >
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="caption" sx={{ color: "#B45309" }}>
                {lang === "hi" ? "लंबित" : "Pending"}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#B45309" }}
              >
                {formatINR(pending)}
              </Typography>
            </CardContent>
          </Card>
          <Card
            sx={{ flex: 1, bgcolor: "#D1FAE5", border: "1px solid #86EFAC" }}
          >
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="caption" sx={{ color: "#166534" }}>
                {lang === "hi" ? "भुगतान हुआ" : "Paid"}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#15803D" }}
              >
                {formatINR(paid)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label={lang === "hi" ? "लंबित" : "Pending"} />
            <Tab label={lang === "hi" ? "भुगतान हुए" : "Paid"} />
          </Tabs>
          <Button
            startIcon={<DownloadIcon />}
            size="small"
            sx={{ color: "#3730A3" }}
            onClick={exportCSV}
          >
            {lang === "hi" ? "निर्यात" : "Export"}
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {MOCK_EARNINGS.filter((e) =>
            tab === 0 ? e.status === "pending" : e.status === "paid",
          ).map((e) => (
            <Card key={e.id}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {e.deal}
                  </Typography>
                  <StatusPill status={e.status} label={e.status} />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    {e.farmer}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#15803D" }}
                  >
                    {formatINR(e.commission)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
