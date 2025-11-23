import { Checkbox } from '@repo/ui/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
} from '@repo/ui/components/ui/collapsible';
import { cn } from '@repo/ui/lib/utils';
import { ChevronRight } from 'lucide-react';
import React from 'react';

import { Label } from './ui/label';

// --- Types ---
export type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};

export type TreeViewProps = {
  data: TreeNode[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
};

// --- Helper: Get all leaf IDs ---
const getLeafIds = (node: TreeNode): string[] => {
  if (!node.children || node.children.length === 0) {
    return [node.id];
  }
  return node.children.flatMap(getLeafIds);
};

// --- The Main Component ---
export const TreeView = ({
  data,
  selectedIds,
  onSelectChange,
}: TreeViewProps) => {
  return (
    <div className="space-y-2">
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          selectedIds={selectedIds}
          onSelectChange={onSelectChange}
        />
      ))}
    </div>
  );
};

export type TreeItemProps = {
  node: TreeNode;
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
};

// --- Recursive Individual Item ---
export const TreeItem = ({
  node,
  selectedIds,
  onSelectChange,
}: TreeItemProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = node.children && node.children.length > 0;

  // 1. Determine State
  const leafIds = getLeafIds(node);
  const selectedLeafIds = leafIds.filter((id) => selectedIds.includes(id));

  const isChecked =
    leafIds.length > 0 && selectedLeafIds.length === leafIds.length;
  const isIndeterminate =
    selectedLeafIds.length > 0 && selectedLeafIds.length < leafIds.length;

  // 2. Handle Checkbox Click
  const handleCheckedChange = (checked: boolean) => {
    let newSelectedIds = [...selectedIds];

    if (checked) {
      const idsToAdd = leafIds.filter((id) => !selectedIds.includes(id));
      newSelectedIds = [...newSelectedIds, ...idsToAdd];
    } else {
      newSelectedIds = newSelectedIds.filter((id) => !leafIds.includes(id));
    }

    onSelectChange(newSelectedIds);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-1"
    >
      <div
        // ROW CLICK: Toggles the folder (Collapsible)
        // We use 'flex' to stretch across the width
        onClick={() => hasChildren && setIsOpen((prev) => !prev)}
        className={cn(
          'flex items-center rounded-md p-1 hover:bg-muted/50 w-full',
          // Cursor logic: If it's a folder, the empty space is a pointer (to expand)
          hasChildren ? 'cursor-pointer' : 'cursor-default',
        )}
      >
        {/* Chevron: Visual indicator only */}
        {hasChildren ? (
          <div
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center transition-transform duration-200 text-muted-foreground',
              isOpen && 'rotate-90',
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </div>
        ) : (
          <span className="h-4 w-4 shrink-0" />
        )}

        {/* CHECKBOX + LABEL GROUP */}
        {/* 1. We wrap this in a div with stopPropagation.
               This ensures clicking the box/text DOES NOT trigger the row click (expand).
            2. We use the Label component so clicking the text ticks the box.
         */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center ml-2"
        >
          <Label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={
                isChecked ? true : isIndeterminate ? 'indeterminate' : false
              }
              onCheckedChange={handleCheckedChange}
            />
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none">
              {node.label}
            </span>
          </Label>
        </div>
      </div>

      {/* Children Render */}
      {hasChildren && (
        <CollapsibleContent className="pl-6 border-l border-muted ml-2.5">
          <div className="flex flex-col space-y-1 pt-1">
            {node.children!.map((child) => (
              <TreeItem
                key={child.id}
                node={child}
                selectedIds={selectedIds}
                onSelectChange={onSelectChange}
              />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};
