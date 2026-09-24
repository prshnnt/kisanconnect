import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ShareIcon from "@mui/icons-material/Share"
import AgricultureIcon from "@mui/icons-material/Agriculture"
import { useNavigate, useLocation } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import { formatINR } from "../../utils/format.js"

export default function F10Review() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}
  const [published, setPublished] = useState(false)

  const details = [
    { labelHi: "फसल", labelEn: "Crop", value: state.crop || "Wheat" },
    { labelHi: "किस्म", labelEn: "Variety", value: state.variety || "Sharbati" },
    { labelHi: "मात्रा", labelEn: "Quantity", value: `${state.qty || 25} qtl` },
    { labelHi: "ग्रेड", labelEn: "Grade", value: `Grade ${state.grade || "A"}` },
    {
      labelHi: "न्यूनतम कीमत",
      labelEn: "Min. price",
      value: formatINR(state.minPrice || 2300) + "/qtl",
    },
    {
      labelHi: "बेचने का तरीका",
      labelEn: "Sell mode",
      value: state.mode === "bid" ? "Open bidding" : "Ask for offers",
    },
  ]

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar
        title={lang === "hi" ? "जांचें और प्रकाशित करें" : "Review & publish"}
      />

      <Box sx={{ px: 2, py: 2, pb: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === "hi" ? "सब कुछ ठीक है?" : "Everything looks good?"}
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
          {lang === "hi"
            ? "एक बार जांच लें, फिर प्रकाशित करें"
            : "Review once, then publish"}
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "#FEF3C7",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AgricultureIcon sx={{ color: "#F5A524", fontSize: 26 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {lang === "hi" ? "मेरी लॉट" : "My lot"} — sample
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {details.map((d) => (
              <Box
                key={d.labelEn}
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  {lang === "hi" ? d.labelHi : d.labelEn}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {d.value}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          sx={{
            color: "#6B7280",
            display: "block",
            textAlign: "center",
            mb: 2,
          }}
        >
          {lang === "hi"
            ? "प्रकाशित करने के बाद खरीदारों को सूचना मिलेगी"
            : "Buyers will be notified after publishing"}
        </Typography>
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 70,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 390,
          p: 2,
          bgcolor: "#FFFBF5",
          borderTop: "1px solid #F3E8D0",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.06)",
          zIndex: 1100,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => setPublished(true)}
        >
          {lang === "hi" ? "लॉट प्रकाशित करें" : "Publish lot"}
        </Button>
      </Box>

      <Dialog
        open={published}
        PaperProps={{ sx: { borderRadius: 3, mx: 2, maxWidth: 358 } }}
      >
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: "#15803D", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === "hi" ? "लॉट प्रकाशित हो गई!" : "Lot published!"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mb: 3 }}>
            {lang === "hi"
              ? "खरीदार जल्द ऑफर देंगे"
              : "Buyers will send offers soon"}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            fullWidth
            sx={{ mb: 1.5 }}
            component="a"
            href={`https://wa.me/?text=${encodeURIComponent(lang === "hi" ? "मैंने KisanConnect पर अपनी फसल की लॉट प्रकाशित की है। देखें!" : "I just published my crop lot on KisanConnect. Check it out!")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {lang === "hi" ? "WhatsApp पर शेयर करें" : "Share on WhatsApp"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate("/farmer/lots")}
          >
            {lang === "hi" ? "मेरी लॉट देखें" : "View my lots"}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
