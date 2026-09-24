import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Divider from "@mui/material/Divider"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import { useNavigate, useLocation } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import VerifiedBadge from "../../components/VerifiedBadge.jsx"
import { formatINR } from "../../utils/format.js"

const FALLBACK_LOT = {
  id: 0,
  seller: "Ramesh Kumar (Farmer)",
  verified: true,
  trust: 4,
  crop: "Wheat",
  qty: 25,
  grade: "A",
  price: 2380,
  km: 24,
}

export default function B5MakeOffer() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const lot = location.state?.lot || FALLBACK_LOT

  const [price, setPrice] = useState(String(lot.price))
  const [qty, setQty] = useState(String(lot.qty))
  const [payment, setPayment] = useState("full")
  const [sent, setSent] = useState(false)

  const total = (Number(price) || 0) * (Number(qty) || 0)

  if (sent) {
    return (
      <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
        <TopBar title={lang === "hi" ? "ऑफर भेजा गया" : "Offer sent"} />
        <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === "hi" ? "ऑफर भेज दिया गया! 🎉" : "Offer sent! 🎉"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mb: 4 }}>
            {lang === "hi"
              ? `${lot.seller} को ${formatINR(Number(price))}/qtl का ऑफर भेजा गया है`
              : `Your offer of ${formatINR(Number(price))}/qtl was sent to ${lot.seller}`}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: 56 }}
            onClick={() => navigate("/buyer/offers")}
          >
            {lang === "hi" ? "मेरे ऑफर देखें" : "View my offers"}
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "ऑफर करें" : "Make an offer"} />

      <Box sx={{ px: 2, py: 2 }}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {lot.seller}
              </Typography>
              {lot.verified && <VerifiedBadge />}
            </Box>
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              {lot.crop} · Grade {lot.grade} · {lot.qty} qtl available ·{" "}
              {lot.km} km
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              {lang === "hi" ? "सूचीबद्ध मूल्य" : "Listed price"}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatINR(lot.price)}/qtl
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {lang === "hi" ? "आपका ऑफर मूल्य (₹/qtl)" : "Your offer price (₹/qtl)"}
        </Typography>
        <TextField
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          sx={{ mb: 2 }}
          inputProps={{ inputMode: "numeric" }}
        />

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {lang === "hi" ? "मात्रा (qtl)" : "Quantity (qtl)"}
        </Typography>
        <TextField
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          sx={{ mb: 2 }}
          inputProps={{ inputMode: "numeric", max: lot.qty }}
          helperText={
            lang === "hi"
              ? `अधिकतम ${lot.qty} qtl उपलब्ध`
              : `Max ${lot.qty} qtl available`
          }
        />

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          {lang === "hi" ? "भुगतान शर्तें" : "Payment terms"}
        </Typography>
        <ToggleButtonGroup
          value={payment}
          exclusive
          onChange={(_, v) => v && setPayment(v)}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="full">
            {lang === "hi" ? "पूर्ण अग्रिम" : "Full advance"}
          </ToggleButton>
          <ToggleButton value="partial">
            {lang === "hi" ? "आंशिक अग्रिम" : "Partial advance"}
          </ToggleButton>
          <ToggleButton value="delivery">
            {lang === "hi" ? "डिलीवरी पर" : "On delivery"}
          </ToggleButton>
        </ToggleButtonGroup>

        <Card sx={{ mb: 3, bgcolor: "#FEF3C7", boxShadow: "none" }}>
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {lang === "hi" ? "कुल मूल्य" : "Total value"}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {formatINR(total)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ height: 56 }}
          disabled={!price || !qty}
          onClick={() => setSent(true)}
        >
          {lang === "hi" ? "ऑफर भेजें" : "Send offer"}
        </Button>
      </Box>
    </Box>
  )
}
