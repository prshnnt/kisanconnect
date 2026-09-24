import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import IconButton from "@mui/material/IconButton"
import VolumeUpIcon from "@mui/icons-material/VolumeUp"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"

export default function X1Language() {
  const { setLang } = useLang()
  const navigate = useNavigate()

  function pick(lang) {
    setLang(lang)
    navigate("/user-type")
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFFBF5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <IconButton aria-label="Read aloud">
          <VolumeUpIcon sx={{ color: "#3730A3" }} />
        </IconButton>
      </Box>

      <Box sx={{ width: "100%", maxWidth: 390, textAlign: "center" }}>
        <Typography
          sx={{
            fontSize: "2.5rem",
            fontWeight: 900,
            color: "#F5A524",
            mb: 0.5,
          }}
        >
          KisanConnect
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 4 }}>
          किसान का साथी · Farmer's companion
        </Typography>

        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 1, color: "#1F2937" }}
        >
          भाषा चुनें
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mb: 4 }}>
          Choose your language
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              border: "2px solid #E5E7EB",
              "&:hover": { border: "2px solid #F5A524" },
            }}
          >
            <CardActionArea
              onClick={() => pick("hi")}
              sx={{ py: 4, display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Typography sx={{ fontSize: "2.5rem" }}>🇮🇳</Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#1F2937" }}
              >
                हिन्दी
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                Hindi
              </Typography>
            </CardActionArea>
          </Card>

          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              border: "2px solid #E5E7EB",
              "&:hover": { border: "2px solid #F5A524" },
            }}
          >
            <CardActionArea
              onClick={() => pick("en")}
              sx={{ py: 4, display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Typography sx={{ fontSize: "2.5rem" }}>🔤</Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#1F2937" }}
              >
                English
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                अंग्रेज़ी
              </Typography>
            </CardActionArea>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
