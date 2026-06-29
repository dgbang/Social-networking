import api from "./axios.js";

function postForm(payload = {}, files = []) {
  const form = new FormData();
  if (payload.content !== undefined) form.append("content", payload.content);
  if (payload.privacy) form.append("privacy", payload.privacy);
  files.forEach((file) => form.append("media", file));
  return form;
}

export async function createPost(payload, files = []) {
  const hasFiles = files.length > 0;
  const res = await api.post("/posts", hasFiles ? postForm(payload, files) : payload, {
    headers: hasFiles ? { "Content-Type": "multipart/form-data" } : undefined
  });
  return res.data.data.post;
}

export async function getFeed(params = {}) {
  const res = await api.get("/posts/feed", { params });
  return {
    posts: res.data.data.posts,
    nextCursor: res.data.meta.nextCursor,
    hasMore: res.data.meta.hasMore
  };
}

export async function getUserPosts(userId, params = {}) {
  const res = await api.get(`/users/${userId}/posts`, { params });
  return {
    posts: res.data.data.posts,
    nextCursor: res.data.meta.nextCursor,
    hasMore: res.data.meta.hasMore
  };
}

export async function getPost(id) {
  const res = await api.get(`/posts/${id}`);
  return res.data.data.post;
}

export async function updatePost(id, payload, files = []) {
  const hasFiles = files.length > 0;
  const res = await api.put(`/posts/${id}`, hasFiles ? postForm(payload, files) : payload, {
    headers: hasFiles ? { "Content-Type": "multipart/form-data" } : undefined
  });
  return res.data.data.post;
}

export async function deletePost(id) {
  await api.delete(`/posts/${id}`);
}

export async function reactToPost(id, type = "like") {
  const res = await api.post(`/posts/${id}/like`, { type });
  return res.data.data;
}

export async function getComments(postId, params = {}) {
  const res = await api.get(`/posts/${postId}/comments`, { params });
  return {
    comments: res.data.data.comments,
    nextCursor: res.data.meta.nextCursor,
    hasMore: res.data.meta.hasMore
  };
}

export async function createComment(postId, payload) {
  const res = await api.post(`/posts/${postId}/comments`, payload);
  return res.data.data.comment;
}

export async function deleteComment(id) {
  await api.delete(`/comments/${id}`);
}

export async function sharePost(id, payload) {
  const res = await api.post(`/posts/${id}/share`, payload);
  return res.data.data.post;
}
