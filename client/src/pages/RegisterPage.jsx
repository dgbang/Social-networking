import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import AuthField from "../components/Auth/AuthField.jsx";
import { getApiError } from "../utils/apiError.js";

function RegisterPage() {
  const [form, setForm] = useState({ email: "", username: "", fullName: "", password: "", dateOfBirth: "" });
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function buildUsername(email) {
    const emailName = email.split("@")[0] || "user";
    const normalized = emailName.toLowerCase().replace(/[^a-z0-9_]/g, "");
    return normalized || `user${Date.now()}`;
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setNotice(null);
    try {
      const { dateOfBirth, ...registerPayload } = form;
      await api.post("/auth/register", {
        ...registerPayload,
        username: form.username || buildUsername(form.email)
      });
      setNotice({ type: "success", message: "Dang ky thanh cong. Ban co the dang nhap ngay." });
    } catch (error) {
      setNotice({ type: "error", message: getApiError(error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper
      className="relative grid min-h-[420px] grid-cols-[minmax(280px,360px)_1fr] items-center gap-10 overflow-hidden !rounded-lg !border !border-white/80 !bg-white/90 px-14 py-10 !shadow-[0_24px_70px_rgba(44,101,160,0.22)] backdrop-blur-xl max-[820px]:grid-cols-1 max-[820px]:gap-6 max-[820px]:p-7 max-[560px]:p-[22px_18px]"
      elevation={6}
    >
      <Box className="relative z-10 w-full">
        <Typography component={Link} to="/login" className="mb-6 inline-flex !text-lg !font-black !text-[#0f5d99]">
          SocialConnect
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" className="mb-2">
          <PersonAddAltRoundedIcon color="primary" />
          <Typography variant="h4" component="h1" className="!m-0 !text-[30px] !font-bold !leading-tight !text-[#101828] max-[560px]:!text-[25px]">
            Dang Ky
          </Typography>
        </Stack>
        <Box component="form" onSubmit={submit}>
          <AuthField label="Full name" value={form.fullName} placeholder="Full Name" onChange={(value) => update("fullName", value)} autoComplete="name" inputClassName="!h-12" />
          <AuthField label="Email" value={form.email} placeholder="Email or Mobile Number" onChange={(value) => update("email", value)} autoComplete="email" inputClassName="!h-12" />
          <AuthField label="Password" type="password" value={form.password} placeholder="Password" onChange={(value) => update("password", value)} autoComplete="new-password" inputClassName="!h-12" />
          <AuthField label="Date of birth" type="date" value={form.dateOfBirth} placeholder="Date of Birth" onChange={(value) => update("dateOfBirth", value)} autoComplete="bday" inputClassName="!h-12" />
          <Button fullWidth variant="contained" type="submit" disabled={loading} className="!mt-3">
            {loading ? "Dang tao..." : "Sign Up"}
          </Button>
        </Box>
        {notice?.message ? <Alert severity={notice.type || "info"} className="!mt-3">{notice.message}</Alert> : null}
        <Typography className="mt-3.5 text-center !text-[13px] !text-[#526073]" component="p">
          Already have an account? <Link to="/login">Log In</Link>
        </Typography>
      </Box>
      <div
        className="relative z-10 h-[270px] w-full max-w-[360px] justify-self-center rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.78),rgba(227,244,255,0.6)),linear-gradient(135deg,#f6fbff,#d7efff)] shadow-[inset_0_0_0_1px_rgba(14,100,189,0.08)] max-[820px]:hidden"
        aria-hidden="true"
      >
        <div className="absolute bottom-[38px] left-[34px] right-[34px] h-2.5 rounded-full bg-[rgba(90,129,155,0.13)]" />
        <span className="absolute left-[58px] top-[70px] grid h-[34px] w-[34px] place-items-center rounded-full bg-white text-xs font-black text-[#1672d4] shadow-[0_10px_20px_rgba(43,101,151,0.16)]">OK</span>
        <span className="absolute right-[90px] top-[46px] grid h-[34px] w-[34px] place-items-center rounded-full bg-white text-xs font-black text-[#1672d4] shadow-[0_10px_20px_rgba(43,101,151,0.16)]">Hi</span>
        <span className="absolute bottom-[54px] left-[68px] h-[92px] w-[38px] rounded-[19px_19px_9px_9px] bg-[#f47a5c] before:absolute before:left-[7px] before:top-[-26px] before:h-6 before:w-6 before:rounded-full before:bg-[#efc5a7] before:shadow-[0_4px_0_#263244] before:content-['']" />
        <span className="absolute bottom-[54px] left-[132px] h-[116px] w-[38px] rounded-[19px_19px_9px_9px] bg-[#263244] before:absolute before:left-[7px] before:top-[-26px] before:h-6 before:w-6 before:rounded-full before:bg-[#efc5a7] before:shadow-[0_4px_0_#263244] before:content-['']" />
        <span className="absolute bottom-[54px] left-[196px] h-[104px] w-[38px] rounded-[19px_19px_9px_9px] bg-[#e96362] before:absolute before:left-[7px] before:top-[-26px] before:h-6 before:w-6 before:rounded-full before:bg-[#efc5a7] before:shadow-[0_4px_0_#263244] before:content-['']" />
        <span className="absolute bottom-[54px] left-[260px] h-[86px] w-[38px] rounded-[19px_19px_9px_9px] bg-[#247fbd] before:absolute before:left-[7px] before:top-[-26px] before:h-6 before:w-6 before:rounded-full before:bg-[#efc5a7] before:shadow-[0_4px_0_#263244] before:content-['']" />
      </div>
    </Paper>
  );
}

export default RegisterPage;
