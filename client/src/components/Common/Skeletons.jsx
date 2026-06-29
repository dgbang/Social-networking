import { Box, Card, Paper, Skeleton, Stack } from "@mui/material";

function Lines({ widths = ["70%", "52%"] }) {
  return widths.map((width, index) => (
    <Skeleton
      height={18}
      key={`${width}-${index}`}
      sx={{ borderRadius: 1, width }}
      variant="rectangular"
    />
  ));
}

export function PostCardSkeleton({ mediaHeight = 340 }) {
  return (
    <Card className="overflow-hidden !rounded-lg !border !border-[#dce1e7] !bg-white !shadow-[0_1px_2px_rgba(20,32,45,0.12)]">
      <Stack direction="row" spacing={1.5} alignItems="center" className="p-3.5">
        <Skeleton variant="circular" width={40} height={40} />
        <Box className="min-w-0 flex-1">
          <Lines widths={["34%", "22%"]} />
        </Box>
        <Skeleton variant="circular" width={32} height={32} />
      </Stack>
      <Box className="px-4 pb-3">
        <Lines widths={["86%", "62%"]} />
      </Box>
      <Skeleton
        variant="rectangular"
        height={mediaHeight}
        sx={{ bgcolor: "#eef1f5" }}
      />
      <Stack direction="row" justifyContent="space-between" className="px-4 py-3">
        <Skeleton width={120} height={22} />
        <Skeleton width={180} height={22} />
      </Stack>
      <Box className="mx-4 border-t border-[#e4e6eb]" />
      <Stack direction="row" spacing={1} className="px-4 py-2">
        <Skeleton className="flex-1" height={38} sx={{ borderRadius: 1 }} />
        <Skeleton className="flex-1" height={38} sx={{ borderRadius: 1 }} />
        <Skeleton className="flex-1" height={38} sx={{ borderRadius: 1 }} />
      </Stack>
    </Card>
  );
}

export function StoryTilesSkeleton({ count = 4 }) {
  return Array.from({ length: count }).map((_, index) => (
    <Box
      className="relative min-h-[168px] w-28 min-w-28 overflow-hidden rounded-lg bg-[#eef1f5]"
      key={`story-skeleton-${index}`}
    >
      <Skeleton variant="rectangular" width="100%" height={168} />
      <Skeleton
        variant="circular"
        width={38}
        height={38}
        className="!absolute !left-2.5 !top-2.5"
      />
      <Box className="absolute bottom-2.5 left-2.5 right-2.5">
        <Skeleton width="86%" height={16} sx={{ bgcolor: "rgba(255,255,255,0.55)" }} />
      </Box>
    </Box>
  ));
}

export function ProfilePageSkeleton() {
  return (
    <section className="overflow-hidden rounded-lg border border-[#c8d7e6] bg-white/95 shadow-[0_14px_34px_rgba(43,101,151,0.12)]">
      <Skeleton variant="rectangular" className="h-[clamp(190px,28vw,320px)]" />
      <Box className="grid grid-cols-[auto_1fr_auto] items-end gap-4 px-5 pb-4 max-[560px]:grid-cols-1">
        <Skeleton variant="circular" width={124} height={124} className="-mt-[54px]" />
        <Box className="min-w-0 pb-2">
          <Skeleton width="36%" height={34} />
          <Skeleton width="24%" height={22} />
          <Skeleton width="32%" height={22} />
        </Box>
        <Skeleton width={88} height={38} sx={{ borderRadius: 1 }} />
      </Box>
      <Box className="px-5 pb-5">
        <Skeleton width="68%" height={20} />
      </Box>
    </section>
  );
}

export function UserCardSkeleton({ count = 6 }) {
  return Array.from({ length: count }).map((_, index) => (
    <article
      className="grid gap-3.5 rounded-lg border border-[#c8d7e6] bg-white/95 p-3.5 shadow-[0_14px_34px_rgba(43,101,151,0.12)]"
      key={`user-card-skeleton-${index}`}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Skeleton variant="circular" width={48} height={48} />
        <Box className="min-w-0 flex-1">
          <Skeleton width="58%" height={22} />
          <Skeleton width="42%" height={18} />
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Skeleton width={76} height={38} sx={{ borderRadius: 1 }} />
        <Skeleton width={86} height={38} sx={{ borderRadius: 1 }} />
      </Stack>
    </article>
  ));
}

export function ConversationListSkeleton({ count = 7 }) {
  return (
    <Stack spacing={0.75} className="p-1.5">
      {Array.from({ length: count }).map((_, index) => (
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          className="rounded-lg p-2"
          key={`conversation-skeleton-${index}`}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box className="min-w-0 flex-1">
            <Skeleton width="62%" height={22} />
            <Skeleton width="78%" height={18} />
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

export function ChatMessagesSkeleton() {
  return (
    <Stack spacing={1.25}>
      <Skeleton width="46%" height={42} sx={{ borderRadius: 4 }} />
      <Skeleton width="58%" height={52} sx={{ borderRadius: 4, alignSelf: "flex-end" }} />
      <Skeleton width="40%" height={42} sx={{ borderRadius: 4 }} />
      <Skeleton width="64%" height={58} sx={{ borderRadius: 4, alignSelf: "flex-end" }} />
    </Stack>
  );
}

export function CommentListSkeleton({ count = 2 }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: count }).map((_, index) => (
        <Stack direction="row" spacing={1} alignItems="flex-start" key={`comment-skeleton-${index}`}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box className="min-w-0 flex-1 rounded-2xl bg-[#f0f2f5] px-3 py-2">
            <Skeleton width="34%" height={18} />
            <Skeleton width="72%" height={18} />
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

export function PostDetailModalSkeleton() {
  return (
    <Box
      className="grid h-full min-h-0"
      sx={{
        gridTemplateColumns: "minmax(0, 1fr) clamp(360px, 32%, 430px)",
        gridTemplateRows: "minmax(0, 1fr)",
        "@media (max-width: 820px)": {
          gridTemplateColumns: "minmax(0, 1fr)",
          gridTemplateRows: "minmax(0, 58%) minmax(0, 42%)",
        },
      }}
    >
      <Box className="grid min-h-0 place-items-center bg-black p-8">
        <Skeleton variant="rectangular" width="46%" height="76%" sx={{ bgcolor: "#1f2937" }} />
      </Box>
      <Box className="flex min-h-0 flex-col bg-[#f0f2f5]">
        <Box className="relative grid h-16 shrink-0 place-items-center border-b border-[#e4e6eb] bg-white px-16">
          <Skeleton width="46%" height={34} />
          <Skeleton variant="circular" width={48} height={48} className="!absolute !right-4 !top-2" />
        </Box>
        <Box className="min-h-0 flex-1 overflow-hidden p-3">
          <Paper className="!rounded-lg !border !border-[#dce1e7] !p-4" elevation={0}>
            <Stack direction="row" spacing={1.5} alignItems="center" className="mb-4">
              <Skeleton variant="circular" width={48} height={48} />
              <Box className="flex-1">
                <Skeleton width="54%" height={24} />
                <Skeleton width="38%" height={18} />
              </Box>
            </Stack>
            <Skeleton width="44%" height={24} />
            <Skeleton width="76%" height={18} />
            <Skeleton width="60%" height={18} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
