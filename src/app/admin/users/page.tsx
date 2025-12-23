"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UsersTable } from "@/components/users/UsersTable";
import type {
  AdminUser,
  UsersTableFilters,
} from "@/components/users/UsersTable";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UsersTableFilters>({
    role: "all",
    query: "",
  });
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: profilesError } = await supabase
          .from("profiles")
          .select(
            "id, full_name, city, phone, role, is_verified, is_banned, created_at",
          )
          .order("created_at", { ascending: false })
          .returns<AdminUser[]>();

        if (profilesError) {
          throw profilesError;
        }

        if (!cancelled) {
          setUsers(data ?? []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load users.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return users.filter((user) => {
      if (filters.role && filters.role !== "all") {
        const normalizedRole = (user.role ?? "").toLowerCase();
        if (normalizedRole !== filters.role.toLowerCase()) {
          return false;
        }
      }

      if (query) {
        const haystack = `${user.full_name ?? ""} ${user.city ?? ""} ${
          user.phone ?? ""
        } ${user.id}`.toLowerCase();

        if (!haystack.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [users, filters]);

  function handleFiltersChange(next: UsersTableFilters) {
    setFilters(next);
  }

  async function handleToggleVerify(user: AdminUser) {
    const nextValue = !user.is_verified;
    setMutatingId(user.id);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_verified: nextValue })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, is_verified: nextValue } : item,
        ),
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to update verification status.");
    } finally {
      setMutatingId(null);
    }
  }

  async function handleChangeRole(user: AdminUser, nextRole: string) {
    setMutatingId(user.id);
    setError(null);

    try {
      const normalized = nextRole || null;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: normalized })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, role: normalized } : item,
        ),
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to change role.");
    } finally {
      setMutatingId(null);
    }
  }

  async function handleToggleBan(user: AdminUser) {
    const nextValue = !user.is_banned;
    setMutatingId(user.id);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_banned: nextValue })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, is_banned: nextValue } : item,
        ),
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to update ban status.");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
          Users management
        </h1>
        <p className="text-xs text-zinc-400 md:text-sm">
          Review marketplace accounts, verify sellers, manage roles, and ban or
          unban users.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100 md:text-sm">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-lg bg-zinc-900/60" />
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-900/60" />
        </div>
      ) : (
        <UsersTable
          users={filteredUsers}
          allUsers={users}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onToggleVerify={handleToggleVerify}
          onChangeRole={handleChangeRole}
          onToggleBan={handleToggleBan}
          isMutatingId={mutatingId}
        />
      )}
    </div>
  );
}
