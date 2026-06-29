import { useState } from "react";

function ShareModal({ post, onClose, onShare }) {
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onShare(post, { content, privacy });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khong share duoc post.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 p-4">
      <form className="grid w-[min(560px,100%)] gap-3 rounded-lg border border-[#c8d7e6] bg-white/95 p-4 shadow-[0_14px_34px_rgba(43,101,151,0.12)]" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between gap-3">
          <h2>Share post</h2>
          <button className="rounded-md bg-[#edf2f7] px-3 py-2 font-bold text-[#334155]" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <textarea className="min-h-[104px] w-full resize-y rounded-md border border-[#c8d7e6] bg-white px-3 py-3 text-[#152033] outline-none focus:border-[#1776da] focus:shadow-[0_0_0_4px_rgba(23,118,218,0.13)]" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Them suy nghi cua ban..." />
        <select className="min-h-10 w-full rounded-md border border-[#c8d7e6] bg-white px-3 text-sm text-[#152033] outline-none focus:border-[#1776da] focus:shadow-[0_0_0_4px_rgba(23,118,218,0.13)]" value={privacy} onChange={(event) => setPrivacy(event.target.value)}>
          <option value="public">Public</option>
          <option value="friends">Friends</option>
          <option value="private">Private</option>
        </select>
        <div className="rounded-lg border border-[#dbe6f1] bg-[#f7fbff] p-3">
          <strong>{post.author?.fullName}</strong>
          <p className="mt-1">{post.content || "Media post"}</p>
        </div>
        {error ? <p className="my-3.5 rounded-md bg-[#ffe9eb] p-3 text-sm text-[#9f1b2a]">{error}</p> : null}
        <button className="rounded-md bg-[#176fd1] px-4 py-2 font-bold text-white disabled:opacity-60" type="submit" disabled={saving}>
          {saving ? "Sharing..." : "Share"}
        </button>
      </form>
    </div>
  );
}

export default ShareModal;
