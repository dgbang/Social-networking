import { useState } from "react";

function EditProfileModal({ user, onClose, onSave, onAvatar, onCover, saving }) {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [bio, setBio] = useState(user.bio || "");

  function submit(event) {
    event.preventDefault();
    onSave({ fullName, bio });
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 p-4">
      <section className="w-[min(560px,100%)] rounded-lg border border-[#c8d7e6] bg-white/95 p-4 shadow-[0_14px_34px_rgba(43,101,151,0.12)]" aria-modal="true" role="dialog">
        <div className="flex items-center justify-between gap-3">
          <h2>Edit profile</h2>
          <button className="grid min-h-8 min-w-8 place-items-center rounded-md bg-[#f4f8fc] px-2 text-[#536178]" type="button" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>
        <form className="grid gap-3" onSubmit={submit}>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            <span>Full name</span>
            <input className="min-h-10 w-full rounded-md border border-[#c8d7e6] bg-white px-3 text-sm text-[#152033] outline-none focus:border-[#1776da] focus:shadow-[0_0_0_4px_rgba(23,118,218,0.13)]" value={fullName} maxLength={80} onChange={(event) => setFullName(event.target.value)} />
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            <span>Bio</span>
            <textarea className="min-h-[104px] w-full resize-y rounded-md border border-[#c8d7e6] bg-white px-3 py-3 text-[#152033] outline-none focus:border-[#1776da] focus:shadow-[0_0_0_4px_rgba(23,118,218,0.13)]" value={bio} maxLength={300} onChange={(event) => setBio(event.target.value)} />
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            <span>Avatar</span>
            <input className="w-full rounded-md border border-[#c8d7e6] bg-white p-2 text-sm text-[#152033]" type="file" accept="image/*" onChange={(event) => onAvatar(event.target.files?.[0])} />
          </label>
          <label className="grid gap-1.5 text-[13px] font-bold text-[#475569]">
            <span>Cover</span>
            <input className="w-full rounded-md border border-[#c8d7e6] bg-white p-2 text-sm text-[#152033]" type="file" accept="image/*" onChange={(event) => onCover(event.target.files?.[0])} />
          </label>
          <button className="rounded-md bg-[#176fd1] px-4 py-2 font-bold text-white disabled:opacity-60" type="submit" disabled={saving}>
            Save
          </button>
        </form>
      </section>
    </div>
  );
}

export default EditProfileModal;
