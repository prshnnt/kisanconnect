import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Grid from "@mui/material/Grid"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import AgricultureIcon from "@mui/icons-material/Agriculture"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import LocalOfferIcon from "@mui/icons-material/LocalOffer"
import WarehouseIcon from "@mui/icons-material/Warehouse"
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import { useAuth } from "../../contexts/AuthContext.jsx"
import { formatINR } from "../../utils/format.js"
import TopBar from "../../components/TopBar.jsx"
import StatusPill from "../../components/StatusPill.jsx"

const CROPS = ["गेहूं", "आलू", "चावल", "मक्का", "सरसों"]
const CROPS_EN = ["Wheat", "Potato", "Rice", "Maize", "Mustard"]

const MOCK_LOTS = [
  { id: 1, crop: "Wheat", qty: 25, status: "live", bestOffer: 2410 },
  { id: 2, crop: "Potato", qty: 10, status: "draft", bestOffer: null },
]

export default function F1Today() {
  const { lang } = useLang()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedCrop, setSelectedCrop] = React.useState(0)

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title="KisanConnect" />

      <Box sx={{ px: 2, py: 2 }}>
        {/* Greeting */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {lang === "hi"
            ? `नमस्ते, ${user?.name || "किसान"}!`
            : `Hello, ${user?.name || "Farmer"}!`}
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
          {lang === "hi" ? "आज क्या करना है?" : "What's on today?"}
        </Typography>

        {/* Crop chips */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            pb: 1,
            mb: 2,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {(lang === "hi" ? CROPS : CROPS_EN).map((crop, i) => (
            <Chip
              key={i}
              label={crop}
              onClick={() => setSelectedCrop(i)}
              color={selectedCrop === i ? "primary" : "default"}
              variant={selectedCrop === i ? "filled" : "outlined"}
              sx={{ flexShrink: 0, fontWeight: 600 }}
            />
          ))}
        </Box>

        {/* Best price card */}
        <Card sx={{ mb: 2, bgcolor: "#15803D", color: "#FFFFFF" }}>
          <CardContent>
            <Typography
              variant="caption"
              sx={{ color: "#BBF7D0", fontWeight: 600 }}
            >
              {lang === "hi"
                ? "आज आपके लिए सबसे अच्छी कीमत"
                : "Best price for you today"}
            </Typography>
            <Typography
              sx={{
                fontSize: "2rem",
                fontWeight: 700,
                mt: 0.5,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              ₹2,410/qtl
            </Typography>
            <Typography variant="body2" sx={{ color: "#BBF7D0", mt: 0.5 }}>
              {lang === "hi"
                ? "लखनऊ मंडी · 24 km दूर"
                : "Lucknow Mandi · 24 km away"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#BBF7D0" }}>
              {lang === "hi" ? "परिवहन के बाद" : "After transport cost"} · sample
            </Typography>
          </CardContent>
        </Card>

        {/* Should I sell */}
        <Card sx={{ mb: 2, border: "1px solid #FEF3C7", bgcolor: "#FFFBEB" }}>
          <CardContent
            sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "#15803D",
                flexShrink: 0,
                mt: 0.5,
              }}
            />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {lang === "hi"
                  ? "अभी बेचें — कीमतें अच्छी हैं"
                  : "Sell now — prices are good"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi"
                  ? "पिछले 7 दिनों में 4% वृद्धि हुई"
                  : "Prices rose 4% in last 7 days"}{" "}
                · sample
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* My lots */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === "hi" ? "मेरी लॉट" : "My lots"}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            overflowX: "auto",
            pb: 1,
            mb: 2,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {MOCK_LOTS.map((lot) => (
            <Card
              key={lot.id}
              sx={{ minWidth: 160, flexShrink: 0, cursor: "pointer" }}
              onClick={() => navigate("/farmer/lots")}
            >
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <StatusPill
                  status={lot.status}
                  label={
                    lang === "hi"
                      ? lot.status === "live"
                        ? "सक्रिय"
                        : "ड्राफ्ट"
                      : lot.status
                  }
                />
                <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {lot.crop}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  {lot.qty} qtl
                </Typography>
                {lot.bestOffer && (
                  <Typography
                    variant="body2"
                    sx={{ color: "#15803D", fontWeight: 600, mt: 0.5 }}
                  >
                    {formatINR(lot.bestOffer)}/qtl
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
          <Card
            sx={{
              minWidth: 120,
              flexShrink: 0,
              border: "2px dashed #E5E7EB",
              bgcolor: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => navigate("/farmer/sell")}
          >
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="caption"
                sx={{ color: "#3730A3", fontWeight: 600 }}
              >
                {lang === "hi" ? "+ नई लॉट" : "+ New lot"}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Offers waiting */}
        <Card
          sx={{ mb: 2, cursor: "pointer" }}
          onClick={() => navigate("/farmer/lots")}
        >
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              py: 1.5,
              "&:last-child": { pb: 1.5 },
            }}
          >
            <LocalOfferIcon sx={{ color: "#3730A3", fontSize: 28 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {lang === "hi" ? "प्रतीक्षारत ऑफर" : "Offers waiting"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi" ? "3 नए ऑफर मिले हैं" : "3 new offers received"} ·
                sample
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#3730A3" }}>
              3
            </Typography>
          </CardContent>
        </Card>

        {/* Money */}
        <Card sx={{ mb: 3, bgcolor: "#1D4ED8", color: "#FFFFFF" }}>
          <CardContent>
            <Typography
              variant="caption"
              sx={{ color: "#BFDBFE", fontWeight: 600 }}
            >
              {lang === "hi" ? "मिलने वाला पैसा" : "Money you will receive"}
            </Typography>
            <Typography
              sx={{
                fontSize: "2rem",
                fontWeight: 700,
                mt: 0.5,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              ₹8,510
            </Typography>
            <Typography variant="body2" sx={{ color: "#BFDBFE" }}>
              {lang === "hi"
                ? "अगले 3 दिनों में बैंक में आएगा"
                : "Expected in your bank in 3 days"}{" "}
              · sample
            </Typography>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          {lang === "hi" ? "जल्दी करें" : "Quick actions"}
        </Typography>
        <Grid container spacing={1.5}>
          {[
            {
              icon: AgricultureIcon,
              hi: "बेचें",
              en: "Sell",
              path: "/farmer/sell",
              color: "#15803D",
            },
            {
              icon: TrendingUpIcon,
              hi: "भाव",
              en: "Prices",
              path: "/farmer/prices",
              color: "#3730A3",
            },
            {
              icon: WarehouseIcon,
              hi: "भंडारण",
              en: "Store",
              path: "/farmer/services",
              color: "#1D4ED8",
            },
            {
              icon: HelpOutlineIcon,
              hi: "मदद",
              en: "Help",
              path: "/farmer/me",
              color: "#6B7280",
            },
          ].map((action) => {
            const Icon = action.icon
            return (
              <Grid item xs={3} key={action.en}>
                <Card
                  sx={{ cursor: "pointer", textAlign: "center" }}
                  onClick={() => navigate(action.path)}
                >
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: `${action.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 0.5,
                      }}
                    >
                      <Icon sx={{ color: action.color, fontSize: 22 }} />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        fontSize: lang === "hi" ? "0.7rem" : "0.65rem",
                      }}
                    >
                      {lang === "hi" ? action.hi : action.en}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Box>
  )
}
