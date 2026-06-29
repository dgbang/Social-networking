function Notice({ type = "info", children }) {
  if (!children) return null;

  const toneClass =
    type === "success"
      ? "bg-[#e4f8eb] text-[#136838]"
      : type === "error"
        ? "bg-[#ffe9eb] text-[#9f1b2a]"
        : "bg-[#e8f4ff] text-[#0d4e85]";

  return <div className={`my-3.5 rounded-md p-3 text-sm ${toneClass}`}>{children}</div>;
}

export default Notice;
