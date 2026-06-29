import { createTheme } from "@mui/material/styles";

const appFontFamily =
  '"Instagram Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1877f2"
    },
    secondary: {
      main: "#42b72a"
    },
    background: {
      default: "#f0f2f5",
      paper: "#ffffff"
    },
    text: {
      primary: "#050505",
      secondary: "#65676b"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: appFontFamily,
    button: {
      fontWeight: 700,
      textTransform: "none"
    }
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 6
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8
        }
      }
    }
  }
});

export default muiTheme;
