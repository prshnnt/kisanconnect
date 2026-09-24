import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  palette: {
    background: { default: "#FFFBF5", paper: "#FFFFFF" },
    primary: { main: "#F5A524", contrastText: "#1F2937" },
    secondary: { main: "#3730A3", contrastText: "#FFFFFF" },
    success: { main: "#15803D", contrastText: "#FFFFFF" },
    warning: { main: "#B45309", contrastText: "#FFFFFF" },
    info: { main: "#1D4ED8", contrastText: "#FFFFFF" },
    error: { main: "#B91C1C", contrastText: "#FFFFFF" },
    text: { primary: "#1F2937", secondary: "#6B7280" },
  },
  typography: {
    fontFamily: '"Noto Sans", "Noto Sans Devanagari", sans-serif',
    fontSize: 16,
    h1: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.5 },
    h2: { fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.5 },
    h3: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.5 },
    h4: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.5 },
    h5: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: "1.125rem", lineHeight: 1.5 },
    body2: { fontSize: "1rem", lineHeight: 1.5 },
    caption: { fontSize: "0.875rem", lineHeight: 1.5 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          height: 56,
          borderRadius: 12,
          minWidth: 48,
          fontSize: "1rem",
          fontWeight: 600,
          textTransform: "none",
        },
        sizeLarge: { height: 56 },
        sizeSmall: { height: 36 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          fontWeight: 500,
          fontSize: "0.875rem",
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", fullWidth: true },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            fontSize: "1.125rem",
          },
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: { minWidth: 48 },
      },
    },
  },
})

export default theme
