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
    meta: [{ title: "SeatMap Complaints Admin" }, { name: "robots", content: "noindex" }],
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
      setError("Could not load complaints. Check Supabase migrations and ADMIN_TOKEN.");
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
          reason: "User complaint: no seated toilet",
        },
      });
      if (!result.authorized) {
        setAuthorized(false);
        return;
      }
      await load();
    } catch {
      setError("Could not add this place to blacklist.");
    } finally {
      setBusyAmapId(null);
    }
  };

  if (!authorized) {
    return (
      <main className="min-h-screen bg-surface px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-background p-6">
          <h1 className="text-xl font-extrabold text-brand-dark">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Open this page with <code className="font-mono">?token=ADMIN_TOKEN</code>.
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
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              SeatMap Admin
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-brand-dark">Place complaints</h1>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            Refresh
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
            Loading complaints
          </div>
        ) : complaints.length === 0 ? (
          <div className="mt-8 rounded-lg border border-border bg-background p-6 text-sm text-muted-foreground">
            No complaints yet.
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
                          Blacklisted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                          <ShieldAlert className="size-3" aria-hidden />
                          Needs review
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {complaint.toilet?.address || "No address saved"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>AMap: {complaint.amapId || "missing"}</span>
                      <span>City: {complaint.toilet?.city || "unknown"}</span>
                      <span>
                        Coords:{" "}
                        {complaint.toilet?.lat && complaint.toilet?.lng
                          ? `${complaint.toilet.lat.toFixed(6)}, ${complaint.toilet.lng.toFixed(6)}`
                          : "unknown"}
                      </span>
                      <span>{new Date(complaint.createdAt).toLocaleString()}</span>
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
                    Add to blacklist
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
