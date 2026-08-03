import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createConversation } from "../api/chatApi.js";
import {
  acceptFriendRequest,
  getFriendRelationship,
  rejectFriendRequest,
  sendFriendRequest
} from "../api/friendApi.js";
import { getMyProfile, getUserProfile, updateMyProfile, uploadAvatar, uploadCover } from "../api/userApi.js";
import { ProfilePageSkeleton } from "../components/Common/Skeletons.jsx";
import EditProfileModal from "../components/profile/EditProfileModal.jsx";
import ProfileHeader from "../components/profile/ProfileHeader.jsx";
import UserPosts from "../components/posts/UserPosts.jsx";
import { setCredentials } from "../store/authSlice.js";
import { cropImageFile } from "../utils/imageCrop.js";

function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [friendship, setFriendship] = useState(null);
  const [friendshipBusy, setFriendshipBusy] = useState(false);
  const [messageBusy, setMessageBusy] = useState(false);

  const isOwner = !id || id === auth.user?.id;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setProfile(null);
    setFriendship(null);
    const loader = isOwner
      ? async () => ({ user: await getMyProfile(), friendship: { status: "self", direction: null } })
      : async () => {
          const [user, relationship] = await Promise.all([getUserProfile(id), getFriendRelationship(id)]);
          return { user, friendship: relationship };
        };
    loader()
      .then((result) => {
        if (active) {
          setProfile(result.user);
          setFriendship(result.friendship);
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Không thể tải trang cá nhân.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isOwner]);

  function syncAuthUser(user) {
    if (isOwner && auth.accessToken) {
      dispatch(setCredentials({ accessToken: auth.accessToken, user }));
    }
  }

  async function handleSave(payload) {
    setSaving(true);
    setError("");
    try {
      const user = await updateMyProfile(payload);
      setProfile(user);
      syncAuthUser(user);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể cập nhật trang cá nhân.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatar(file) {
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      const cropped = await cropImageFile(file, 1, "avatar-cropped.jpg");
      const user = await uploadAvatar(cropped);
      setProfile(user);
      syncAuthUser(user);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không thể tải ảnh đại diện lên.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCover(file) {
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      const cropped = await cropImageFile(file, 3, "cover-cropped.jpg");
      const user = await uploadCover(cropped);
      setProfile(user);
      syncAuthUser(user);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không thể tải ảnh bìa lên.");
    } finally {
      setSaving(false);
    }
  }

  async function handleMessage() {
    if (!profile?.id) return;
    setMessageBusy(true);
    setError("");
    try {
      const conversation = await createConversation({ type: "private", memberIds: [profile.id] });
      navigate(`/messenger?conversationId=${conversation.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể mở cuộc trò chuyện.");
    } finally {
      setMessageBusy(false);
    }
  }

  async function handleAddFriend() {
    if (!profile?.id) return;
    setFriendshipBusy(true);
    setError("");
    try {
      const nextFriendship = await sendFriendRequest(profile.id);
      setFriendship({ id: nextFriendship.id, status: "pending", direction: "outgoing" });
    } catch (err) {
      setError(err.response?.data?.message || "Không thể gửi lời mời kết bạn.");
    } finally {
      setFriendshipBusy(false);
    }
  }

  async function handleAcceptFriend() {
    if (!profile?.id) return;
    setFriendshipBusy(true);
    setError("");
    try {
      const result = await acceptFriendRequest(profile.id);
      setFriendship({ id: result.friendship?.id, status: "accepted", direction: null });
    } catch (err) {
      setError(err.response?.data?.message || "Không thể chấp nhận lời mời kết bạn.");
    } finally {
      setFriendshipBusy(false);
    }
  }

  async function handleRejectFriend() {
    if (!profile?.id) return;
    setFriendshipBusy(true);
    setError("");
    try {
      await rejectFriendRequest(profile.id);
      setFriendship({ status: "none", direction: null });
    } catch (err) {
      setError(err.response?.data?.message || "Không thể từ chối lời mời kết bạn.");
    } finally {
      setFriendshipBusy(false);
    }
  }

  if (loading) return <ProfilePageSkeleton />;
  if (error && !profile) return <section className="rounded-lg border border-[#c8d7e6] bg-white/95 p-4 text-[#9f1b2a] shadow-[0_14px_34px_rgba(43,101,151,0.12)]">{error}</section>;

  return (
    <div className="grid gap-4 pt-4">
      {error ? <p className="my-3.5 rounded-md bg-[#ffe9eb] p-3 text-sm text-[#9f1b2a]">{error}</p> : null}
      <ProfileHeader
        user={profile}
        isOwner={isOwner}
        friendship={friendship}
        friendshipBusy={friendshipBusy}
        canMessage={!isOwner && friendship?.status === "accepted"}
        messageBusy={messageBusy}
        onEdit={() => setEditing(true)}
        onAddFriend={handleAddFriend}
        onAcceptFriend={handleAcceptFriend}
        onRejectFriend={handleRejectFriend}
        onMessage={handleMessage}
      />
      {editing ? (
        <EditProfileModal
          user={profile}
          onClose={() => setEditing(false)}
          onSave={handleSave}
          onAvatar={handleAvatar}
          onCover={handleCover}
          saving={saving}
        />
      ) : null}
      <div className="mx-auto w-full max-w-[680px]">
        <UserPosts userId={profile?.id} currentUser={auth.user} />
      </div>
    </div>
  );
}

export default ProfilePage;
