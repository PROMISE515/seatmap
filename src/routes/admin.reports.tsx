import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Ban, Loader2, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import {
  blacklistPlace,
  getAdminComplaints,
  type AdminComplaintDTO,
} from "@/lib/reports.functions";

export const Route = createFileRoute("/admin/reports")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () => ({
    meta: [{ title: "SeatMap 举报后台" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminReportsPage,
});

function AdminReportsPage() {
  const { token } = Route.useSearch();
  const fetchComplaints = useServerFn(getAdminComplaints);
  const saveBlacklist = useServerFn(blacklistPlace);
  const [authorized, setAuthorized] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busyAmapId, setBusyAmapId] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<AdminComplaintDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchComplaints({ data: { token } });
      setAuthorized(result.authorized);
      setComplaints(result.complaints);
    } catch {
      setError("无法加载举报列表，请检查 Supabase migration 和 ADMIN_TOKEN。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleBlacklist = async (complaint: AdminComplaintDTO) => {
    if (!complaint.amapId) return;
    setBusyAmapId(complaint.amapId);
    setError(null);
    try {
      const result = await saveBlacklist({
        data: {
          token,
          amapId: complaint.amapId,
          placeName: complaint.toilet?.nameEn || complaint.toilet?.name || complaint.placeName,
          reason: "用户举报：该地点没有坐便",
        },
      });
      if (!result.authorized) {
        setAuthorized(false);
        return;
      }
      await load();
    } catch {
      setError("无法加入黑名单，请稍后重试。");
    } finally {
      setBusyAmapId(null);
    }
  };

  if (!authorized) {
    return (
      <main className="min-h-screen bg-surface px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-background p-6">
          <h1 className="text-xl font-extrabold text-brand-dark">需要后台访问权限</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            请使用 <code className="font-mono">?token=ADMIN_TOKEN</code> 打开这个页面。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">SeatMap 后台</p>
            <h1 className="mt-1 text-2xl font-extrabold text-brand-dark">地点举报</h1>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            刷新
          </button>
        </header>

        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            正在加载举报
          </div>
        ) : complaints.length === 0 ? (
          <div className="mt-8 rounded-lg border border-border bg-background p-6 text-sm text-muted-foreground">
            暂时没有举报。
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {complaints.map((complaint) => (
              <li
                key={complaint.id}
                className="rounded-lg border border-border bg-background p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-extrabold text-brand-dark">
                        {complaint.toilet?.nameEn || complaint.toilet?.name || complaint.placeName}
                      </h2>
                      {complaint.blacklisted ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-600/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-red-700">
                          <Ban className="size-3" aria-hidden />
                          已拉黑
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                          <ShieldAlert className="size-3" aria-hidden />
                          待核实
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {complaint.toilet?.address || "暂无地址"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>高德 ID：{complaint.amapId || "缺失"}</span>
                      <span>城市：{complaint.toilet?.city || "未知"}</span>
                      <span>
                        坐标：
                        {complaint.toilet?.lat && complaint.toilet?.lng
                          ? `${complaint.toilet.lat.toFixed(6)}, ${complaint.toilet.lng.toFixed(6)}`
                          : "未知"}
                      </span>
                      <span>举报时间：{new Date(complaint.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={
                      !complaint.amapId || complaint.blacklisted || busyAmapId === complaint.amapId
                    }
                    onClick={() => void handleBlacklist(complaint)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyAmapId === complaint.amapId ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Ban className="size-4" aria-hidden />
                    )}
                    加入黑名单
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
