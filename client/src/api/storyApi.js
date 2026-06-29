import api from "./axios.js";

function storyForm(file, payload = {}) {
  const form = new FormData();
  form.append("media", file);
  if (payload.text !== undefined) {
    form.append("text", payload.text);
  }
  return form;
}

export async function createStory(file, payload = {}) {
  const res = await api.post("/stories", storyForm(file, payload));
  return res.data.data.story;
}

export async function getStoryFeed(params = {}) {
  const res = await api.get("/stories/feed", { params });
  return res.data.data.groups;
}

export async function markStoryViewed(id) {
  const res = await api.post(`/stories/${id}/view`);
  return res.data.data.story;
}

export async function deleteStory(id) {
  await api.delete(`/stories/${id}`);
}
