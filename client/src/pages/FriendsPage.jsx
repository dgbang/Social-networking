import { useEffect, useState } from "react";
import {
  acceptFriendRequest,
  getFriendRequests,
  getFriendSuggestions,
  getFriends,
  rejectFriendRequest,
  sendFriendRequest,
  unfriend
} from "../api/friendApi.js";
import { UserCardSkeleton } from "../components/Common/Skeletons.jsx";
import UserCard from "../components/friends/UserCard.jsx";

const tabs = ["friends", "requests", "suggestions"];

function FriendsPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load(tab = activeTab) {
    setLoading(true);
    setError("");
    try {
      let nextItems = [];
      if (tab === "friends") nextItems = await getFriends();
      if (tab === "requests") nextItems = await getFriendRequests();
      if (tab === "suggestions") nextItems = await getFriendSuggestions();
      setItems(nextItems);
    } catch (err) {
      setError(err.response?.data?.message || "Cannot load friends.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(activeTab);
  }, [activeTab]);

  async function runAction(userId, action) {
    setBusyId(userId);
    setError("");
    try {
      await action(userId);
      await load(activeTab);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    } finally {
      setBusyId("");
    }
  }

  const visibleItems = items.filter((item) => {
    const user = activeTab === "requests" ? item?.requester : item;
    return Boolean(user?.id);
  });

  return (
    <section className="grid gap-4 pt-4">
      <div className="flex items-center justify-between gap-3">
        <h1>Friends</h1>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              className={`rounded-lg border px-3 py-2 font-bold capitalize shadow-none ${
                activeTab === tab ? "border-[#176fd1] bg-[#176fd1] text-white" : "border-[#c8d7e6] bg-white text-[#405069]"
              }`}
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      {error ? <p className="my-3.5 rounded-md bg-[#ffe9eb] p-3 text-sm text-[#9f1b2a]">{error}</p> : null}
      {!loading && visibleItems.length === 0 ? <p className="rounded-lg border border-[#c8d7e6] bg-white/95 p-4 shadow-[0_14px_34px_rgba(43,101,151,0.12)]">Nothing here yet.</p> : null}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
        {loading ? <UserCardSkeleton /> : null}
        {visibleItems.map((item) => {
          const user = activeTab === "requests" ? item.requester : item;
          if (activeTab === "requests") {
            return (
              <UserCard
                key={item.id}
                user={user}
                actionLabel="Accept"
                secondaryLabel="Reject"
                onAction={() => runAction(user.id, acceptFriendRequest)}
                onSecondaryAction={() => runAction(user.id, rejectFriendRequest)}
                disabled={busyId === user.id}
              />
            );
          }
          if (activeTab === "suggestions") {
            return (
              <UserCard
                key={user.id}
                user={user}
                actionLabel="Add"
                onAction={() => runAction(user.id, sendFriendRequest)}
                disabled={busyId === user.id}
              />
            );
          }
          return (
            <UserCard
              key={user.id}
              user={user}
              actionLabel="Unfriend"
              onAction={() => runAction(user.id, unfriend)}
              disabled={busyId === user.id}
            />
          );
        })}
      </div>
    </section>
  );
}

export default FriendsPage;
