import React, { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction"
import Divider from "@mui/material/Divider"
import Avatar from "@mui/material/Avatar"
import Chip from "@mui/material/Chip"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import TextField from "@mui/material/TextField"
import PersonIcon from "@mui/icons-material/Person"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import AgricultureIcon from "@mui/icons-material/Agriculture"
import PhoneIcon from "@mui/icons-material/Phone"
import LogoutIcon from "@mui/icons-material/Logout"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import AddIcon from "@mui/icons-material/Add"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useNavigate } from "react-router-dom"
import { useLang } from "../../contexts/LanguageContext.jsx"
import { useAuth } from "../../contexts/AuthContext.jsx"
import TopBar from "../../components/TopBar.jsx"
import { maskAccount } from "../../utils/format.js"

const MOCK_BANKS = [
  {
    id: 1,
    account: "7893",
    ifsc: "SBIN0001234",
    bank: "State Bank of India",
    primary: true,
    verified: true,
  },
]

const MOCK_CROPS = ["Wheat 🌾", "Potato 🥔", "Rice 🍚"]

export default function F23Me() {
  const { lang, setLang } = useLang()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [banks, setBanks] = useState(MOCK_BANKS)
  const [addBankOpen, setAddBankOpen] = useState(false)
  const [newAccount, setNewAccount] = useState("")
  const [newIfsc, setNewIfsc] = useState("")
  const [newBankName, setNewBankName] = useState("")

  function saveBank() {
    if (!newAccount || !newIfsc || !newBankName) return
    setBanks((prev) => [
      ...prev,
      {
        id: Date.now(),
        account: newAccount,
        ifsc: newIfsc,
        bank: newBankName,
        primary: prev.length === 0,
        verified: false,
      },
    ])
    setNewAccount("")
    setNewIfsc("")
    setNewBankName("")
    setAddBankOpen(false)
  }

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "मेरा" : "My profile"} />

      <Box sx={{ px: 2, py: 2 }}>
        {/* Profile card */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "#F5A524",
                fontSize: "1.5rem",
              }}
            >
              {(user?.name || "K")[0]}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {user?.name || "Sample Farmer"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                {lang === "hi" ? "लखनऊ APMC · किसान" : "Lucknow APMC · Farmer"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#3730A3", cursor: "pointer", fontWeight: 600 }}
              >
                {lang === "hi" ? "प्रोफाइल संपादित करें" : "Edit profile"}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Language */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {lang === "hi" ? "भाषा" : "Language"}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  label="हिन्दी"
                  onClick={() => setLang("hi")}
                  color={lang === "hi" ? "primary" : "default"}
                  variant={lang === "hi" ? "filled" : "outlined"}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  label="English"
                  onClick={() => setLang("en")}
                  color={lang === "en" ? "primary" : "default"}
                  variant={lang === "en" ? "filled" : "outlined"}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Bank accounts */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === "hi" ? "बैंक खाते" : "Bank accounts"}
        </Typography>
        <Card sx={{ mb: 2 }}>
          {banks.map((bank) => (
            <CardContent
              key={bank.id}
              sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AccountBalanceIcon sx={{ color: "#3730A3", fontSize: 24 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      ••••{maskAccount(bank.account)}
                    </Typography>
                    {bank.primary && (
                      <Chip
                        label={lang === "hi" ? "मुख्य" : "Primary"}
                        size="small"
                        sx={{
                          bgcolor: "#D1FAE5",
                          color: "#15803D",
                          fontWeight: 600,
                          height: 20,
                          fontSize: "0.65rem",
                        }}
                      />
                    )}
                    {bank.verified && (
                      <CheckCircleIcon
                        sx={{ fontSize: 14, color: "#15803D" }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    {bank.bank} · {bank.ifsc}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          ))}
          <Divider />
          <CardContent sx={{ py: 1 }}>
            <Button
              startIcon={<AddIcon />}
              size="small"
              sx={{ color: "#3730A3", fontWeight: 600 }}
              onClick={() => setAddBankOpen(true)}
            >
              {lang === "hi" ? "बैंक खाता जोड़ें" : "Add bank account"}
            </Button>
          </CardContent>
        </Card>

        {/* My crops */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {lang === "hi" ? "मेरी फसलें" : "My crops"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
          {MOCK_CROPS.map((c) => (
            <Chip
              key={c}
              label={c}
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          ))}
          <Chip
            icon={<AddIcon />}
            label={lang === "hi" ? "और जोड़ें" : "Add more"}
            variant="outlined"
            sx={{ fontWeight: 500, borderStyle: "dashed" }}
          />
        </Box>

        {/* Helpline */}
        <Card sx={{ mb: 2, bgcolor: "#F0F9FF", border: "1px solid #BAE6FD" }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PhoneIcon sx={{ color: "#3730A3", fontSize: 28 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {lang === "hi" ? "हेल्पलाइन" : "Helpline"}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 700, color: "#3730A3" }}
              >
                1800-XXX-XXXX
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {lang === "hi" ? "सुबह 8 से शाम 8 बजे तक" : "8am – 8pm daily"}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          fullWidth
          color="error"
          sx={{ borderColor: "#B91C1C", color: "#B91C1C", height: 48 }}
          onClick={() => {
            logout()
            navigate("/login")
          }}
        >
          {lang === "hi" ? "लॉग आउट" : "Log out"}
        </Button>
      </Box>

      <Dialog
        open={addBankOpen}
        onClose={() => setAddBankOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, mx: 2, maxWidth: 358 } }}
      >
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {lang === "hi" ? "बैंक खाता जोड़ें" : "Add bank account"}
          </Typography>
          <TextField
            label={lang === "hi" ? "बैंक का नाम" : "Bank name"}
            value={newBankName}
            onChange={(e) => setNewBankName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label={lang === "hi" ? "खाता संख्या" : "Account number"}
            value={newAccount}
            onChange={(e) => setNewAccount(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ inputMode: "numeric" }}
          />
          <TextField
            label="IFSC"
            value={newIfsc}
            onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setAddBankOpen(false)}
            variant="outlined"
            fullWidth
          >
            {lang === "hi" ? "रद्द करें" : "Cancel"}
          </Button>
          <Button
            onClick={saveBank}
            variant="contained"
            color="primary"
            fullWidth
            disabled={!newAccount || !newIfsc || !newBankName}
          >
            {lang === "hi" ? "सेव करें" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
