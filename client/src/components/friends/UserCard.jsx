import { Link } from "react-router-dom";

function initial(user) {
  return user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "U";
}

function UserCard({ user, actionLabel, onAction, secondaryLabel, onSecondaryAction, disabled }) {
  return (
    <article className="grid gap-3.5 rounded-lg border border-[#c8d7e6] bg-white/95 p-3.5 shadow-[0_14px_34px_rgba(43,101,151,0.12)]">
      <Link className="grid min-w-0 grid-cols-[auto_1fr] items-center gap-3" to={`/users/${user.id}`}>
        {user.avatar ? (
          <img className="grid h-12 w-12 place-items-center rounded-full object-cover" src={user.avatar} alt="" />
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[linear-gradient(135deg,#66c1ff,#176fd1)] font-black text-white">{initial(user)}</span>
        )}
        <span className="min-w-0">
          <strong className="block overflow-hidden text-ellipsis whitespace-nowrap">{user.fullName}</strong>
          <small className="mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap text-[#718096]">@{user.username}</small>
        </span>
      </Link>
      <div className="flex justify-end gap-2">
        {secondaryLabel ? (
          <button className="rounded-md bg-[#edf2f7] px-3 py-2 font-bold text-[#334155]" type="button" onClick={onSecondaryAction} disabled={disabled}>
            {secondaryLabel}
          </button>
        ) : null}
        {actionLabel ? (
          <button className="rounded-md bg-[#176fd1] px-3 py-2 font-bold text-white" type="button" onClick={onAction} disabled={disabled}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default UserCard;
