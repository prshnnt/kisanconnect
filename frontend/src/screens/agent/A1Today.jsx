import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import { formatINR } from "../../utils/format.js"

export default function A1Today() {
  const { lang } = useLang()
  const navigate = useNavigate()

  return (
    <Box sx={{ bgcolor: "#FFFBF5" }}>
      <TopBar title={lang === "hi" ? "आज" : "Today"} />
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {lang === "hi" ? "नमस्ते, एजेंट!" : "Hello, Agent!"}
        </Typography>

        {/* Commission earned */}
        <Card sx={{ mb: 2, bgcolor: "#15803D", color: "#FFFFFF" }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: "#BBF7D0" }}>
              {lang === "hi" ? "इस सप्ताह कमीशन" : "Commission earned this week"}
            </Typography>
            <Typography
              sx={{
                fontSize: "2rem",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatINR(12450)}
            </Typography>
            <Typography variant="caption" sx={{ color: "#BBF7D0" }}>
              sample
            </Typography>
          </CardContent>
        </Card>

        {/* Lots arriving today */}
        <Card
          sx={{ mb: 2, cursor: "pointer" }}
          onClick={() => navigate("/agent/lots")}
        >
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {lang === "hi" ? "आज आने वाली लॉट" : "Lots arriving today"}
            </Typography>
            <Typography
              sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#3730A3" }}
            >
              3
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              sample
            </Typography>
          </CardContent>
        </Card>

        {/* Auctions ending soon */}
        <Card
          sx={{ mb: 2, cursor: "pointer" }}
          onClick={() => navigate("/agent/lots")}
        >
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {lang === "hi"
                ? "जल्द समाप्त होने वाली बोली"
                : "Auctions ending soon"}
            </Typography>
            <Typography
              sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#B45309" }}
            >
              2
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              sample
            </Typography>
          </CardContent>
        </Card>

        {/* Payouts pending */}
        <Card
          sx={{ mb: 2, cursor: "pointer" }}
          onClick={() => navigate("/agent/money")}
        >
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {lang === "hi" ? "भुगतान लंबित" : "Payouts pending"}
            </Typography>
            <Typography
              sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#1D4ED8" }}
            >
              {formatINR(24750)}
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              sample
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
