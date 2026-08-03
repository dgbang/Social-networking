import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Alert, Avatar, Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { createComment, deleteComment, getComments } from "../../api/postApi.js";
import { CommentListSkeleton } from "../Common/Skeletons.jsx";

function CommentSection({ postId, currentUser, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    getComments(postId)
      .then((result) => {
        if (active) setComments(result.comments);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "Không thể tải bình luận.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [postId]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim()) return;
    setError("");

    try {
      const comment = await createComment(postId, {
        content,
        parentId: replyTo?.id || null
      });
      setComments((items) => [...items, comment]);
      setContent("");
      setReplyTo(null);
      onCountChange?.(1);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể đăng bình luận.");
    }
  }

  async function handleDelete(commentId) {
    try {
      await deleteComment(commentId);
      setComments((items) => items.filter((comment) => comment.id !== commentId));
      onCountChange?.(-1);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể xóa bình luận.");
    }
  }

  return (
    <Box className="mx-3.5 mt-0 grid gap-2.5 border-t border-[#ced0d4] py-3.5">
      {loading ? <CommentListSkeleton /> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Stack spacing={1}>
        {comments.map((comment) => (
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            key={comment.id}
            className={comment.parentId ? "ml-10" : ""}
          >
            <Avatar src={comment.author?.avatar || undefined} alt={comment.author?.fullName || "Người dùng"} className="!h-8 !w-8">
              {comment.author?.fullName?.charAt(0).toUpperCase() || "U"}
            </Avatar>
            <Box className="max-w-full">
              <Box className="rounded-2xl bg-[#f0f2f5] px-3 py-2">
                <Typography variant="subtitle2" className="!text-[13px]">
                  {comment.author?.fullName || "Người dùng không xác định"}
                </Typography>
                <Typography variant="body2">{comment.content}</Typography>
              </Box>
              <Stack direction="row" spacing={1} className="ml-3 mt-1">
                <Button size="small" variant="text" onClick={() => setReplyTo(comment)}>
                  Trả lời
                </Button>
                {comment.userId === currentUser?.id ? (
                  <Button size="small" variant="text" color="error" onClick={() => handleDelete(comment.id)}>
                    Xóa
                  </Button>
                ) : null}
              </Stack>
            </Box>
          </Stack>
        ))}
        {!loading && comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Chưa có bình luận nào.
          </Typography>
        ) : null}
      </Stack>

      {replyTo ? (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => setReplyTo(null)}>
              Hủy
            </Button>
          }
        >
          Đang trả lời {replyTo.author?.fullName || "bình luận"}
        </Alert>
      ) : null}

      <Stack component="form" direction="row" spacing={1} alignItems="center" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          size="small"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Viết bình luận..."
        />
        <IconButton type="submit" color="primary" aria-label="Gửi bình luận">
          <SendRoundedIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default CommentSection;
