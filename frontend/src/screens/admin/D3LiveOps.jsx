import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import Snackbar from "@mui/material/Snackbar"
import Alert from "@mui/material/Alert"
import GavelIcon from "@mui/icons-material/Gavel"
import GateIcon from "@mui/icons-material/MeetingRoom"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import { useLang } from "../../contexts/LanguageContext.jsx"
import { formatINR } from "../../utils/format.js"

const MOCK_AUCTIONS = [
  {
    id: 1,
    lot: "Wheat 25 qtl",
    seller: "Ramesh Kumar",
    highBid: 2410,
    bids: 7,
  },
  { id: 2, lot: "Rice 50 qtl", seller: "Ganga FPO", highBid: 3150, bids: 3 },
]

const MOCK_GATE_EXITS = [
  { id: 1, lot: "Wheat 25 qtl", buyer: "Green Mills", gateNo: "G-4" },
]

const MOCK_PAYOUTS = [
  { id: 1, farmer: "Ramesh Kumar", amount: 57869, buyerPaid: true },
  { id: 2, farmer: "Suresh Yadav", amount: 29750, buyerPaid: false },
]

export default function D3LiveOps() {
  const { lang } = useLang()
  const [auctions, setAuctions] = useState(MOCK_AUCTIONS)
  const [gateExits, setGateExits] = useState(MOCK_GATE_EXITS)
  const [payouts, setPayouts] = useState(MOCK_PAYOUTS)
  const [toast, setToast] = useState(null)

  function declareAuction(a) {
    setAuctions((prev) => prev.filter((x) => x.id !== a.id))
    setToast(
      lang === "hi"
        ? `${a.lot} की नीलामी घोषित की गई`
        : `${a.lot} auction declared`,
    )
  }

  function respondGate(g, approved) {
    setGateExits((prev) => prev.filter((x) => x.id !== g.id))
    setToast(
      approved
        ? lang === "hi"
          ? `${g.lot} के लिए गेट एग्जिट मंजूर`
          : `Gate exit approved for ${g.lot}`
        : lang === "hi"
          ? `${g.lot} के लिए गेट एग्जिट रोका गया`
          : `Gate exit rejected for ${g.lot}`,
    )
  }

  function releasePayout(p) {
    setPayouts((prev) => prev.filter((x) => x.id !== p.id))
    setToast(
      lang === "hi"
        ? `${p.farmer} को ${formatINR(p.amount)} जारी किया गया`
        : `${formatINR(p.amount)} released to ${p.farmer}`,
    )
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {lang === "hi" ? "लाइव ऑपरेशन" : "Live ops"} · sample
      </Typography>

      <Grid container spacing={3}>
        {/* Auctions to declare */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <GavelIcon sx={{ color: "#B45309" }} />{" "}
            {lang === "hi" ? "घोषित करने वाली बोलियां" : "Auctions to declare"}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {auctions.length === 0 && (
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi" ? "कोई लंबित नहीं" : "Nothing pending"}
              </Typography>
            )}
            {auctions.map((a) => (
              <Card key={a.id}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {a.lot}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", display: "block", mb: 1 }}
                  >
                    {a.seller} · {a.bids} bids · Highest: {formatINR(a.highBid)}
                    /qtl
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    fullWidth
                    sx={{ height: 36 }}
                    onClick={() => declareAuction(a)}
                  >
                    {lang === "hi" ? "घोषित करें" : "Declare"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Gate exits */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <GateIcon sx={{ color: "#3730A3" }} />{" "}
            {lang === "hi" ? "गेट एग्जिट" : "Gate exits"}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {gateExits.length === 0 && (
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi" ? "कोई लंबित नहीं" : "Nothing pending"}
              </Typography>
            )}
            {gateExits.map((g) => (
              <Card key={g.id}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {g.lot}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#6B7280", display: "block", mb: 1 }}
                  >
                    {g.buyer} · Gate {g.gateNo}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{
                        flex: 1,
                        height: 32,
                        bgcolor: "#15803D",
                        fontSize: "0.75rem",
                      }}
                      onClick={() => respondGate(g, true)}
                    >
                      {lang === "hi" ? "मंजूर" : "Approve"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{
                        flex: 1,
                        height: 32,
                        fontSize: "0.75rem",
                        borderColor: "#B91C1C",
                        color: "#B91C1C",
                      }}
                      onClick={() => respondGate(g, false)}
                    >
                      {lang === "hi" ? "रोकें" : "Reject"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Payouts to release */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AccountBalanceWalletIcon sx={{ color: "#15803D" }} />{" "}
            {lang === "hi" ? "रिलीज़ करने वाले भुगतान" : "Payouts to release"}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {payouts.length === 0 && (
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi" ? "कोई लंबित नहीं" : "Nothing pending"}
              </Typography>
            )}
            {payouts.map((p) => (
              <Card key={p.id}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {p.farmer}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "#15803D" }}
                    >
                      {formatINR(p.amount)}
                    </Typography>
                  </Box>
                  {p.buyerPaid ? (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      fullWidth
                      sx={{ height: 32, fontSize: "0.75rem" }}
                      onClick={() => releasePayout(p)}
                    >
                      {lang === "hi" ? "जारी करें" : "Release"}
                    </Button>
                  ) : (
                    <Typography variant="caption" sx={{ color: "#B91C1C" }}>
                      {lang === "hi"
                        ? "खरीदार ने अभी भुगतान नहीं किया"
                        : "Buyer payment pending"}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setToast(null)}
          sx={{ width: "100%" }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  )
}
