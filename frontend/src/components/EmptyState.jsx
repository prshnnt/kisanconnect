import React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import InboxIcon from "@mui/icons-material/Inbox"

export default function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  onAction,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 6,
        gap: 2,
        px: 3,
      }}
    >
      <Box sx={{ bgcolor: "#F3F4F6", borderRadius: "50%", p: 3 }}>
        <Icon sx={{ fontSize: 48, color: "#9CA3AF" }} />
      </Box>
      {title && (
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "#1F2937", textAlign: "center" }}
        >
          {title}
        </Typography>
      )}
      {description && (
        <Typography
          variant="body2"
          sx={{ color: "#6B7280", textAlign: "center" }}
        >
          {description}
        </Typography>
      )}
      {action && (
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
          sx={{ mt: 1 }}
        >
          {action}
        </Button>
      )}
    </Box>
  )
}
