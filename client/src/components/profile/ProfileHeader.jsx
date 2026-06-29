function initial(user) {
  return user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "U";
}

function ProfileHeader({ user, isOwner, onEdit }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#c8d7e6] bg-white/95 shadow-[0_14px_34px_rgba(43,101,151,0.12)]">
      <div className="h-[clamp(190px,28vw,320px)] overflow-hidden rounded-t-lg bg-[linear-gradient(135deg,rgba(27,113,195,0.08),rgba(237,113,84,0.18)),#dff2fb]">
        {user.coverPhoto ? <img className="h-full w-full object-cover" src={user.coverPhoto} alt="" /> : null}
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] items-end gap-4 px-5 pb-4 max-[560px]:grid-cols-1 max-[560px]:justify-items-start">
        {user.avatar ? (
          <img className="-mt-[54px] grid h-[124px] w-[124px] place-items-center rounded-full border-4 border-white object-cover max-[560px]:-mt-[42px] max-[560px]:h-24 max-[560px]:w-24" src={user.avatar} alt="" />
        ) : (
          <span className="-mt-[54px] grid h-[124px] w-[124px] place-items-center rounded-full border-4 border-white bg-[linear-gradient(135deg,#66c1ff,#176fd1)] text-[40px] font-black text-white max-[560px]:-mt-[42px] max-[560px]:h-24 max-[560px]:w-24 max-[560px]:text-[32px]">{initial(user)}</span>
        )}
        <div>
          <h1 className="m-0">{user.fullName}</h1>
          <p className="mt-1 text-[#65758a]">@{user.username}</p>
          {user.email ? <p className="mt-1 text-[#65758a]">{user.email}</p> : null}
        </div>
        {isOwner ? (
          <button className="rounded-md bg-[#176fd1] px-4 py-2 font-bold text-white" type="button" onClick={onEdit}>
            Edit
          </button>
        ) : null}
      </div>
      {user.bio ? <p className="m-0 px-5 pb-5 text-[#334155]">{user.bio}</p> : <p className="m-0 px-5 pb-5 text-[#7d8da1]">No bio yet.</p>}
    </section>
  );
}

export default ProfileHeader;
