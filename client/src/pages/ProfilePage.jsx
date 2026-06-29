import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getMyProfile, getUserProfile, updateMyProfile, uploadAvatar, uploadCover } from "../api/userApi.js";
import { ProfilePageSkeleton } from "../components/Common/Skeletons.jsx";
import EditProfileModal from "../components/profile/EditProfileModal.jsx";
import ProfileHeader from "../components/profile/ProfileHeader.jsx";
import UserPosts from "../components/posts/UserPosts.jsx";
import { setCredentials } from "../store/authSlice.js";
import { cropImageFile } from "../utils/imageCrop.js";

function ProfilePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const isOwner = !id || id === auth.user?.id;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const loader = isOwner ? getMyProfile : () => getUserProfile(id);
    loader()
      .then((user) => {
        if (active) setProfile(user);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Cannot load profile.");
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
      setError(err.response?.data?.message || "Cannot update profile.");
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
      setError(err.response?.data?.message || err.message || "Cannot upload avatar.");
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
      setError(err.response?.data?.message || err.message || "Cannot upload cover.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ProfilePageSkeleton />;
  if (error && !profile) return <section className="rounded-lg border border-[#c8d7e6] bg-white/95 p-4 text-[#9f1b2a] shadow-[0_14px_34px_rgba(43,101,151,0.12)]">{error}</section>;

  return (
    <div className="grid gap-4 pt-4">
      {error ? <p className="my-3.5 rounded-md bg-[#ffe9eb] p-3 text-sm text-[#9f1b2a]">{error}</p> : null}
      <ProfileHeader user={profile} isOwner={isOwner} onEdit={() => setEditing(true)} />
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
      <UserPosts userId={profile?.id} currentUser={auth.user} />
    </div>
  );
}

export default ProfilePage;
