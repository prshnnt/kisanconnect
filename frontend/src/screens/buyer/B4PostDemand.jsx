import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import InputAdornment from "@mui/material/InputAdornment"
import MicIcon from "@mui/icons-material/Mic"
import PeopleIcon from "@mui/icons-material/People"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"

export default function B4PostDemand() {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    crop: "",
    grade: "",
    qtyMin: "",
    qtyMax: "",
    priceMin: "",
    priceMax: "",
    moisture: "",
    deliverBy: "",
    location: "",
    payment: "",
  })

  function update(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "मांग दर्ज करें" : "Post a demand"} />

      <Box sx={{ px: 2, py: 2, pb: 12 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{lang === "hi" ? "फसल" : "Crop"}</InputLabel>
            <Select
              value={form.crop}
              onChange={(e) => update("crop", e.target.value)}
              label={lang === "hi" ? "फसल" : "Crop"}
            >
              {["Wheat", "Potato", "Rice", "Maize", "Mustard"].map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>{lang === "hi" ? "ग्रेड" : "Grade"}</InputLabel>
            <Select
              value={form.grade}
              onChange={(e) => update("grade", e.target.value)}
              label={lang === "hi" ? "ग्रेड" : "Grade"}
            >
              {["A", "B", "C", "Any"].map((g) => (
                <MenuItem key={g} value={g}>
                  Grade {g}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField
              label={lang === "hi" ? "मात्रा न्यूनतम (qtl)" : "Qty min (qtl)"}
              value={form.qtyMin}
              onChange={(e) => update("qtyMin", e.target.value)}
              inputProps={{ inputMode: "numeric" }}
              sx={{ flex: 1 }}
            />
            <TextField
              label={lang === "hi" ? "मात्रा अधिकतम (qtl)" : "Qty max (qtl)"}
              value={form.qtyMax}
              onChange={(e) => update("qtyMax", e.target.value)}
              inputProps={{ inputMode: "numeric" }}
              sx={{ flex: 1 }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <TextField
              label={lang === "hi" ? "कीमत न्यूनतम (₹/qtl)" : "Price min (₹/qtl)"}
              value={form.priceMin}
              onChange={(e) => update("priceMin", e.target.value)}
              inputProps={{ inputMode: "numeric" }}
              sx={{ flex: 1 }}
            />
            <TextField
              label={lang === "hi" ? "कीमत अधिकतम" : "Price max"}
              value={form.priceMax}
              onChange={(e) => update("priceMax", e.target.value)}
              inputProps={{ inputMode: "numeric" }}
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            label={lang === "hi" ? "अधिकतम नमी %" : "Max moisture %"}
            value={form.moisture}
            onChange={(e) => update("moisture", e.target.value)}
            inputProps={{ inputMode: "decimal" }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />

          <TextField
            label={lang === "hi" ? "डिलीवरी की अंतिम तारीख" : "Deliver by date"}
            value={form.deliverBy}
            onChange={(e) => update("deliverBy", e.target.value)}
            placeholder="DD/MM/YYYY"
          />

          <TextField
            label={lang === "hi" ? "स्थान" : "Location"}
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MicIcon sx={{ color: "#3730A3", cursor: "pointer" }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth>
            <InputLabel>
              {lang === "hi" ? "भुगतान शर्तें" : "Payment terms"}
            </InputLabel>
            <Select
              value={form.payment}
              onChange={(e) => update("payment", e.target.value)}
              label={lang === "hi" ? "भुगतान शर्तें" : "Payment terms"}
            >
              {["On pickup", "Within 3 days", "Within 7 days"].map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {form.crop && form.qtyMin && (
          <Card sx={{ mt: 2, bgcolor: "#F0F9FF", border: "1px solid #BAE6FD" }}>
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PeopleIcon sx={{ color: "#3730A3" }} />
                <Typography variant="body2" sx={{ color: "#3730A3" }}>
                  {lang === "hi"
                    ? "14 किसान 100 km के भीतर"
                    : "Farmers within 100 km who can supply: 14"}{" "}
                  · sample
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
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
          disabled={!form.crop || !form.qtyMin}
          onClick={() => navigate("/buyer/demands")}
        >
          {lang === "hi" ? "मांग प्रकाशित करें" : "Post demand"}
        </Button>
      </Box>
    </Box>
  )
}
