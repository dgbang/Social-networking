import LockRoundedIcon from "@mui/icons-material/LockRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { API_BASE_URL } from "../api/axios.js";
import AuthField from "../components/Auth/AuthField.jsx";
import { setCredentials } from "../store/authSlice.js";
import { getApiError } from "../utils/apiError.js";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [notice, setNotice] = useState(() => {
    const oauthError = searchParams.get("oauthError");
    return oauthError
      ? {
          type: "error",
          message: "Dang nhap Google that bai. Vui long thu lai.",
        }
      : null;
  });
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setNotice(null);
    try {
      const res = await api.post("/auth/login", form);
      dispatch(setCredentials(res.data.data));
      navigate("/dashboard");
    } catch (error) {
      const apiError = getApiError(error);
      setNotice({
        type: "error",
        message: apiError.message,
        code: apiError.code,
      });
    } finally {
      setLoading(false);
    }
  }

  function loginWithGoogle() {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  return (
    <Paper
      className="relative grid min-h-[420px] grid-cols-[minmax(280px,360px)_1fr] items-center gap-10 overflow-hidden !rounded-lg !border !border-white/80 !bg-white/90 px-14 py-10 !shadow-[0_24px_70px_rgba(44,101,160,0.22)] backdrop-blur-xl max-[820px]:grid-cols-1 max-[820px]:gap-6 max-[820px]:p-7 max-[560px]:p-[22px_18px]"
      elevation={6}
    >
      <Box className="relative z-10 w-full">
        <Typography
          component={Link}
          to="/login"
          className="mb-6 inline-flex !text-[32px] !font-black !text-[#0064E0]"
        >
          SocialConnect
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          className="mb-2"
          sx={{
            flexWrap: "nowrap",
          }}
        >
          <LockRoundedIcon
            color="primary"
            sx={{ fontSize: 24, display: "block" }}
          />

          <Typography
            component="h1"
            className="!m-0 !text-[24px] !font-bold !leading-[24px] !text-[#101828]"
          >
            Login to your account
          </Typography>
        </Stack>
        <Box component="form" onSubmit={submit}>
          <AuthField
            label="Email"
            value={form.email}
            placeholder="Email or Mobile Number"
            onChange={(value) => update("email", value)}
            autoComplete="email"
            inputClassName="!h-[56px]"
          />
          <AuthField
            label="Password"
            type="password"
            value={form.password}
            placeholder="Password"
            onChange={(value) => update("password", value)}
            autoComplete="current-password"
            inputClassName="!h-[56px]"
          />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            className="my-2"
            sx={{ width: "100%", gap: "50px" }}
          >
            <FormControlLabel
              control={<Checkbox defaultChecked size="small" />}
              label="Remember Me"
              sx={{
                m: 0,
                height: 32,
                alignItems: "center",
              }}
            />

            <Link
              to="/forgot-password"
              style={{
                display: "flex",
                alignItems: "center",
                height: 32,
                lineHeight: "32px",
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
            >
              Forgot Password?
            </Link>
          </Stack>
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            className="!bg-[#0064E0] hover:!bg-[#0043CE]"
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </Box>
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          type="button"
          onClick={() => navigate("/register")}
          className="!mt-3"
        >
          Create New Account
        </Button>
        <Typography
          className="my-3.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 !text-[13px] !text-[#8290a3] before:h-px before:bg-[#e1e8f0] before:content-[''] after:h-px after:bg-[#e1e8f0] after:content-['']"
          component="div"
        >
          or
        </Typography>
        <Button
          fullWidth
          variant="outlined"
          type="button"
          onClick={loginWithGoogle}
          startIcon={<TravelExploreRoundedIcon />}
        >
          Continue with Google
        </Button>
        {notice?.message ? (
          <Alert severity={notice.type || "info"} className="!mt-3">
            {notice.message}
          </Alert>
        ) : null}
      </Box>
      <div
        className="relative z-10 h-[270px] w-full max-w-[360px] justify-self-center rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.78),rgba(227,244,255,0.6)),linear-gradient(135deg,#f6fbff,#d7efff)] shadow-[inset_0_0_0_1px_rgba(14,100,189,0.08)] max-[820px]:hidden"
        aria-hidden="true"
      >
        <div className="absolute bottom-[38px] left-[34px] right-[34px] h-2.5 rounded-full bg-[rgba(90,129,155,0.13)]" />
        <div className="absolute right-[70px] top-12 grid h-[92px] w-[92px] place-items-center rounded-full border-[5px] border-[#0d4f86] bg-[#78bdf3]">
          <div className="h-5 w-5 rounded-full border-[3px] border-[#0d4f86] bg-white" />
        </div>
        <div className="absolute right-[150px] top-[133px] h-7 w-[146px] origin-right rotate-[-42deg] border-4 border-[#0d4f86] bg-[#d7efff]">
          <div className="absolute left-[22px] top-5 h-7 w-6 border-b-4 border-l-4 border-[#0d4f86]" />
        </div>
        <div className="absolute bottom-[58px] right-[95px] grid h-12 w-[52px] place-items-center rounded-lg border-4 border-[#0d4f86] bg-[#7cbef1] text-[10px] font-black text-[#0d4f86]">
          LOCK
        </div>
      </div>
    </Paper>
  );
}

export default LoginPage;
