import { FormControl, FormField } from '@repo/ui/components/ui/form';
import type { CommonFieldProps } from '@repo/ui/types';
import { useFormContext } from 'react-hook-form';

import { PermissionMapper } from '../mappers/PermissionMapper';
import { FormItemContainer } from './FormItemContainer';
import { TreeView, type TreeNode } from './TreeView';

export type TreeViewFieldProps = {
  nodes: TreeNode[];
} & CommonFieldProps;

export const TreeViewField = ({
  nodes,
  ...commonProps
}: TreeViewFieldProps) => {
  const form = useFormContext();

  const { name, ...formItemContainerProps } = commonProps;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItemContainer
          {...formItemContainerProps}
          descriptionPosition="top"
        >
          <FormControl>
            <TreeView
              data={nodes}
              selectedIds={PermissionMapper.toTreeIds(field.value || {})}
              onSelectChange={(ids) => {
                const value = PermissionMapper.fromTreeIds(ids);
                field.onChange(value);
              }}
            />
          </FormControl>
        </FormItemContainer>
      )}
    />
  );
};
