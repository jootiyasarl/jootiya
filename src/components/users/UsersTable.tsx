import type React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Shield, UserX, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminUserRole = string | null;

export interface AdminUser {
  id: string;
  full_name: string | null;
  city: string | null;
  phone: string | null;
  role: AdminUserRole;
  is_verified: boolean | null;
  is_banned: boolean | null;
  created_at: string | null;
}

export interface UsersTableFilters {
  role: string;
  query: string;
}

export interface UsersTableProps {
  users: AdminUser[];
  allUsers: AdminUser[];
  filters: UsersTableFilters;
  onFiltersChange: (next: UsersTableFilters) => void;
  onToggleVerify: (user: AdminUser) => void;
  onChangeRole: (user: AdminUser, role: string) => void;
  onToggleBan: (user: AdminUser) => void;
  isMutatingId?: string | null;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function getRoleLabel(role: AdminUserRole): string {
  if (!role) return "Unassigned";
  const normalized = role.toString().trim();
  if (!normalized) return "Unassigned";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

function getStatusMeta(user: AdminUser): {
  label: string;
  tone: "ok" | "danger";
} {
  if (user.is_banned) {
    return { label: "Banned", tone: "danger" };
  }

  return { label: "Active", tone: "ok" };
}

function getTrustMeta(isVerified: boolean): {
  label: string;
  description: string;
  tone: "primary" | "muted";
} {
  if (isVerified) {
    return {
      label: "Verified seller",
      description: "This account has been manually verified by the team.",
      tone: "primary",
    };
  }

  return {
    label: "Not verified",
    description: "No verification badge yet.",
    tone: "muted",
  };
}

function getUniqueRoles(users: AdminUser[]): string[] {
  const set = new Set<string>();

  for (const user of users) {
    const raw = user.role;
    if (!raw) continue;
    const normalized = raw.toString().trim();
    if (!normalized) continue;
    set.add(normalized);
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function UsersTable({
  users,
  allUsers,
  filters,
  onFiltersChange,
  onToggleVerify,
  onChangeRole,
  onToggleBan,
  isMutatingId,
}: UsersTableProps) {
  const optionSource = allUsers.length ? allUsers : users;
  const roleOptions = getUniqueRoles(optionSource);

  const currentRoleFilterLabel =
    filters.role === "all" ? "All roles" : getRoleLabel(filters.role);

  const handleRoleFilterChange = (value: string) => {
    onFiltersChange({ ...filters, role: value });
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, query: event.target.value });
  };

  const hasResults = users.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs text-zinc-400">Search</Label>
          <Input
            placeholder="Search by name, city, phone, or ID"
            value={filters.query}
            onChange={handleQueryChange}
            className="h-9 bg-zinc-900/40 text-sm text-zinc-50 placeholder:text-zinc-500"
          />
        </div>

        <div className="w-full space-y-1.5 md:w-64">
          <Label className="text-xs text-zinc-400">Role</Label>
          <Select value={filters.role} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="h-9 border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100">
              <span className="truncate text-left text-xs">
                {currentRoleFilterLabel}
              </span>
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-900 text-xs text-zinc-50">
              <SelectItem value="all">All roles</SelectItem>
              {roleOptions.map((value) => (
                <SelectItem key={value} value={value}>
                  {getRoleLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-zinc-800/80 bg-zinc-950/80">
              <TableHead className="w-[28%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                User
              </TableHead>
              <TableHead className="w-[16%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Role
              </TableHead>
              <TableHead className="w-[16%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Location
              </TableHead>
              <TableHead className="w-[16%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Trust
              </TableHead>
              <TableHead className="w-[12%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Status
              </TableHead>
              <TableHead className="w-[20%] text-right text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!hasResults ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-zinc-500"
                >
                  No users match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isVerified = Boolean(user.is_verified);
                const isBanned = Boolean(user.is_banned);
                const statusMeta = getStatusMeta(user);
                const trustMeta = getTrustMeta(isVerified);
                const isBusy = isMutatingId === user.id;
                const roleLabel = getRoleLabel(user.role);

                return (
                  <TableRow key={user.id} className="border-zinc-800/60">
                    <TableCell className="align-top text-sm text-zinc-50">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="line-clamp-1 text-sm font-medium">
                            {user.full_name || "No name"}
                          </span>
                          <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                            {user.id.slice(0, 6)}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          {user.phone || "No phone"}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Joined {formatDate(user.created_at)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-xs text-zinc-200">
                      {roleOptions.length ? (
                        <Select
                          value={user.role ?? ""}
                          onValueChange={(next) => onChangeRole(user, next)}
                        >
                          <SelectTrigger className="h-8 border-zinc-800 bg-zinc-950 text-[11px] text-zinc-100">
                            <span className="truncate text-left">{roleLabel}</span>
                          </SelectTrigger>
                          <SelectContent className="border-zinc-800 bg-zinc-900 text-xs text-zinc-50">
                            <SelectItem value="">Unassigned</SelectItem>
                            {roleOptions.map((value) => (
                              <SelectItem key={value} value={value}>
                                {getRoleLabel(value)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span>{roleLabel}</span>
                      )}
                    </TableCell>

                    <TableCell className="align-top text-xs text-zinc-300">
                      <div className="flex flex-col gap-1">
                        <span>{user.city || "No city"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-xs">
                      <div
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium",
                          trustMeta.tone === "primary"
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                            : "border-zinc-700 bg-zinc-950 text-zinc-300",
                        )}
                      >
                        {isVerified ? (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        ) : (
                          <Shield className="h-3.5 w-3.5" />
                        )}
                        <span>{trustMeta.label}</span>
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-xs">
                      <Badge
                        variant="outline"
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          statusMeta.tone === "danger"
                            ? "border-red-500/50 bg-red-500/10 text-red-100"
                            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
                        )}
                      >
                        {statusMeta.tone === "danger" ? (
                          <UserX className="h-3 w-3" />
                        ) : (
                          <UserCheck className="h-3 w-3" />
                        )}
                        {statusMeta.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="align-top text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy || isBanned}
                          className={cn(
                            "h-8 border-emerald-500/40 px-2 text-[11px]",
                            isVerified
                              ? "bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                              : "bg-zinc-950 text-emerald-200 hover:bg-emerald-500/10",
                          )}
                          onClick={() => onToggleVerify(user)}
                        >
                          {isVerified ? "Remove badge" : "Verify seller"}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          className={cn(
                            "h-8 px-2 text-[11px]",
                            isBanned
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
                              : "border-red-500/40 bg-red-500/10 text-red-100 hover:bg-red-500/20",
                          )}
                          onClick={() => onToggleBan(user)}
                        >
                          {isBanned ? "Unban" : "Ban"}
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
