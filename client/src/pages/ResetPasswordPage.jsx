import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";
import AuthField from "../components/Auth/AuthField.jsx";
import Notice from "../components/Common/Notice.jsx";
import { getApiError } from "../utils/apiError.js";

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState(null);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setNotice({ type: "success", message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại." });
    } catch (error) {
      setNotice({ type: "error", message: getApiError(error).message });
    }
  }

  return (
    <section className="relative mx-auto grid min-h-0 w-[min(560px,100%)] grid-cols-1 overflow-hidden rounded-lg border border-white/80 bg-white/90 px-14 py-10 shadow-[0_24px_70px_rgba(44,101,160,0.22)] backdrop-blur-xl max-[820px]:p-7 max-[560px]:p-[22px_18px]">
      <div className="relative z-10 w-full">
        <Link className="mb-6 inline-flex text-lg font-black text-[#0f5d99]" to="/login">
          SocialConnect
        </Link>
        <h1 className="m-0 mb-4 text-[30px] font-bold leading-tight text-[#101828] max-[560px]:text-[25px]">Đặt lại mật khẩu</h1>
        <form className="grid gap-3" onSubmit={submit}>
          <AuthField label="Mật khẩu mới" type="password" value={password} placeholder="Mật khẩu mới" onChange={setPassword} autoComplete="new-password" inputClassName="!h-12" />
          <button className="min-h-10 w-full rounded-md bg-gradient-to-b from-[#2389ef] to-[#0f6fce] px-4 font-bold text-white" type="submit">Đặt lại mật khẩu</button>
        </form>
        <Notice type={notice?.type}>{notice?.message}</Notice>
        <Link className="mt-3 inline-flex" to="/login">Quay lại đăng nhập</Link>
      </div>
    </section>
  );
}

export default ResetPasswordPage;
