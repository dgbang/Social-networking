import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/axios.js";
import Notice from "../components/Common/Notice.jsx";
import { setCredentials } from "../store/authSlice.js";

function OAuthCallbackPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notice, setNotice] = useState({ type: "info", message: "Dang hoan tat dang nhap Google..." });

  useEffect(() => {
    async function finishLogin() {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = params.get("accessToken");

      if (!accessToken) {
        setNotice({ type: "error", message: "Thieu token dang nhap Google." });
        return;
      }

      try {
        const res = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        dispatch(setCredentials({ accessToken, user: res.data.data.user }));
        navigate("/dashboard", { replace: true });
      } catch (error) {
        setNotice({ type: "error", message: "Khong the hoan tat dang nhap Google." });
      }
    }

    finishLogin();
  }, [dispatch, navigate]);

  return (
    <section className="relative mx-auto grid min-h-0 w-[min(560px,100%)] grid-cols-1 overflow-hidden rounded-lg border border-white/80 bg-white/90 px-14 py-10 shadow-[0_24px_70px_rgba(44,101,160,0.22)] backdrop-blur-xl max-[820px]:p-7 max-[560px]:p-[22px_18px]">
      <div className="relative z-10 w-full">
        <Link className="mb-6 inline-flex text-lg font-black text-[#0f5d99]" to="/login">
          SocialConnect
        </Link>
        <h1 className="m-0 mb-4 text-[30px] font-bold leading-tight text-[#101828] max-[560px]:text-[25px]">Google Login</h1>
        <Notice type={notice.type}>{notice.message}</Notice>
        {notice.type === "error" ? <Link className="mt-3 inline-flex" to="/login">Back to login</Link> : null}
      </div>
    </section>
  );
}

export default OAuthCallbackPage;
