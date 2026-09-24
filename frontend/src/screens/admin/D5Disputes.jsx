import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Drawer from "@mui/material/Drawer"
import Chip from "@mui/material/Chip"
import LinearProgress from "@mui/material/LinearProgress"
import TextField from "@mui/material/TextField"
import Snackbar from "@mui/material/Snackbar"
import Alert from "@mui/material/Alert"
import { useLang } from "../../contexts/LanguageContext.jsx"

const MOCK_DISPUTES = [
  {
    id: "C482",
    type: "Weight dispute",
    farmer: "Ramesh Kumar",
    buyer: "Green Mills",
    opened: "Sep 20",
    slaHours: 48,
    elapsed: 18,
  },
  {
    id: "C491",
    type: "Payment late",
    farmer: "Suresh Yadav",
    buyer: "Sharma Traders",
    opened: "Sep 21",
    slaHours: 24,
    elapsed: 22,
  },
  {
    id: "C503",
    type: "Quality dispute",
    farmer: "Mohan Singh",
    buyer: "Agro Foods",
    opened: "Sep 22",
    slaHours: 72,
    elapsed: 5,
  },
]

export default function D5Disputes() {
  const { lang } = useLang()
  const [drawer, setDrawer] = useState(null)
  const [resolutionType, setResolutionType] = useState("")
  const [resolutionNote, setResolutionNote] = useState("")
  const [disputes, setDisputes] = useState(MOCK_DISPUTES)
  const [toast, setToast] = useState(false)

  function openDrawer(d) {
    setDrawer(d)
    setResolutionType("")
    setResolutionNote("")
  }

  function resolveDispute() {
    setDisputes((prev) => prev.filter((d) => d.id !== drawer.id))
    setDrawer(null)
    setToast(true)
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {lang === "hi" ? "विवाद" : "Disputes"} · sample
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {disputes.map((d) => {
          const pct = (d.elapsed / d.slaHours) * 100
          const urgent = pct > 80
          return (
            <Card
              key={d.id}
              sx={{
                border: urgent ? "2px solid #FEE2E2" : undefined,
                cursor: "pointer",
              }}
              onClick={() => openDrawer(d)}
            >
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {d.id}
                    </Typography>
                    <Chip
                      label={d.type}
                      size="small"
                      sx={{ fontSize: "0.7rem" }}
                    />
                    {urgent && (
                      <Chip
                        label="Urgent"
                        size="small"
                        sx={{
                          bgcolor: "#FEE2E2",
                          color: "#B91C1C",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    SLA: {d.elapsed}h/{d.slaHours}h
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#6B7280", display: "block", mb: 1 }}
                >
                  {d.farmer} vs {d.buyer} · {d.opened}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    "& .MuiLinearProgress-bar": {
                      bgcolor:
                        pct > 80 ? "#B91C1C" : pct > 60 ? "#B45309" : "#15803D",
                    },
                  }}
                />
              </CardContent>
            </Card>
          )
        })}
      </Box>

      <Drawer
        anchor="right"
        open={!!drawer}
        onClose={() => setDrawer(null)}
        PaperProps={{ sx: { width: 420, p: 3 } }}
      >
        {drawer && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {drawer.id} — {drawer.type}
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mb: 2 }}>
              {drawer.farmer} vs {drawer.buyer}
            </Typography>
            <Box sx={{ bgcolor: "#F3F4F6", borderRadius: 2, p: 2, mb: 2 }}>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#6B7280", mb: 0.5 }}
              >
                Evidence
              </Typography>
              <Typography variant="body2">
                3 photos uploaded by farmer · Weighment record attached · Buyer
                response: "Weight was correct"
              </Typography>
            </Box>
            <TextField
              multiline
              rows={3}
              label="Resolution note"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[
                "Resolved — farmer correct",
                "Resolved — buyer correct",
                "Partial refund approved",
                "Escalated",
              ].map((r) => (
                <Button
                  key={r}
                  variant={resolutionType === r ? "contained" : "outlined"}
                  color={
                    r.includes("farmer")
                      ? "success"
                      : r.includes("buyer")
                        ? "primary"
                        : "warning"
                  }
                  onClick={() => setResolutionType(r)}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  {r}
                </Button>
              ))}
              <Button
                variant="contained"
                color="error"
                fullWidth
                disabled={!resolutionType}
                sx={{ mt: 1 }}
                onClick={resolveDispute}
              >
                Resolve & notify both parties
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

      <Snackbar
        open={toast}
        autoHideDuration={3000}
        onClose={() => setToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setToast(false)}
          sx={{ width: "100%" }}
        >
          Dispute resolved. Both parties notified.
        </Alert>
      </Snackbar>
    </Box>
  )
}
