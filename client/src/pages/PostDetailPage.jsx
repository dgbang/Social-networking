import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getPost, sharePost } from "../api/postApi.js";
import { PostCardSkeleton } from "../components/Common/Skeletons.jsx";
import PostCard from "../components/posts/PostCard.jsx";
import ShareModal from "../components/posts/ShareModal.jsx";

function PostDetailPage() {
  const { id } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareTarget, setShareTarget] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getPost(id)
      .then((result) => {
        if (active) setPost(result);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Khong tai duoc post.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleShare(target, payload) {
    await sharePost(target.id, payload);
    const fresh = await getPost(id);
    setPost(fresh);
  }

  if (loading) return <PostCardSkeleton />;
  if (error) return <section className="rounded-lg border border-[#c8d7e6] bg-white/95 p-4 text-[#9f1b2a] shadow-[0_14px_34px_rgba(43,101,151,0.12)]">{error}</section>;
  if (!post) return <section className="rounded-lg border border-[#c8d7e6] bg-white/95 p-4 shadow-[0_14px_34px_rgba(43,101,151,0.12)]">Post da bi xoa.</section>;

  return (
    <section className="grid gap-3.5">
      <PostCard
        post={post}
        currentUser={currentUser}
        onChanged={setPost}
        onDeleted={() => setPost(null)}
        onShare={setShareTarget}
      />
      {shareTarget ? <ShareModal post={shareTarget} onClose={() => setShareTarget(null)} onShare={handleShare} /> : null}
    </section>
  );
}

export default PostDetailPage;
