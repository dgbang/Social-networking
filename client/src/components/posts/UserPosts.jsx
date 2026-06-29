import { useEffect, useState } from "react";
import { getUserPosts, sharePost } from "../../api/postApi.js";
import { PostCardSkeleton } from "../Common/Skeletons.jsx";
import PostCard from "./PostCard.jsx";
import ShareModal from "./ShareModal.jsx";

function UserPosts({ userId, currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareTarget, setShareTarget] = useState(null);

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    setLoading(true);
    setError("");
    getUserPosts(userId)
      .then((result) => {
        if (active) setPosts(result.posts);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Khong tai duoc posts.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  async function handleShare(post, payload) {
    const shared = await sharePost(post.id, payload);
    if (shared.userId === userId) {
      setPosts((items) => [shared, ...items]);
    }
  }

  return (
    <section className="grid gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <h2>Posts</h2>
      </div>
      {loading
        ? [0, 1].map((item) => <PostCardSkeleton key={item} />)
        : null}
      {error ? <p className="my-3.5 rounded-md bg-[#ffe9eb] p-3 text-sm text-[#9f1b2a]">{error}</p> : null}
      {!loading && posts.length === 0 ? <section className="rounded-lg border border-[#c8d7e6] bg-white/95 p-4 shadow-[0_14px_34px_rgba(43,101,151,0.12)]">Chua co post nao de hien thi.</section> : null}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onChanged={(next) => setPosts((items) => items.map((item) => (item.id === next.id ? next : item)))}
          onDeleted={(id) => setPosts((items) => items.filter((item) => item.id !== id))}
          onShare={setShareTarget}
        />
      ))}
      {shareTarget ? <ShareModal post={shareTarget} onClose={() => setShareTarget(null)} onShare={handleShare} /> : null}
    </section>
  );
}

export default UserPosts;
