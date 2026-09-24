import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import TextField from "@mui/material/TextField"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import RadioGroup from "@mui/material/RadioGroup"
import Radio from "@mui/material/Radio"
import FormControlLabel from "@mui/material/FormControlLabel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PaymentIcon from "@mui/icons-material/Payment"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import { formatINR } from "../../utils/format.js"

export default function B8DealRoom() {
  const { lang } = useLang()
  const [payDialog, setPayDialog] = useState(false)
  const [payMethod, setPayMethod] = useState("upi")
  const [upiRef, setUpiRef] = useState("")
  const [paid, setPaid] = useState(false)

  const invoiceTotal = 60250
  const marketFee = 602
  const grandTotal = invoiceTotal + marketFee

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "Deal Room" : "Deal Room"} />

      <Box sx={{ px: 2, py: 2, pb: 12 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {lang === "hi" ? "गेहूं · 25 qtl" : "Wheat · 25 qtl"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              {lang === "hi" ? "विक्रेता: रमेश कुमार" : "Seller: Ramesh Kumar"} ·
              sample
            </Typography>
          </CardContent>
        </Card>

        {/* Timeline (buyer view) */}
        {[
          { hi: "सौदा हुआ", en: "Deal agreed", done: true, time: "Sep 20" },
          {
            hi: "पिकअप की व्यवस्था",
            en: "Pickup arranged",
            done: true,
            time: "Sep 21",
          },
          { hi: "तौल हुई", en: "Weighed", done: false, current: true },
          { hi: "कागज तैयार", en: "Paperwork ready", done: false },
          { hi: "भुगतान करें", en: "Pay now", done: false },
        ].map((step, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              mb: 1.5,
              pl: 1,
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: step.done
                  ? "#15803D"
                  : step.current
                    ? "#F5A524"
                    : "#E5E7EB",
                mt: 1,
                flexShrink: 0,
              }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: step.current ? 700 : 500,
                  color: step.done ? "#166534" : "#1F2937",
                }}
              >
                {lang === "hi" ? step.hi : step.en}
              </Typography>
              {step.time && (
                <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                  {step.time}
                </Typography>
              )}
            </Box>
          </Box>
        ))}

        {/* Invoice */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              {lang === "hi" ? "इनवॉइस" : "Invoice"} · sample
            </Typography>
            {[
              {
                label: lang === "hi" ? "फसल मूल्य" : "Produce value",
                value: invoiceTotal,
              },
              {
                label: lang === "hi" ? "मंडी शुल्क (1%)" : "Market fee (1%)",
                value: marketFee,
              },
            ].map((row, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  {row.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatINR(row.value)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {lang === "hi" ? "कुल देय" : "Total payable"}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
              >
                {formatINR(grandTotal)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
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
          onClick={() => setPayDialog(true)}
        >
          {lang === "hi" ? "अभी भुगतान करें" : "Pay now"} — {formatINR(grandTotal)}
        </Button>
      </Box>

      <Dialog
        open={payDialog && !paid}
        PaperProps={{ sx: { borderRadius: 3, mx: 2, maxWidth: 358 } }}
      >
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {lang === "hi" ? "भुगतान का तरीका" : "Payment method"}
          </Typography>
          <RadioGroup
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
          >
            <FormControlLabel
              value="upi"
              control={<Radio />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PaymentIcon sx={{ color: "#3730A3", fontSize: 20 }} />
                  <Typography variant="body2">UPI</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="bank"
              control={<Radio />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccountBalanceIcon sx={{ color: "#3730A3", fontSize: 20 }} />
                  <Typography variant="body2">
                    {lang === "hi" ? "बैंक ट्रांसफर" : "Bank transfer"}
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
          <TextField
            label={lang === "hi" ? "रेफरेंस नंबर" : "Reference number"}
            value={upiRef}
            onChange={(e) => setUpiRef(e.target.value)}
            sx={{ mt: 2 }}
            placeholder={
              payMethod === "upi" ? "UTR / UPI Ref" : "NEFT / RTGS Ref"
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setPayDialog(false)}
            variant="outlined"
            fullWidth
          >
            {lang === "hi" ? "रद्द" : "Cancel"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setPaid(true)}
            disabled={!upiRef}
          >
            {lang === "hi" ? "पुष्टि करें" : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={paid} PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: "#15803D", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {lang === "hi" ? "भुगतान पंजीकृत हुआ" : "Payment recorded"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            {lang === "hi"
              ? "किसान को सूचित किया गया"
              : "Seller has been notified"}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
