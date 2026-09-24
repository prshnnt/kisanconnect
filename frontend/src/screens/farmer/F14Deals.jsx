import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import HandshakeIcon from "@mui/icons-material/Handshake"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import StatusPill from "../../components/StatusPill.jsx"
import EmptyState from "../../components/EmptyState.jsx"
import { formatINR } from "../../utils/format.js"

const MOCK_DEALS = [
  {
    id: 1,
    crop: "Wheat",
    cropHi: "गेहूं",
    qty: 25,
    buyer: "Green Mills Ltd",
    price: 2410,
    step: "Pickup arranged",
    status: "progress",
  },
  {
    id: 2,
    crop: "Potato",
    cropHi: "आलू",
    qty: 10,
    buyer: "Sharma Traders",
    price: 1180,
    step: "Agreed",
    status: "progress",
  },
  {
    id: 3,
    crop: "Rice",
    cropHi: "चावल",
    qty: 50,
    buyer: "Agro Foods",
    price: 3200,
    step: "Paid",
    status: "done",
  },
]

export default function F14Deals() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)

  const tabDeals = [
    MOCK_DEALS.filter((d) => d.status === "progress"),
    MOCK_DEALS.filter((d) => d.status === "done"),
    [],
  ]

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "मेरे सौदे" : "My deals"} />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ px: 2, borderBottom: "1px solid #F3E8D0", bgcolor: "#FFFFFF" }}
      >
        <Tab label={lang === "hi" ? "जारी" : "In progress"} />
        <Tab label={lang === "hi" ? "पूरे" : "Done"} />
        <Tab label={lang === "hi" ? "समस्याएं" : "Problems"} />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {tabDeals[tab].length === 0 ? (
          <EmptyState
            icon={HandshakeIcon}
            title={lang === "hi" ? "कोई सौदा नहीं" : "No deals here"}
            description={
              lang === "hi" ? "अभी तक कोई सौदा नहीं हुआ" : "Nothing here yet"
            }
          />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {tabDeals[tab].map((deal) => (
              <Card
                key={deal.id}
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/farmer/deal/${deal.id}`)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {lang === "hi" ? deal.cropHi : deal.crop} · {deal.qty} qtl
                    </Typography>
                    <StatusPill
                      status={deal.status}
                      label={
                        lang === "hi"
                          ? deal.status === "progress"
                            ? "जारी"
                            : "पूरा"
                          : deal.status
                      }
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#6B7280", mb: 0.5 }}
                  >
                    {deal.buyer}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#1F2937" }}
                    >
                      {formatINR(deal.price)}/qtl
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#3730A3", fontWeight: 600 }}
                    >
                      📍 {lang === "hi" ? "अभी: " : "Now: "}
                      {deal.step}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
