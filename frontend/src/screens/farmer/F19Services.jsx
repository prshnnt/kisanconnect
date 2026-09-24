import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import WarehouseIcon from "@mui/icons-material/Warehouse"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import ScienceIcon from "@mui/icons-material/Science"
import ScaleIcon from "@mui/icons-material/Scale"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"

const SERVICES = [
  {
    id: "store",
    icon: WarehouseIcon,
    hi: "भंडारण",
    en: "Store it",
    descHi: "गोदाम, कोल्ड स्टोर",
    descEn: "Warehouses and cold stores",
    color: "#1D4ED8",
    bg: "#DBEAFE",
  },
  {
    id: "transport",
    icon: LocalShippingIcon,
    hi: "परिवहन",
    en: "Move it",
    descHi: "ट्रक और टेम्पो बुक करें",
    descEn: "Book trucks and tempos",
    color: "#B45309",
    bg: "#FEF3C7",
  },
  {
    id: "test",
    icon: ScienceIcon,
    hi: "जाँच",
    en: "Test it",
    descHi: "नमी और गुणवत्ता जाँच",
    descEn: "Moisture and quality testing",
    color: "#15803D",
    bg: "#D1FAE5",
  },
  {
    id: "weigh",
    icon: ScaleIcon,
    hi: "तौल",
    en: "Weigh it",
    descHi: "तौल सेवाएं बुक करें",
    descEn: "Book weighbridge services",
    color: "#3730A3",
    bg: "#E0E7FF",
  },
]

export default function F19Services() {
  const { lang } = useLang()
  const navigate = useNavigate()

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "मदद चाहिए?" : "Help me with..."} />

      <Box sx={{ px: 2, py: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === "hi" ? "आपको क्या चाहिए?" : "What do you need?"}
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
          {lang === "hi" ? "विश्वसनीय सेवाएं, पास में" : "Trusted services near you"}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <Card
                key={service.id}
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/farmer/services/${service.id}`)}
              >
                <CardActionArea>
                  <CardContent
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      py: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: service.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ color: service.color, fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {lang === "hi" ? service.hi : service.en}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6B7280" }}>
                        {lang === "hi" ? service.descHi : service.descEn}
                      </Typography>
                    </Box>
                    <ChevronRightIcon sx={{ color: "#9CA3AF" }} />
                  </CardContent>
                </CardActionArea>
              </Card>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
