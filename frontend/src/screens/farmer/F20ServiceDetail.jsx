import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import WarehouseIcon from "@mui/icons-material/Warehouse"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import ScienceIcon from "@mui/icons-material/Science"
import ScaleIcon from "@mui/icons-material/Scale"
import StarIcon from "@mui/icons-material/Star"
import { useParams, useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import VerifiedBadge from "../../components/VerifiedBadge.jsx"
import BigStepper from "../../components/BigStepper.jsx"
import { formatINR } from "../../utils/format.js"

const SERVICE_INFO = {
  store: {
    icon: WarehouseIcon,
    hi: "भंडारण",
    en: "Store it",
    color: "#1D4ED8",
    bg: "#DBEAFE",
    unit: "qtl/day",
    rate: 4,
  },
  transport: {
    icon: LocalShippingIcon,
    hi: "परिवहन",
    en: "Move it",
    color: "#B45309",
    bg: "#FEF3C7",
    unit: "km",
    rate: 22,
  },
  test: {
    icon: ScienceIcon,
    hi: "जाँच",
    en: "Test it",
    color: "#15803D",
    bg: "#D1FAE5",
    unit: "sample",
    rate: 150,
  },
  weigh: {
    icon: ScaleIcon,
    hi: "तौल",
    en: "Weigh it",
    color: "#3730A3",
    bg: "#E0E7FF",
    unit: "qtl",
    rate: 8,
  },
}

const PROVIDERS = [
  { id: 1, name: "Shree Balaji Warehouse", rating: 4.6, jobs: 214, km: 6 },
  { id: 2, name: "Kisan Cold Store", rating: 4.4, jobs: 98, km: 11 },
  { id: 3, name: "Anand Logistics", rating: 4.8, jobs: 340, km: 15 },
]

export default function F20ServiceDetail() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const { serviceId } = useParams()
  const info = SERVICE_INFO[serviceId] || SERVICE_INFO.store
  const Icon = info.icon

  const [qty, setQty] = useState(10)
  const [providerId, setProviderId] = useState(PROVIDERS[0].id)
  const [booked, setBooked] = useState(false)

  const provider = PROVIDERS.find((p) => p.id === providerId)
  const total = qty * info.rate

  if (booked) {
    return (
      <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
        <TopBar title={lang === "hi" ? "बुक हो गया" : "Booked"} />
        <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === "hi" ? "सेवा बुक हो गई! ✅" : "Service booked! ✅"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mb: 4 }}>
            {lang === "hi"
              ? `${provider.name} जल्द ही आपसे संपर्क करेंगे`
              : `${provider.name} will contact you shortly`}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: 56 }}
            onClick={() => navigate("/farmer")}
          >
            {lang === "hi" ? "होम पर जाएं" : "Go home"}
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? info.hi : info.en} />

      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: info.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: info.color, fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {lang === "hi" ? info.hi : info.en}
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              {lang === "hi"
                ? `₹${info.rate}/${info.unit} से शुरू`
                : `From ₹${info.rate}/${info.unit}`}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{ fontWeight: 600, mb: 1.5, textAlign: "center" }}
        >
          {lang === "hi" ? "कितनी मात्रा?" : "How much?"}
        </Typography>
        <BigStepper
          value={qty}
          onChange={setQty}
          unit={info.unit.split("/")[0]}
          min={1}
          max={500}
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1" sx={{ fontWeight: 700, mb: 1.5 }}>
          {lang === "hi" ? "सेवा प्रदाता चुनें" : "Choose a provider"}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
          {PROVIDERS.map((p) => (
            <Card
              key={p.id}
              onClick={() => setProviderId(p.id)}
              sx={{
                cursor: "pointer",
                border:
                  providerId === p.id
                    ? "2px solid #F5A524"
                    : "1px solid transparent",
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1.5,
                  "&:last-child": { pb: 1.5 },
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {p.name}
                    </Typography>
                    <VerifiedBadge />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 0.25,
                    }}
                  >
                    <StarIcon sx={{ fontSize: 14, color: "#F5A524" }} />
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      {p.rating} · {p.jobs} {lang === "hi" ? "काम" : "jobs"} ·{" "}
                      {p.km} km
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={
                    providerId === p.id
                      ? lang === "hi"
                        ? "चयनित"
                        : "Selected"
                      : lang === "hi"
                        ? "चुनें"
                        : "Select"
                  }
                  size="small"
                  color={providerId === p.id ? "primary" : "default"}
                  variant={providerId === p.id ? "filled" : "outlined"}
                />
              </CardContent>
            </Card>
          ))}
        </Box>

        <Card sx={{ mb: 3, bgcolor: "#FEF3C7", boxShadow: "none" }}>
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {lang === "hi" ? "अनुमानित लागत" : "Estimated cost"}
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
          onClick={() => setBooked(true)}
        >
          {lang === "hi" ? "बुक करें" : "Book service"}
        </Button>
      </Box>
    </Box>
  )
}
