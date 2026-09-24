import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Chip from "@mui/material/Chip"
import HandshakeIcon from "@mui/icons-material/Handshake"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import { formatINR } from "../../utils/format.js"

const MOCK_DEALS = [
  {
    id: 101,
    seller: "Ramesh Kumar",
    crop: "Wheat",
    qty: 25,
    total: 60250,
    status: "payment_due",
    date: "Sep 22",
  },
  {
    id: 102,
    seller: "Suresh Yadav",
    crop: "Potato",
    qty: 40,
    total: 46000,
    status: "in_transit",
    date: "Sep 20",
  },
  {
    id: 103,
    seller: "Mohan Singh",
    crop: "Rice",
    qty: 60,
    total: 189000,
    status: "completed",
    date: "Sep 12",
  },
]

const STATUS_STYLE = {
  payment_due: {
    bg: "#FEE2E2",
    color: "#B91C1C",
    hi: "भुगतान बकाया",
    en: "Payment due",
  },
  in_transit: {
    bg: "#FEF3C7",
    color: "#B45309",
    hi: "ट्रांजिट में",
    en: "In transit",
  },
  completed: { bg: "#D1FAE5", color: "#15803D", hi: "पूर्ण", en: "Completed" },
}

export default function B8DealsList() {
  const { lang } = useLang()
  const navigate = useNavigate()

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "मेरे सौदे" : "My deals"} />

      <Box sx={{ px: 2, py: 2 }}>
        {MOCK_DEALS.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <HandshakeIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 1 }} />
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              {lang === "hi" ? "अभी तक कोई सौदा नहीं" : "No deals yet"}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {MOCK_DEALS.map((d) => {
            const s = STATUS_STYLE[d.status]
            return (
              <Card
                key={d.id}
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/buyer/deal/${d.id}`)}
              >
                <CardContent
                  sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {d.seller}
                      </Typography>
                      <Chip
                        label={lang === "hi" ? s.hi : s.en}
                        size="small"
                        sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      {d.crop} · {d.qty} qtl · {d.date}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, mt: 0.5 }}
                    >
                      {formatINR(d.total)}
                    </Typography>
                  </Box>
                  <ChevronRightIcon sx={{ color: "#9CA3AF" }} />
                </CardContent>
              </Card>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
