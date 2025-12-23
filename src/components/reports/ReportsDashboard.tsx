"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ReportTargetType = "ad" | "user" | string;

export interface AdminReport {
  id: string;
  created_at: string | null;
  target_type: ReportTargetType;
  ad_id: string | null;
  reported_user_id: string | null;
  reporter_id: string | null;
  reporter_email: string | null;
  reporter_name: string | null;
  reason: string | null;
  status: string | null;
}

interface ModeratorInfo {
  id: string | null;
  email: string | null;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function getStatusMeta(status: string | null): {
  label: string;
  tone: "open" | "dismissed" | "resolved" | "other";
} {
  const normalized = (status ?? "").toLowerCase();

  if (!normalized || normalized === "open") {
    return { label: "Open", tone: "open" };
  }

  if (normalized === "dismissed") {
    return { label: "Dismissed", tone: "dismissed" };
  }

  if (normalized === "resolved") {
    return { label: "Resolved", tone: "resolved" };
  }

  return { label: status ?? "Unknown", tone: "other" };
}

function getStatusBadgeClasses(tone: "open" | "dismissed" | "resolved" | "other"): string {
  if (tone === "open") {
    return "border-amber-400/60 bg-amber-500/10 text-amber-100";
  }

  if (tone === "dismissed") {
    return "border-zinc-600 bg-zinc-900 text-zinc-200";
  }

  if (tone === "resolved") {
    return "border-emerald-500/60 bg-emerald-500/10 text-emerald-100";
  }

  return "border-zinc-600 bg-zinc-900 text-zinc-200";
}

function getTargetLabel(report: AdminReport): string {
  const type = (report.target_type ?? "").toLowerCase();

  if (type === "ad") {
    if (report.ad_id) {
      return `Ad ${report.ad_id.slice(0, 6)}`;
    }
    return "Ad";
  }

  if (type === "user") {
    if (report.reported_user_id) {
      return `User ${report.reported_user_id.slice(0, 6)}`;
    }
    return "User";
  }

  return type || "Unknown";
}

export function ReportsDashboard() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [moderator, setModerator] = useState<ModeratorInfo>({
    id: null,
    email: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!cancelled) {
          setModerator({
            id: user?.id ?? null,
            email: user?.email ?? null,
          });
        }

        const { data, error: reportsError } = await supabase
          .from("reports")
          .select(
            "id, created_at, target_type, ad_id, reported_user_id, reporter_id, reporter_email, reporter_name, reason, status",
          )
          .order("created_at", { ascending: false })
          .returns<AdminReport[]>();

        if (reportsError) {
          throw reportsError;
        }

        if (!cancelled) {
          setReports(data ?? []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load reports.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function logModerationAction(
    actionType: string,
    report: AdminReport,
  ): Promise<void> {
    const payload = {
      action_type: actionType,
      report_id: report.id,
      target_type: report.target_type,
      target_ad_id: report.ad_id,
      target_user_id: report.reported_user_id,
      moderator_id: moderator.id,
      moderator_email: moderator.email,
    };

    const { error: logError } = await supabase
      .from("moderation_logs")
      .insert(payload);

    if (logError) {
      console.error("Failed to log moderation action", logError);
    }
  }

  async function handleDismiss(report: AdminReport) {
    setMutatingId(report.id);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("reports")
        .update({ status: "dismissed" })
        .eq("id", report.id);

      if (updateError) {
        throw updateError;
      }

      await logModerationAction("dismiss_report", report);

      setReports((prev) =>
        prev.map((item) =>
          item.id === report.id ? { ...item, status: "dismissed" } : item,
        ),
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to dismiss report.");
    } finally {
      setMutatingId(null);
    }
  }

  async function handleRemoveAd(report: AdminReport) {
    if ((report.target_type ?? "").toLowerCase() !== "ad" || !report.ad_id) {
      setError("This report is not linked to an ad that can be removed.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to remove this ad? This will mark the ad as deleted.",
      )
    ) {
      return;
    }

    setMutatingId(report.id);
    setError(null);

    try {
      const { error: adError } = await supabase
        .from("ads")
        .update({ status: "deleted" })
        .eq("id", report.ad_id);

      if (adError) {
        throw adError;
      }

      const { error: reportError } = await supabase
        .from("reports")
        .update({ status: "resolved" })
        .eq("id", report.id);

      if (reportError) {
        throw reportError;
      }

      await logModerationAction("remove_ad", report);

      setReports((prev) =>
        prev.map((item) =>
          item.id === report.id ? { ...item, status: "resolved" } : item,
        ),
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to remove ad for this report.");
    } finally {
      setMutatingId(null);
    }
  }

  async function handleWarnUser(report: AdminReport) {
    if (!report.reported_user_id) {
      setError("This report is not associated with a user to warn.");
      return;
    }

    setMutatingId(report.id);
    setError(null);

    try {
      const { error: reportError } = await supabase
        .from("reports")
        .update({ status: "resolved" })
        .eq("id", report.id);

      if (reportError) {
        throw reportError;
      }

      await logModerationAction("warn_user", report);

      setReports((prev) =>
        prev.map((item) =>
          item.id === report.id ? { ...item, status: "resolved" } : item,
        ),
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to mark report as warned.");
    } finally {
      setMutatingId(null);
    }
  }

  async function handleBanUser(report: AdminReport) {
    if (!report.reported_user_id) {
      setError("This report is not associated with a user to ban.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to ban this user? They will lose access to their account.",
      )
    ) {
      return;
    }

    setMutatingId(report.id);
    setError(null);

    try {
      const { error: banError } = await supabase
        .from("profiles")
        .update({ is_banned: true })
        .eq("id", report.reported_user_id);

      if (banError) {
        throw banError;
      }

      const { error: reportError } = await supabase
        .from("reports")
        .update({ status: "resolved" })
        .eq("id", report.id);

      if (reportError) {
        throw reportError;
      }

      await logModerationAction("ban_user", report);

      setReports((prev) =>
        prev.map((item) =>
          item.id === report.id ? { ...item, status: "resolved" } : item,
        ),
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to ban user for this report.");
    } finally {
      setMutatingId(null);
    }
  }

  const hasReports = reports.length > 0;

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100 md:text-sm">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-zinc-800/80 bg-zinc-950/80">
              <TableHead className="w-[26%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Report
              </TableHead>
              <TableHead className="w-[18%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Target
              </TableHead>
              <TableHead className="w-[20%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Reporter
              </TableHead>
              <TableHead className="w-[18%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Status
              </TableHead>
              <TableHead className="w-[18%] text-right text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-zinc-500"
                >
                  Loading reports...
                </TableCell>
              </TableRow>
            ) : !hasReports ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-zinc-500"
                >
                  No reports at the moment.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => {
                const statusMeta = getStatusMeta(report.status);
                const statusClasses = getStatusBadgeClasses(statusMeta.tone);
                const isBusy = mutatingId === report.id;
                const isOpen = (report.status ?? "").toLowerCase() === "open" || !report.status;
                const isAdReport = (report.target_type ?? "").toLowerCase() === "ad";

                return (
                  <TableRow key={report.id} className="border-zinc-800/60">
                    <TableCell className="align-top text-xs text-zinc-100">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                            {report.id.slice(0, 8)}
                          </span>
                          <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                            {(report.target_type ?? "").toUpperCase() || "UNKNOWN"}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200">
                          {report.reason || "No reason provided"}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {formatDate(report.created_at)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-xs text-zinc-200">
                      <div className="flex flex-col gap-1">
                        <span>{getTargetLabel(report)}</span>
                        {report.ad_id && (
                          <span className="text-[11px] text-zinc-500">
                            Ad ID: {report.ad_id}
                          </span>
                        )}
                        {report.reported_user_id && (
                          <span className="text-[11px] text-zinc-500">
                            User ID: {report.reported_user_id}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-xs text-zinc-200">
                      <div className="flex flex-col gap-1">
                        <span>{report.reporter_name || "Unknown reporter"}</span>
                        <span className="text-[11px] text-zinc-500">
                          {report.reporter_email || "No email"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-xs">
                      <Badge
                        variant="outline"
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          statusClasses,
                        )}
                      >
                        {statusMeta.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="align-top text-right text-xs">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy || !isOpen}
                          className="h-8 border-zinc-700 bg-zinc-950 px-2 text-[11px] text-zinc-100 hover:bg-zinc-900"
                          onClick={() => handleDismiss(report)}
                        >
                          Dismiss
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy || !isOpen || !isAdReport}
                          className="h-8 border-red-500/60 bg-red-500/10 px-2 text-[11px] text-red-100 hover:bg-red-500/20"
                          onClick={() => handleRemoveAd(report)}
                        >
                          Remove ad
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy || !isOpen}
                          className="h-8 border-amber-500/60 bg-amber-500/10 px-2 text-[11px] text-amber-100 hover:bg-amber-500/20"
                          onClick={() => handleWarnUser(report)}
                        >
                          Warn user
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy || !isOpen}
                          className="h-8 border-red-500/80 bg-red-600/80 px-2 text-[11px] text-red-50 hover:bg-red-600"
                          onClick={() => handleBanUser(report)}
                        >
                          Ban user
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
