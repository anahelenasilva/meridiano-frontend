import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { CategoryMultiSelect } from "@/components/CategoryMultiSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MESSAGES } from "@/constants/messages";
import { useSetChannelCategories } from "@/hooks/useApi";
import type { Category } from "@/types";
import { getErrorMessage } from "@/utils/api-error";
import { toast } from "@/utils/toast";

interface EditChannelCategoriesModalProps {
  channel: { id: string; name: string; categories: Category[] } | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Edits a single channel's category assignment via the replace-the-set
 * endpoint, reusing the multi-select shared with the Add-Channel flow.
 */
export default function EditChannelCategoriesModal({
  channel,
  onOpenChange,
}: EditChannelCategoriesModalProps) {
  const [categories, setCategories] = useState<Category[]>(channel?.categories ?? []);
  const setChannelCategories = useSetChannelCategories();

  // Re-seed the selection whenever the modal opens on a channel.
  const [seededFrom, setSeededFrom] = useState(channel);
  if (channel !== seededFrom) {
    setSeededFrom(channel);
    if (channel) setCategories(channel.categories);
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!channel) return;
    try {
      await setChannelCategories.mutateAsync({
        channelId: channel.id,
        categoryNames: categories.map((c) => c.name),
      });
      onOpenChange(false);
    } catch (e) {
      toast.error(`${MESSAGES.ERROR.CHANNEL_CATEGORIES_UPDATE} ${getErrorMessage(e)}`);
    }
  };

  return (
    <Dialog open={channel !== null} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Categories</DialogTitle>
          <DialogDescription>
            {channel ? `Choose the categories for "${channel.name}".` : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <CategoryMultiSelect
            selected={categories}
            onChange={setCategories}
            disabled={setChannelCategories.isPending}
          />

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={setChannelCategories.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={setChannelCategories.isPending}>
              {setChannelCategories.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
