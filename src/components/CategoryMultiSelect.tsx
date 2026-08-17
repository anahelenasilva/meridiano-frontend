import { ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCategories, useCreateCategory } from "@/hooks/useApi";
import type { Category } from "@/types";
import { getErrorMessage } from "@/utils/api-error";

interface CategoryMultiSelectProps {
  selected: Category[];
  onChange: (categories: Category[]) => void;
  disabled?: boolean;
}

/**
 * Reusable category picker: search existing categories, create a new one
 * inline when the typed name has no match, and manage the selection as
 * removable, color-swatched badges. Shared by any form that assigns
 * categories to an entity (e.g. Add-Channel).
 */
export function CategoryMultiSelect({ selected, onChange, disabled }: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: categories, isLoading, isError } = useCategories();
  const createCategory = useCreateCategory();

  const selectedIds = useMemo(() => new Set(selected.map((c) => c.id)), [selected]);
  const trimmedSearch = search.trim();

  const filtered = useMemo(() => {
    const options = categories ?? [];
    return options.filter(
      (c) => !selectedIds.has(c.id) && c.name.toLowerCase().includes(trimmedSearch.toLowerCase()),
    );
  }, [categories, selectedIds, trimmedSearch]);

  const hasExactMatch = useMemo(
    () =>
      trimmedSearch.length > 0 &&
      (categories ?? []).some((c) => c.name.toLowerCase() === trimmedSearch.toLowerCase()),
    [categories, trimmedSearch],
  );

  const showCreateOption = trimmedSearch.length > 0 && !hasExactMatch;

  const handleSelect = (category: Category) => {
    onChange([...selected, category]);
    setSearch("");
  };

  const handleRemove = (categoryId: string) => {
    onChange(selected.filter((c) => c.id !== categoryId));
  };

  const handleCreate = async () => {
    if (!trimmedSearch || createCategory.isPending) return;
    const category = await createCategory.mutateAsync(trimmedSearch);
    onChange([...selected, category]);
    setSearch("");
  };

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((category) => (
            <CategoryBadge
              key={category.id}
              category={category}
              onRemove={() => handleRemove(category.id)}
            />
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal text-muted-foreground"
          >
            Add category…
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search or create category..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading categories…
                </div>
              )}
              {isError && (
                <div className="py-6 text-center text-sm text-destructive">
                  Failed to load categories.
                </div>
              )}
              {!isLoading && !isError && (
                <>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    {filtered.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.id}
                        onSelect={() => handleSelect(category)}
                      >
                        <span
                          className="mr-2 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {showCreateOption && (
                    <CommandGroup>
                      <CommandItem
                        value={`__create__${trimmedSearch}`}
                        disabled={createCategory.isPending}
                        onSelect={handleCreate}
                      >
                        {createCategory.isPending ? (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="mr-2 h-3.5 w-3.5" />
                        )}
                        Create "{trimmedSearch}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {createCategory.isError && (
        <p className="text-xs text-destructive">{getErrorMessage(createCategory.error)}</p>
      )}
    </div>
  );
}
