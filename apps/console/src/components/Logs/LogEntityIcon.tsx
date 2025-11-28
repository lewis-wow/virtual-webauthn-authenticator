import { LogEntity } from '@repo/activity-log/enums';
import { Key, LayoutList, ShieldAlert } from 'lucide-react';
import { match } from 'ts-pattern';

export type LogEntityIconProps = {
  entity: LogEntity;
};

export const LogEntityIcon = ({ entity }: LogEntityIconProps) => {
  return match(entity)
    .with(LogEntity.CREDENTIAL, () => <ShieldAlert className="h-4 w-4" />)
    .with(LogEntity.API_KEY, () => <Key className="h-4 w-4" />)
    .otherwise(() => <LayoutList className="h-4 w-4" />);
};
