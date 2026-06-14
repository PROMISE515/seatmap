import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Ban, Check, Copy, Gift, Loader2, Pencil, Power, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createAdminInviteCode,
  getAdminInviteCodes,
  setAdminInviteCodeActive,
  setAdminInviteCodeLabel,
  type AdminInviteCodeDTO,
} from "@/lib/invite-codes.functions";
import {
  blacklistPlace,
  getAdminBlacklist,
  getAdminComplaints,
  type AdminBlacklistDTO,
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
  const fetchBlacklist = useServerFn(getAdminBlacklist);
  const saveBlacklist = useServerFn(blacklistPlace);
  const fetchInviteCodes = useServerFn(getAdminInviteCodes);
  const createInviteCode = useServerFn(createAdminInviteCode);
  const updateInviteCodeActive = useServerFn(setAdminInviteCodeActive);
  const updateInviteCodeLabel = useServerFn(setAdminInviteCodeLabel);
  const [authorized, setAuthorized] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busyAmapId, setBusyAmapId] = useState<string | null>(null);
  const [busyInviteId, setBusyInviteId] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<AdminComplaintDTO[]>([]);
  const [blacklist, setBlacklist] = useState<AdminBlacklistDTO[]>([]);
  const [inviteCodes, setInviteCodes] = useState<AdminInviteCodeDTO[]>([]);
  const [newInviteLabel, setNewInviteLabel] = useState("");
  const [newInvitePassDays, setNewInvitePassDays] = useState(36500);
  const [newInviteMaxRedemptions, setNewInviteMaxRedemptions] = useState(1);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [copiedInviteCode, setCopiedInviteCode] = useState<string | null>(null);
  const [editingInviteId, setEditingInviteId] = useState<string | null>(null);
  const [editingInviteLabel, setEditingInviteLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [complaintResult, blacklistResult, inviteResult] = await Promise.all([
        fetchComplaints({ data: { token } }),
        fetchBlacklist({ data: { token } }),
        fetchInviteCodes({ data: { token } }),
      ]);
      setAuthorized(
        complaintResult.authorized && blacklistResult.authorized && inviteResult.authorized,
      );
      setComplaints(complaintResult.complaints);
      setBlacklist(blacklistResult.blacklist);
      setInviteCodes(inviteResult.inviteCodes);
    } catch {
      setError("无法加载举报列表，请检查 Supabase migration 和 ADMIN_TOKEN。");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingInvite(true);
    setError(null);
    try {
      const result = await createInviteCode({
        data: {
          token,
          label: newInviteLabel,
          passDays: newInvitePassDays,
          maxRedemptions: newInviteMaxRedemptions,
          active: true,
        },
      });
      if (!result.authorized) {
        setAuthorized(false);
        return;
      }
      if (result.inviteCode?.code) {
        setCreatedInviteCode(result.inviteCode.code);
      }
      setNewInviteLabel("");
      setNewInvitePassDays(36500);
      setNewInviteMaxRedemptions(1);
      await load();
    } catch {
      setError("无法创建邀请码，请检查是否重复或字段格式是否正确。");
    } finally {
      setCreatingInvite(false);
    }
  };

  const startEditInviteLabel = (inviteCode: AdminInviteCodeDTO) => {
    setEditingInviteId(inviteCode.id);
    setEditingInviteLabel(inviteCode.label);
  };

  const handleSaveInviteLabel = async (inviteCode: AdminInviteCodeDTO) => {
    setBusyInviteId(inviteCode.id);
    setError(null);
    try {
      const result = await updateInviteCodeLabel({
        data: { token, id: inviteCode.id, label: editingInviteLabel },
      });
      if (!result.authorized) {
        setAuthorized(false);
        return;
      }
      setEditingInviteId(null);
      setEditingInviteLabel("");
      await load();
    } catch {
      setError("无法更新邀请码备注，请稍后重试。");
    } finally {
      setBusyInviteId(null);
    }
  };

  const handleCopyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedInviteCode(code);
      window.setTimeout(() => setCopiedInviteCode(null), 1600);
    } catch {
      setError("复制失败，请手动复制邀请码。");
    }
  };

  const handleToggleInviteActive = async (inviteCode: AdminInviteCodeDTO) => {
    setBusyInviteId(inviteCode.id);
    setError(null);
    try {
      const result = await updateInviteCodeActive({
        data: { token, id: inviteCode.id, active: !inviteCode.active },
      });
      if (!result.authorized) {
        setAuthorized(false);
        return;
      }
      await load();
    } catch {
      setError("无法更新邀请码状态，请稍后重试。");
    } finally {
      setBusyInviteId(null);
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
          placeName: complaint.toilet?.name || complaint.placeName,
          reason:
            complaint.reason === "no_nursery_room"
              ? "用户举报：该地点没有母婴室"
              : "用户举报：该地点没有坐便",
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

  const complaintReasonLabel = (reason: AdminComplaintDTO["reason"]) => {
    if (reason === "no_nursery_room") return "没有母婴室";
    if (reason === "no_seated_toilet") return "没有坐便";
    return "其他";
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
        ) : (
          <>
            <section className="mt-8 rounded-lg border border-border bg-background p-4 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    邀请码管理
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold text-brand-dark">邀请码</h2>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {inviteCodes.length} 个邀请码
                </span>
              </div>

              <form
                onSubmit={(event) => void handleCreateInvite(event)}
                className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto]"
              >
                <label className="grid gap-1 text-xs font-bold text-muted-foreground">
                  备注（选填）
                  <input
                    value={newInviteLabel}
                    onChange={(event) => setNewInviteLabel(event.target.value)}
                    placeholder="例如 Anna 终身体验码"
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                </label>
                <label className="grid gap-1 text-xs font-bold text-muted-foreground">
                  会员天数
                  <input
                    type="number"
                    min={1}
                    max={36500}
                    value={newInvitePassDays}
                    onChange={(event) => setNewInvitePassDays(Number(event.target.value))}
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                </label>
                <label className="grid gap-1 text-xs font-bold text-muted-foreground">
                  兑换次数
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={newInviteMaxRedemptions}
                    onChange={(event) => setNewInviteMaxRedemptions(Number(event.target.value))}
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                </label>
                <button
                  type="submit"
                  disabled={creatingInvite}
                  className="inline-flex items-center justify-center gap-2 self-end rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
                >
                  {creatingInvite ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Gift className="size-4" aria-hidden />
                  )}
                  添加
                </button>
              </form>

              {createdInviteCode && (
                <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    新邀请码已生成
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <code className="rounded-md bg-background px-3 py-2 font-mono text-base font-extrabold text-brand-dark">
                      {createdInviteCode}
                    </code>
                    <button
                      type="button"
                      onClick={() => void handleCopyInviteCode(createdInviteCode)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-dark px-4 py-2 text-sm font-bold text-primary-foreground"
                    >
                      {copiedInviteCode === createdInviteCode ? (
                        <Check className="size-4" aria-hidden />
                      ) : (
                        <Copy className="size-4" aria-hidden />
                      )}
                      {copiedInviteCode === createdInviteCode ? "已复制" : "复制"}
                    </button>
                  </div>
                </div>
              )}

              {inviteCodes.length === 0 ? (
                <div className="mt-4 rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
                  暂时没有邀请码。
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
                  {inviteCodes.map((inviteCode) => (
                    <li key={inviteCode.id} className="bg-surface p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">
                                邀请码
                              </span>
                              <h3 className="font-mono text-sm font-extrabold text-brand-dark">
                                {inviteCode.code}
                              </h3>
                            </div>
                            <span
                              className={`rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${
                                inviteCode.active
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {inviteCode.active ? "启用中" : "已停用"}
                            </span>
                            <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-700">
                              会员天数：
                              {inviteCode.passDays >= 36500 ? "终身" : `${inviteCode.passDays} 天`}
                            </span>
                          </div>
                          {editingInviteId === inviteCode.id ? (
                            <div className="mt-2 flex max-w-xl flex-wrap gap-2">
                              <input
                                value={editingInviteLabel}
                                onChange={(event) => setEditingInviteLabel(event.target.value)}
                                placeholder="备注可为空"
                                className="min-w-52 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                              />
                              <button
                                type="button"
                                disabled={busyInviteId === inviteCode.id}
                                onClick={() => void handleSaveInviteLabel(inviteCode)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
                              >
                                {busyInviteId === inviteCode.id ? (
                                  <Loader2 className="size-4 animate-spin" aria-hidden />
                                ) : (
                                  <Check className="size-4" aria-hidden />
                                )}
                                保存
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingInviteId(null);
                                  setEditingInviteLabel("");
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold text-muted-foreground hover:text-foreground"
                              >
                                <X className="size-4" aria-hidden />
                                取消
                              </button>
                            </div>
                          ) : (
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <p className="text-sm text-muted-foreground">
                                备注：{inviteCode.label || "无"}
                              </p>
                              <button
                                type="button"
                                onClick={() => startEditInviteLabel(inviteCode)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-brand-dark"
                              >
                                <Pencil className="size-3" aria-hidden />
                                编辑备注
                              </button>
                            </div>
                          )}
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>已兑换次数：{inviteCode.redeemedCount}</span>
                            <span>兑换上限：{inviteCode.maxRedemptions}</span>
                            <span>
                              最近兑换：
                              {inviteCode.lastRedeemedAt
                                ? new Date(inviteCode.lastRedeemedAt).toLocaleString()
                                : "暂无"}
                            </span>
                            <span>创建时间：{new Date(inviteCode.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void handleCopyInviteCode(inviteCode.code)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold text-muted-foreground hover:text-foreground"
                          >
                            {copiedInviteCode === inviteCode.code ? (
                              <Check className="size-4" aria-hidden />
                            ) : (
                              <Copy className="size-4" aria-hidden />
                            )}
                            {copiedInviteCode === inviteCode.code ? "已复制" : "复制"}
                          </button>
                          <button
                            type="button"
                            disabled={busyInviteId === inviteCode.id}
                            onClick={() => void handleToggleInviteActive(inviteCode)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold text-muted-foreground hover:text-foreground disabled:opacity-50"
                          >
                            {busyInviteId === inviteCode.id ? (
                              <Loader2 className="size-4 animate-spin" aria-hidden />
                            ) : (
                              <Power className="size-4" aria-hidden />
                            )}
                            {inviteCode.active ? "停用" : "启用"}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {complaints.length === 0 ? (
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
                            {complaint.toilet?.name || complaint.placeName}
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
                        <p className="mt-2 text-sm font-semibold text-foreground">
                          举报原因：{complaintReasonLabel(complaint.reason)}
                        </p>
                        {complaint.description && (
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            描述：{complaint.description}
                          </p>
                        )}
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
                          !complaint.amapId ||
                          complaint.blacklisted ||
                          busyAmapId === complaint.amapId
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
          </>
        )}

        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">黑名单</p>
              <h2 className="mt-1 text-xl font-extrabold text-brand-dark">黑名单册</h2>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">
              {blacklist.length} 个地点
            </span>
          </div>

          {blacklist.length === 0 ? (
            <div className="mt-4 rounded-lg border border-border bg-background p-6 text-sm text-muted-foreground">
              暂时没有黑名单地点。
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {blacklist.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-border bg-background p-4 text-sm shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-brand-dark">{item.placeName}</h3>
                      <p className="mt-1 text-muted-foreground">{item.reason || "未填写原因"}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>高德 ID：{item.amapId}</div>
                      <div>拉黑时间：{new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
