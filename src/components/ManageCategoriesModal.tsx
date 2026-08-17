import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MESSAGES } from "@/constants/messages";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useRenameCategory,
} from "@/hooks/useApi";
import type { CategoryWithCount } from "@/types";
import { getErrorMessage } from "@/utils/api-error";
import { toast } from "@/utils/toast";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

interface ManageCategoriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageCategoriesModal({
  open,
  onOpenChange,
}: ManageCategoriesModalProps) {
  const { data: categories, isLoading, isError } = useCategories();
  const createCategory = useCreateCategory();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCount | null>(null);

  const handleCreate = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error(MESSAGES.VALIDATION.CATEGORY_NAME_REQUIRED);
      return;
    }

    try {
      await createCategory.mutateAsync(name);
      toast.success(MESSAGES.SUCCESS.CATEGORY_CREATED);
      setNewCategoryName("");
    } catch (e) {
      toast.error(`${MESSAGES.ERROR.CATEGORY_CREATE} ${getErrorMessage(e)}`);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setNewCategoryName("");
      setEditingId(null);
      setDeletingCategory(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Manage Categories</DialogTitle>
          <DialogDescription>
            Create, rename, or delete the categories used to organize YouTube channels.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label htmlFor="new-category-name" className="mb-2 block text-muted-foreground">
            New category
          </Label>
          <div className="flex gap-2">
            <Input
              id="new-category-name"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={createCategory.isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
            <Button
              onClick={handleCreate}
              disabled={!newCategoryName.trim() || createCategory.isPending}
            >
              {createCategory.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-1 max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive py-4 text-center">
              {MESSAGES.ERROR.LOADING_CATEGORIES}
            </p>
          )}

          {!isLoading && !isError && (categories ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {MESSAGES.INFO.NO_CATEGORIES}
            </p>
          )}

          {(categories ?? []).map((category) =>
            editingId === category.id ? (
              <CategoryEditRow
                key={category.id}
                category={category}
                onDone={() => setEditingId(null)}
              />
            ) : (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={() => setEditingId(category.id)}
                onDelete={() => setDeletingCategory(category)}
              />
            ),
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      <DeleteCategoryDialog
        category={deletingCategory}
        onClose={() => setDeletingCategory(null)}
      />
    </Dialog>
  );
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryWithCount;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-1 rounded hover:bg-secondary/50">
      <span
        className="h-3 w-3 rounded-full shrink-0"
        style={{ backgroundColor: category.color }}
        aria-hidden
      />
      <span className="flex-1 text-sm truncate">{category.name}</span>
      <Badge variant="secondary">{category.channelCount}</Badge>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Rename {category.name}</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
        <span className="sr-only">Delete {category.name}</span>
      </Button>
    </div>
  );
}

function CategoryEditRow({
  category,
  onDone,
}: {
  category: CategoryWithCount;
  onDone: () => void;
}) {
  const [name, setName] = useState(category.name);
  const renameCategory = useRenameCategory();

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === category.name) {
      onDone();
      return;
    }

    try {
      await renameCategory.mutateAsync({ id: category.id, name: trimmed });
      toast.success(MESSAGES.SUCCESS.CATEGORY_RENAMED);
      onDone();
    } catch (e) {
      toast.error(`${MESSAGES.ERROR.CATEGORY_RENAME} ${getErrorMessage(e)}`);
    }
  };

  return (
    <div className="flex items-center gap-2 py-2 px-1">
      <span
        className="h-3 w-3 rounded-full shrink-0"
        style={{ backgroundColor: category.color }}
        aria-hidden
      />
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={renameCategory.isPending}
        className="h-8"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            onDone();
          }
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleSave}
        disabled={!name.trim() || renameCategory.isPending}
      >
        {renameCategory.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
        <span className="sr-only">Save</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onDone}
        disabled={renameCategory.isPending}
      >
        <X className="h-3.5 w-3.5" />
        <span className="sr-only">Cancel</span>
      </Button>
    </div>
  );
}

function DeleteCategoryDialog({
  category,
  onClose,
}: {
  category: CategoryWithCount | null;
  onClose: () => void;
}) {
  const deleteCategory = useDeleteCategory();

  const handleConfirm = async () => {
    if (!category) return;
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success(MESSAGES.SUCCESS.CATEGORY_DELETED);
      onClose();
    } catch (e) {
      toast.error(`${MESSAGES.ERROR.CATEGORY_DELETE} ${getErrorMessage(e)}`);
    }
  };

  return (
    <AlertDialog open={category !== null} onOpenChange={(next) => !next && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{category?.name}"?</AlertDialogTitle>
          <AlertDialogDescription>{MESSAGES.CONFIRM.DELETE_CATEGORY}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteCategory.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={deleteCategory.isPending}
          >
            {deleteCategory.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
