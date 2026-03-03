import { ChevronsUpDown } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";

import { cn } from "../lib/utils";
import { useDataChannel } from "../stores/Data";
import { Slot } from "../widgets/slot";
import { canAccept } from "../widgets/utils";
import { TopicEntry } from "./TopicEntry";
import { TopicsExplorer } from "./TopicsExplorer";

import type { DataNode } from "../stores/Data";
import type { WidgetDescriptorSlot } from "../widgets/types";

export type WidgetSlotSelectProps = {
  className?: string;
  slot?: WidgetDescriptorSlot;
  value?: string;
  onChange?: (value: string | undefined) => void;
};

export const WidgetSlotSelect = ({ className, slot, value, onChange }: WidgetSlotSelectProps) => {
  const [open, setOpen] = useState(false);

  const channel = useDataChannel(value);
  const filter = useCallback((node: DataNode) => node.channel != null && canAccept(slot, node.channel), [slot]);

  const handleChange = useCallback(
    (v: string | undefined) => {
      onChange?.(v);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between px-3", className)}>
          {value && channel ? (
            <TopicEntry
              id={value}
              name={Slot.formatAsRef(value)}
              channel={channel}
              inert
              leaf
            />
          ) : (
            <>Select channel&hellip;</>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex max-h-[calc(var(--radix-popover-content-available-height)-32px)] w-(--radix-popover-trigger-width) overflow-hidden p-0">
        <TopicsExplorer
          className="bg-secondary/20"
          value={value}
          onChange={handleChange}
          filter={filter}
        />
      </PopoverContent>
    </Popover>
  );
};
