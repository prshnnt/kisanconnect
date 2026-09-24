import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Chip from "@mui/material/Chip"
import Button from "@mui/material/Button"
import LocalOfferIcon from "@mui/icons-material/LocalOffer"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import VerifiedBadge from "../../components/VerifiedBadge.jsx"
import { formatINR } from "../../utils/format.js"

const MOCK_OFFERS = [
  {
    id: 1,
    seller: "Ramesh Kumar",
    verified: true,
    crop: "Wheat",
    qty: 25,
    price: 2380,
    status: "pending",
    date: "Sep 23",
  },
  {
    id: 2,
    seller: "Suresh Yadav",
    verified: true,
    crop: "Potato",
    qty: 40,
    price: 1150,
    status: "accepted",
    date: "Sep 20",
  },
  {
    id: 3,
    seller: "Mohan Singh",
    verified: false,
    crop: "Rice",
    qty: 60,
    price: 3150,
    status: "rejected",
    date: "Sep 18",
  },
]

const STATUS_STYLE = {
  pending: { bg: "#FEF3C7", color: "#B45309", hi: "लंबित", en: "Pending" },
  accepted: { bg: "#D1FAE5", color: "#15803D", hi: "स्वीकृत", en: "Accepted" },
  rejected: { bg: "#FEE2E2", color: "#B91C1C", hi: "अस्वीकृत", en: "Rejected" },
}

export default function B7MyOffers() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)

  const filterMap = ["pending", "accepted", "rejected"]
  const filtered = MOCK_OFFERS.filter((o) => o.status === filterMap[tab])

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "मेरे ऑफर" : "My offers"} />

      <Box sx={{ px: 2, py: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{ mb: 1.5 }}
        >
          <Tab label={lang === "hi" ? "लंबित" : "Pending"} />
          <Tab label={lang === "hi" ? "स्वीकृत" : "Accepted"} />
          <Tab label={lang === "hi" ? "अस्वीकृत" : "Rejected"} />
        </Tabs>

        {filtered.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <LocalOfferIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 1 }} />
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
              {lang === "hi" ? "यहाँ कोई ऑफर नहीं है" : "No offers here"}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/buyer/find")}
            >
              {lang === "hi" ? "सप्लाई खोजें" : "Find supply"}
            </Button>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered.map((o) => {
            const s = STATUS_STYLE[o.status]
            return (
              <Card
                key={o.id}
                sx={{ cursor: o.status === "accepted" ? "pointer" : "default" }}
                onClick={() =>
                  o.status === "accepted" && navigate("/buyer/deals")
                }
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {o.seller}
                      </Typography>
                      {o.verified && <VerifiedBadge />}
                    </Box>
                    <Chip
                      label={lang === "hi" ? s.hi : s.en}
                      size="small"
                      sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    {o.crop} · {o.qty} qtl · {o.date}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {formatINR(o.price)}/qtl
                  </Typography>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
