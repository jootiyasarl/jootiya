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

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  popularity: number | null;
  created_at: string | null;
}

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  popularity: string;
}

function createEmptyFormState(): CategoryFormState {
  return {
    name: "",
    slug: "",
    description: "",
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

function sortCategories(list: AdminCategory[]): AdminCategory[] {
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

export function CategoryManager() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CategoryFormState>(
    createEmptyFormState(),
  );
  const [createSlugTouched, setCreateSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryFormState>(
    createEmptyFormState(),
  );
  const [editSlugTouched, setEditSlugTouched] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: selectError } = await supabase
          .from("categories")
          .select(
            "id, name, slug, description, popularity, created_at",
          )
          .order("created_at", { ascending: false })
          .returns<AdminCategory[]>();

        if (selectError) {
          throw selectError;
        }

        if (!cancelled) {
          setCategories(sortCategories(data ?? []));
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load categories.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCategories();

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
    field: keyof CategoryFormState,
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
      setError("Category name is required.");
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
      const payload: Partial<AdminCategory> = {
        name,
        slug,
        description: createForm.description.trim() || null,
        popularity: popularity as number | null,
      };

      const { data, error: insertError } = await supabase
        .from("categories")
        .insert(payload)
        .select(
          "id, name, slug, description, popularity, created_at",
        )
        .maybeSingle<AdminCategory>();

      if (insertError) {
        throw insertError;
      }

      if (data) {
        setCategories((prev) => sortCategories([...prev, data]));
      }

      setCreateForm(createEmptyFormState());
      setCreateSlugTouched(false);
    } catch (err: any) {
      setError(err.message ?? "Failed to create category.");
    } finally {
      setCreating(false);
    }
  }

  function beginEdit(category: AdminCategory) {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      popularity:
        category.popularity != null ? String(category.popularity) : "",
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
    field: keyof CategoryFormState,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const value = event.target.value;
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleEditSave(categoryId: string) {
    const name = editForm.name.trim();
    const slug = editForm.slug.trim();

    if (!name) {
      setError("Category name is required.");
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

    setSavingId(categoryId);
    setError(null);

    try {
      const payload: Partial<AdminCategory> = {
        name,
        slug,
        description: editForm.description.trim() || null,
        popularity: popularity as number | null,
      };

      const { data, error: updateError } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", categoryId)
        .select(
          "id, name, slug, description, popularity, created_at",
        )
        .maybeSingle<AdminCategory>();

      if (updateError) {
        throw updateError;
      }

      if (data) {
        setCategories((prev) =>
          sortCategories(
            prev.map((item) => (item.id === categoryId ? data : item)),
          ),
        );
      }

      setEditingId(null);
      setEditForm(createEmptyFormState());
      setEditSlugTouched(false);
    } catch (err: any) {
      setError(err.message ?? "Failed to update category.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(category: AdminCategory) {
    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    setDeletingId(category.id);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (deleteError) {
        throw deleteError;
      }

      setCategories((prev) => prev.filter((item) => item.id !== category.id));
    } catch (err: any) {
      setError(err.message ?? "Failed to delete category.");
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
            Create new category
          </h2>
          <p className="text-xs text-zinc-400 md:text-[13px]">
            Categories power your programmatic SEO pages. Use clear names and
            stable slugs.
          </p>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="category-name"
              className="text-xs text-zinc-300"
            >
              Name
            </Label>
            <Input
              id="category-name"
              value={createForm.name}
              onChange={handleCreateNameChange}
              placeholder="e.g. Phones & tablets"
              className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
              disabled={creating}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="category-slug"
              className="text-xs text-zinc-300"
            >
              Slug
            </Label>
            <Input
              id="category-slug"
              value={createForm.slug}
              onChange={handleCreateSlugChange}
              placeholder="e.g. phones-tablets"
              className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
              disabled={creating}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="category-popularity"
              className="text-xs text-zinc-300"
            >
              Popularity
            </Label>
            <Input
              id="category-popularity"
              value={createForm.popularity}
              onChange={(event) =>
                handleCreateFieldChange("popularity", event)
              }
              placeholder="e.g. 100 (higher appears first)"
              className="h-9 bg-zinc-900 text-sm text-zinc-50 placeholder:text-zinc-600"
              disabled={creating}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label
              htmlFor="category-description"
              className="text-xs text-zinc-300"
            >
              Description (optional)
            </Label>
            <Input
              id="category-description"
              value={createForm.description}
              onChange={(event) =>
                handleCreateFieldChange("description", event)
              }
              placeholder="Short description used in SEO contexts."
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
            {creating ? "Creating..." : "Add category"}
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-zinc-800/80 bg-zinc-950/80">
              <TableHead className="w-[26%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Name
              </TableHead>
              <TableHead className="w-[24%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Slug
              </TableHead>
              <TableHead className="w-[16%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Popularity
              </TableHead>
              <TableHead className="w-[24%] text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Description
              </TableHead>
              <TableHead className="w-[10%] text-right text-[11px] uppercase tracking-[0.16em] text-zinc-500">
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
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-zinc-500"
                >
                  No categories yet. Create your first one above.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => {
                const isEditing = editingId === category.id;
                const isSaving = savingId === category.id;
                const isDeleting = deletingId === category.id;

                return (
                  <TableRow key={category.id} className="border-zinc-800/60">
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
                          {category.name}
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
                          {category.slug}
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
                          {category.popularity != null
                            ? category.popularity
                            : "—"}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="align-top text-xs text-zinc-300">
                      {isEditing ? (
                        <Input
                          value={editForm.description}
                          onChange={(event) =>
                            handleEditFieldChange("description", event)
                          }
                          className="h-8 bg-zinc-900 text-xs text-zinc-50"
                          disabled={isSaving}
                        />
                      ) : (
                        <span className="line-clamp-2">
                          {category.description || "—"}
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
                            onClick={() => handleEditSave(category.id)}
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
                            disabled={deletingId === category.id}
                            onClick={() => beginEdit(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-[11px] text-red-200 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-100"
                            disabled={isDeleting}
                            onClick={() => handleDelete(category)}
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
