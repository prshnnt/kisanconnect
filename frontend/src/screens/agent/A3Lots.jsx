import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Chip from "@mui/material/Chip"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import StatusPill from "../../components/StatusPill.jsx"
import { formatINR } from "../../utils/format.js"

const MOCK_LOTS = [
  {
    id: 1,
    farmer: "Ramesh Kumar",
    crop: "Wheat",
    qty: 25,
    status: "live",
    bestOffer: 2410,
  },
  {
    id: 2,
    farmer: "Suresh Yadav",
    crop: "Potato",
    qty: 10,
    status: "offers",
    bestOffer: 1180,
  },
  {
    id: 3,
    farmer: "Mohan Singh",
    crop: "Rice",
    qty: 50,
    status: "sold",
    bestOffer: 3200,
  },
]

export default function A3Lots() {
  const { lang } = useLang()
  const [filter, setFilter] = useState("all")

  const filtered =
    filter === "all" ? MOCK_LOTS : MOCK_LOTS.filter((l) => l.status === filter)

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "मेरी लॉट" : "My lots"} />
      <Box sx={{ px: 2, py: 2 }}>
        <FormControl size="small" sx={{ mb: 2, minWidth: 150 }}>
          <InputLabel>{lang === "hi" ? "स्थिति" : "Status"}</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label={lang === "hi" ? "स्थिति" : "Status"}
          >
            <MenuItem value="all">{lang === "hi" ? "सभी" : "All"}</MenuItem>
            <MenuItem value="live">{lang === "hi" ? "सक्रिय" : "Live"}</MenuItem>
            <MenuItem value="offers">
              {lang === "hi" ? "ऑफर" : "Offers"}
            </MenuItem>
            <MenuItem value="sold">{lang === "hi" ? "बिका" : "Sold"}</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered.map((lot) => (
            <Card key={lot.id}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {lot.farmer}
                  </Typography>
                  <StatusPill status={lot.status} label={lot.status} />
                </Box>
                <Typography variant="body2" sx={{ color: "#6B7280", mb: 0.5 }}>
                  {lot.crop} · {lot.qty} qtl · sample
                </Typography>
                {lot.bestOffer && (
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#15803D" }}
                  >
                    {lang === "hi" ? "सबसे अच्छा ऑफर: " : "Best offer: "}
                    {formatINR(lot.bestOffer)}/qtl
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
