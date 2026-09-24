import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import { useLang } from "../../contexts/LanguageContext.jsx"
import TopBar from "../../components/TopBar.jsx"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const DAYS_HI = ["सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "रवि"]
const JOB_COLORS = {
  weighing: "#3730A3",
  testing: "#15803D",
  transport: "#B45309",
  storage: "#1D4ED8",
}

const MOCK_WEEK = [
  { day: 0, jobs: [{ type: "weighing", customer: "Ramesh K.", time: "9am" }] },
  {
    day: 1,
    jobs: [
      { type: "testing", customer: "Green Mills", time: "11am" },
      { type: "weighing", customer: "Suresh Y.", time: "3pm" },
    ],
  },
  { day: 2, jobs: [] },
  { day: 3, jobs: [{ type: "transport", customer: "Mohan S.", time: "8am" }] },
  { day: 4, jobs: [] },
  { day: 5, jobs: [{ type: "weighing", customer: "FPO Ganga", time: "10am" }] },
  { day: 6, jobs: [] },
]

export default function S4Calendar() {
  const { lang } = useLang()
  const today = new Date().getDay()
  const dayLabels = lang === "hi" ? DAYS_HI : DAYS

  return (
    <Box sx={{ bgcolor: "#FFFBF5", minHeight: "100vh" }}>
      <TopBar title={lang === "hi" ? "कैलेंडर" : "Calendar"} />
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {lang === "hi" ? "इस सप्ताह" : "This week"}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 0.5,
            mb: 2,
          }}
        >
          {dayLabels.map((d, i) => (
            <Box key={i} sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                sx={{ color: "#9CA3AF", fontSize: "0.65rem" }}
              >
                {d}
              </Typography>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: i === today ? "#F5A524" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: i === today ? 700 : 400,
                    color: i === today ? "#1F2937" : "#6B7280",
                  }}
                >
                  {22 + i}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {MOCK_WEEK.filter((d) => d.jobs.length > 0).map((d) => (
            <Box key={d.day}>
              <Typography
                variant="caption"
                sx={{
                  color: "#6B7280",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {dayLabels[d.day]} {22 + d.day}
              </Typography>
              {d.jobs.map((job, j) => (
                <Card
                  key={j}
                  sx={{
                    mt: 0.5,
                    borderLeft: `4px solid ${JOB_COLORS[job.type] || "#F5A524"}`,
                  }}
                >
                  <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {job.customer}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      {job.time} · {job.type}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
