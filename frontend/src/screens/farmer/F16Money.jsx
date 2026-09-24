import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Collapse from "@mui/material/Collapse"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import StatusPill from "../../components/StatusPill.jsx"
import { formatINR, maskAccount } from "../../utils/format.js"

const MOCK_PAYOUTS = [
  {
    id: 1,
    deal: "Wheat – Green Mills",
    amount: 60250,
    status: "waiting",
    bank: "7893",
    saleValue: 60250,
    commission: 1506,
    loading: 500,
    weighing: 375,
    receive: 57869,
  },
  {
    id: 2,
    deal: "Rice – Agro Foods",
    amount: 160000,
    status: "ready",
    bank: "7893",
    saleValue: 160000,
    commission: 4000,
    loading: 1000,
    weighing: 750,
    receive: 154250,
  },
  {
    id: 3,
    deal: "Maize – Bharat Grains",
    amount: 31500,
    status: "paid",
    bank: "7893",
    saleValue: 31500,
    commission: 787,
    loading: 300,
    weighing: 225,
    receive: 30188,
  },
]

export default function F16Money() {
  const { lang } = useLang()
  const [expanded, setExpanded] = useState(null)
  const total = MOCK_PAYOUTS.filter((p) => p.status !== "paid").reduce(
    (s, p) => s + p.receive,
    0,
  )

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "पैसा" : "Money"} />

      <Box sx={{ px: 2, py: 2 }}>
        {/* Big total */}
        <Card sx={{ mb: 3, bgcolor: "#1D4ED8", color: "#FFFFFF" }}>
          <CardContent>
            <Typography
              variant="caption"
              sx={{ color: "#BFDBFE", fontWeight: 600 }}
            >
              {lang === "hi" ? "मिलने वाला कुल पैसा" : "Total to receive"}
            </Typography>
            <Typography
              sx={{
                fontSize: "2.5rem",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatINR(total)}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <AccountBalanceIcon sx={{ fontSize: 16, color: "#BFDBFE" }} />
              <Typography variant="caption" sx={{ color: "#BFDBFE" }}>
                ••••{maskAccount("7893")} · sample
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Payout list */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          {lang === "hi" ? "भुगतान सूची" : "Payouts"}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {MOCK_PAYOUTS.map((p) => (
            <Card key={p.id}>
              <CardContent
                sx={{
                  cursor: "pointer",
                  py: 1.5,
                  "&:last-child": { pb: expanded === p.id ? 0 : 1.5 },
                }}
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {p.deal}
                  </Typography>
                  <StatusPill
                    status={p.status}
                    label={
                      lang === "hi"
                        ? p.status === "waiting"
                          ? "प्रतीक्षारत"
                          : p.status === "ready"
                            ? "तैयार"
                            : "भुगतान हुआ"
                        : p.status
                    }
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatINR(p.receive)}
                  </Typography>
                  {expanded === p.id ? (
                    <ExpandLessIcon sx={{ color: "#6B7280" }} />
                  ) : (
                    <ExpandMoreIcon sx={{ color: "#6B7280" }} />
                  )}
                </Box>
              </CardContent>

              <Collapse in={expanded === p.id}>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Divider sx={{ mb: 1.5 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "#6B7280",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    {lang === "hi"
                      ? "कम क्यों है ₹{formatINR(p.saleValue)} से?"
                      : `Why is it less than ${formatINR(p.saleValue)}?`}
                  </Typography>

                  {/* Stacked bar */}
                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      display: "flex",
                      mb: 1.5,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{ flex: p.receive / p.saleValue, bgcolor: "#15803D" }}
                    />
                    <Box
                      sx={{
                        flex: p.commission / p.saleValue,
                        bgcolor: "#F5A524",
                      }}
                    />
                    <Box
                      sx={{
                        flex: (p.loading + p.weighing) / p.saleValue,
                        bgcolor: "#E5E7EB",
                      }}
                    />
                  </Box>

                  {[
                    {
                      label: lang === "hi" ? "बिक्री मूल्य" : "Sale value",
                      val: p.saleValue,
                      color: "#1F2937",
                    },
                    {
                      label: lang === "hi" ? "एजेंट कमीशन" : "Agent commission",
                      val: -p.commission,
                      color: "#B45309",
                    },
                    {
                      label: lang === "hi" ? "लोडिंग शुल्क" : "Loading fee",
                      val: -p.loading,
                      color: "#6B7280",
                    },
                    {
                      label: lang === "hi" ? "तौल शुल्क" : "Weighing fee",
                      val: -p.weighing,
                      color: "#6B7280",
                    },
                  ].map((row, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        {row.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: row.color }}
                      >
                        {row.val < 0 ? "−" : ""}
                        {formatINR(Math.abs(row.val))}
                      </Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {lang === "hi" ? "आपको मिलेगा" : "You receive"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "#15803D" }}
                    >
                      {formatINR(p.receive)}
                    </Typography>
                  </Box>
                </Box>
              </Collapse>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
