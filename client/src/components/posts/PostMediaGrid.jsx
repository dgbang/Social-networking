function PostMediaGrid({ media = [] }) {
  if (!media.length) return null;

  const count = Math.min(media.length, 4);
  if (count === 1) {
    const item = media[0];

    return (
      <div className="mt-0 overflow-hidden bg-black">
        {item.type === "video" ? (
          <video
            className="block h-auto w-full bg-black"
            src={item.url}
            controls
            preload="metadata"
          />
        ) : (
          <img
            className="block h-auto w-full bg-black"
            src={item.url}
            alt=""
            loading="lazy"
          />
        )}
      </div>
    );
  }

  const gridClass = "grid-cols-2";
  const itemClass = "aspect-square min-h-0 [&_img]:object-cover [&_video]:object-cover";

  return (
    <div className={`mt-0 grid gap-0.5 bg-white ${gridClass}`}>
      {media.slice(0, 4).map((item, index) => (
        <div
          className={`relative overflow-hidden bg-[#f0f2f5] ${itemClass} [&_img]:block [&_img]:h-full [&_img]:min-h-[inherit] [&_img]:w-full [&_img]:bg-black [&_video]:block [&_video]:h-full [&_video]:min-h-[inherit] [&_video]:w-full [&_video]:bg-black`}
          key={item.publicId || item.url || index}
        >
          {item.type === "video" ? (
            <video src={item.url} controls preload="metadata" />
          ) : (
            <img src={item.url} alt="" loading="lazy" />
          )}
          {index === 3 && media.length > 4 ? (
            <span className="absolute inset-0 grid place-items-center bg-[rgba(18,32,51,0.56)] text-[28px] font-black text-white">
              +{media.length - 4}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default PostMediaGrid;
