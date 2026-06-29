import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import AuthField from "../components/Auth/AuthField.jsx";
import Notice from "../components/Common/Notice.jsx";
import { getApiError } from "../utils/apiError.js";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState(null);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post("/auth/forgot-password", { email });
      setNotice({
        type: "success",
        message: "Neu email ton tai, he thong da gui email dat lai mat khau.",
      });
    } catch (error) {
      setNotice({ type: "error", message: getApiError(error).message });
    }
  }

  return (
    <section className="relative mx-auto grid min-h-0 w-[min(560px,100%)] grid-cols-1 overflow-hidden rounded-lg border border-white/80 bg-white/90 px-14 py-10 shadow-[0_24px_70px_rgba(44,101,160,0.22)] backdrop-blur-xl max-[820px]:p-7 max-[560px]:p-[22px_18px]">
      <div className="relative z-10 w-full">
        <Link
          className="mb-6 inline-flex text-lg font-black text-[#0f5d99]"
          to="/login"
        >
          SocialConnect
        </Link>
        <h1 className="m-0 mb-4 text-[30px] font-bold leading-tight text-[#101828] max-[560px]:text-[25px]">
          Forgot Password
        </h1>
        <form className="grid gap-3" onSubmit={submit}>
          <AuthField
            label="Email"
            value={email}
            placeholder="Email or Mobile Number"
            onChange={setEmail}
            autoComplete="email"
            inputClassName="!h-12"
          />
          <button
            className="min-h-10 w-full rounded-md bg-gradient-to-b from-[#2389ef] to-[#0f6fce] px-4 font-bold text-white hover:from-[#1a6fc5] hover:to-[#0c5a9e]"
            type="submit"
          >
            Send reset email
          </button>
        </form>
        <Notice type={notice?.type}>{notice?.message}</Notice>
        <Link className="mt-3 inline-flex" to="/login">
          Back to login
        </Link>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
