"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AdminCity {
  id: string;
  name: string;
  slug: string;
  popularity: number | null;
  created_at: string | null;
}

interface CityFormState {
  name: string;
  slug: string;
  popularity: string;
}

function createEmptyFormState(): CityFormState {
  return {
    name: "",
    slug: "",
    popularity: "",
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function sortCities(list: AdminCity[]): AdminCity[] {
  return [...list].sort((a, b) => {
    const aPop = a.popularity ?? 0;
    const bPop = b.popularity ?? 0;

    if (aPop !== bPop) {
      return bPop - aPop;
    }

    return a.name.localeCompare(b.name);
  });
}

function parsePopularity(value: string): number | null | "invalid" {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return "invalid";
  return num;
}

export function CityManager() {
  const [cities, setCities] = useState<AdminCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CityFormState>(
    createEmptyFormState(),
  );
  const [createSlugTouched, setCreateSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CityFormState>(
    createEmptyFormState(),
  );
  const [editSlugTouched, setEditSlugTouched] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCities() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: selectError } = await supabase
          .from("cities")
          .select(
            "id, name, slug, popularity, created_at",
          )
          .order("created_at", { ascending: false })
          .returns<AdminCity[]>();

        if (selectError) {
          throw selectError;
        }

        if (!cancelled) {
          setCities(sortCities(data ?? []));
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load cities.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCities();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleCreateNameChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setCreateForm((prev) => ({ ...prev, name: value }));

    if (!createSlugTouched) {
      setCreateForm((prev) => ({ ...prev, slug: slugify(value) }));
    }
  }

  function handleCreateSlugChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setCreateSlugTouched(true);
    setCreateForm((prev) => ({ ...prev, slug: value }));
  }

  function handleCreateFieldChange(
    field: keyof CityFormState,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const value = event.target.value;
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = createForm.name.trim();
    const slug = (createForm.slug || slugify(createForm.name)).trim();

    if (!name) {
      setError("City name is required.");
      return;
    }

    if (!slug) {
      setError("Slug is required.");
      return;
    }

    const popularity = parsePopularity(createForm.popularity);

    if (popularity === "invalid") {
      setError("Popularity must be a number.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const payload: Partial<AdminCity> = {
        name,
        slug,
        popularity: popularity as number | null,
      };

      const { data, error: insertError } = await supabase
        .from("cities")
        .insert(payload)
        .select(
          "id, name, slug, popularity, created_at",
        )
        .maybeSingle<AdminCity>();

      if (insertError) {
        throw insertError;
      }

      if (data) {
        setCities((prev) => sortCities([...prev, data]));
      }

      setCreateForm(createEmptyFormState());
      setCreateSlugTouched(false);
    } catch (err: any) {
      setError(err.message ?? "Failed to create city.");
    } finally {
      setCreating(false);
    }
  }

  function beginEdit(city: AdminCity) {
    setEditingId(city.id);
    setEditForm({
      name: city.name,
      slug: city.slug,
      popularity: city.popularity != null ? String(city.popularity) : "",
    });
    setEditSlugTouched(false);
  }

  function handleEditNameChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setEditForm((prev) => ({ ...prev, name: value }));

    if (!editSlugTouched) {
      setEditForm((prev) => ({ ...prev, slug: slugify(value) }));
    }
  }

  function handleEditSlugChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setEditSlugTouched(true);
    setEditForm((prev) => ({ ...prev, slug: value }));
  }

  function handleEditFieldChange(
    field: keyof CityFormState,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const value = event.target.value;
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleEditSave(cityId: string) {
    const name = editForm.name.trim();
    const slug = editForm.slug.trim();

    if (!name) {
      setError("City name is required.");
      return;
    }

    if (!slug) {
      setError("Slug is required.");
      return;
    }

    const popularity = parsePopularity(editForm.popularity);

    if (popularity === "invalid") {
      setError("Popularity must be a number.");
      return;
    }

    setSavingId(cityId);
    setError(null);

    try {
      const payload: Partial<AdminCity> = {
        name,
        slug,
        popularity: popularity as number | null,
      };

      const { data, error: updateError } = await supabase
        .from("cities")
        .update(payload)
        .eq("id", cityId)
        .select(
          "id, name, slug, popularity, created_at",
        )
        .maybeSingle<AdminCity>();

      if (updateError) {
        throw updateError;
      }

      if (data) {
        setCities((prev) =>
          sortCities(prev.map((item) => (item.id === cityId ? data : item))),
        );
      }

      setEditingId(null);
      setEditForm(createEmptyFormState());
      setEditSlugTouched(false);
    } catch (err: any) {
      setError(err.message ?? "Failed to update city.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(city: AdminCity) {
    if (!window.confirm(`Delete city "${city.name}"?`)) {
      return;
    }

    setDeletingId(city.id);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("cities")
        .delete()
        .eq("id", city.id);

      if (deleteError) {
        throw deleteError;
      }

      setCities((prev) => prev.filter((item) => item.id !== city.id));
    } catch (err: any) {
      setError(err.message ?? "Failed to delete city.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-950/60 px-3 py-2 text-xs text-red-100 md:text-sm">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={handleCreateSubmit}
        className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 md:p-5"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-zinc-50 md:text-base">
            Create new city
          </h2>
          <p className="text-xs text-zinc-400 md:text-[13px]">
            Cities power your location-based SEO pages and nearby search.
          </p>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5 md:col-span-1">
            <Label htmlFor="city-name" className="text-xs text-zinc-300">
              Name
            </Label>
            <Input
              id="city-name"
              value={createForm.name}
              onChange={handleCreateNameChange}
              placeholder="e.g. Casablanca"
              className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
              disabled={creating}
            />
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <Label htmlFor="city-slug" className="text-xs text-zinc-300">
              Slug
            </Label>
            <Input
              id="city-slug"
              value={createForm.slug}
              onChange={handleCreateSlugChange}
              placeholder="e.g. casablanca"
              className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
              disabled={creating}
            />
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <Label
              htmlFor="city-popularity"
              className="text-xs text-zinc-300"
            >
              Popularity
            </Label>
            <Input
              id="city-popularity"
              value={createForm.popularity}
              onChange={(event) =>
                handleCreateFieldChange("popularity", event)
              }
              placeholder="e.g. 100 (higher appears first)"
              className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
              disabled={creating}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="h-9 px-4 text-xs md:text-sm"
            disabled={creating}
          >
            {creating ? "Creating..." : "Add city"}
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-zinc-800/80 bg-zinc-950/80">
              <TableHead className="w-[30%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Name
              </TableHead>
              <TableHead className="w-[30%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Slug
              </TableHead>
              <TableHead className="w-[20%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Popularity
              </TableHead>
              <TableHead className="w-[20%] text-right text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-zinc-500"
                >
                  Loading cities...
                </TableCell>
              </TableRow>
            ) : cities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-sm text-zinc-500"
                >
                  No cities yet. Create your first one above.
                </TableCell>
              </TableRow>
            ) : (
              cities.map((city) => {
                const isEditing = editingId === city.id;
                const isSaving = savingId === city.id;
                const isDeleting = deletingId === city.id;

                return (
                  <TableRow key={city.id} className="border-zinc-800/60">
                    <TableCell className="align-top text-sm text-zinc-50">
                      {isEditing ? (
                        <Input
                          value={editForm.name}
                          onChange={handleEditNameChange}
                          className="h-8 bg-zinc-900 text-xs text-zinc-50"
                          disabled={isSaving}
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {city.name}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="align-top text-xs text-zinc-300">
                      {isEditing ? (
                        <Input
                          value={editForm.slug}
                          onChange={handleEditSlugChange}
                          className="h-8 bg-zinc-900 text-xs text-zinc-50"
                          disabled={isSaving}
                        />
                      ) : (
                        <span className="font-mono text-[11px]">
                          {city.slug}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="align-top text-xs text-zinc-300">
                      {isEditing ? (
                        <Input
                          value={editForm.popularity}
                          onChange={(event) =>
                            handleEditFieldChange("popularity", event)
                          }
                          className="h-8 bg-zinc-900 text-xs text-zinc-50"
                          disabled={isSaving}
                        />
                      ) : (
                        <span>
                          {city.popularity != null ? city.popularity : "—"}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="align-top text-right text-xs">
                      {isEditing ? (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-[11px]"
                            disabled={isSaving}
                            onClick={() => handleEditSave(city.id)}
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-[11px]"
                            disabled={isSaving}
                            onClick={() => {
                              setEditingId(null);
                              setEditForm(createEmptyFormState());
                              setEditSlugTouched(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-[11px]"
                            disabled={deletingId === city.id}
                            onClick={() => beginEdit(city)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-[11px] text-red-200 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-100"
                            disabled={isDeleting}
                            onClick={() => handleDelete(city)}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      )}
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
