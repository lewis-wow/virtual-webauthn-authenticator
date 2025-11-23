import { Checkbox } from '@repo/ui/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
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

// --- Helper: Get all leaf IDs (nodes without children) recursively ---
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

  // 1. Determine State based on Leaf IDs only
  const leafIds = getLeafIds(node);
  const selectedLeafIds = leafIds.filter((id) => selectedIds.includes(id));

  const isChecked =
    leafIds.length > 0 && selectedLeafIds.length === leafIds.length;
  const isIndeterminate =
    selectedLeafIds.length > 0 && selectedLeafIds.length < leafIds.length;

  // 2. Handle Click
  const handleCheckedChange = (checked: boolean) => {
    let newSelectedIds = [...selectedIds];

    if (checked) {
      // Add all missing leaf IDs from this branch
      const idsToAdd = leafIds.filter((id) => !selectedIds.includes(id));
      newSelectedIds = [...newSelectedIds, ...idsToAdd];
    } else {
      // Remove all leaf IDs from this branch
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
      <div className="flex items-center space-x-2 rounded-md p-1 hover:bg-muted/50">
        {/* Collapsible Trigger */}
        {hasChildren ? (
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className={cn(
                'h-4 w-4 shrink-0 transition-transform duration-200',
                isOpen && 'rotate-90',
              )}
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </CollapsibleTrigger>
        ) : (
          <span className="h-4 w-4" />
        )}

        {/* Checkbox */}
        <Label className="cursor-pointer">
          <Checkbox
            checked={
              isChecked ? true : isIndeterminate ? 'indeterminate' : false
            }
            onCheckedChange={handleCheckedChange}
          />
          <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none">
            {node.label}
          </span>
        </Label>
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
