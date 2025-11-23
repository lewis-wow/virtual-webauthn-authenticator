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
  // 1. Calculate Selection Logic FIRST (before initializing state)
  const hasChildren = node.children && node.children.length > 0;

  const leafIds = getLeafIds(node);
  const selectedLeafIds = leafIds.filter((id) => selectedIds.includes(id));

  // Check if this branch has any selected items (either fully checked or indeterminate)
  const hasSelection = selectedLeafIds.length > 0;

  // 2. Initialize State based on selection
  // If it has selection, default to true (open), otherwise false (closed)
  const [isOpen, setIsOpen] = React.useState(hasSelection);

  // 3. Derived values for the checkbox UI
  const isChecked =
    leafIds.length > 0 && selectedLeafIds.length === leafIds.length;
  const isIndeterminate =
    selectedLeafIds.length > 0 && selectedLeafIds.length < leafIds.length;

  // 4. Handle Checkbox Click
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
        onClick={() => hasChildren && setIsOpen((prev) => !prev)}
        className={cn(
          'flex items-center rounded-md p-1 hover:bg-muted/50 w-full',
          hasChildren ? 'cursor-pointer' : 'cursor-default',
        )}
      >
        {/* Chevron */}
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

        {/* CHECKBOX + LABEL */}
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
