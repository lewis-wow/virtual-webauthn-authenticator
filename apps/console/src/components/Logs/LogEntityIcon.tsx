import { AuditLogEntity } from '@repo/audit-log/enums';
import { Key, LayoutList, ShieldAlert } from 'lucide-react';
import { match } from 'ts-pattern';

export type LogEntityIconProps = {
  entity: AuditLogEntity;
};

export const LogEntityIcon = ({ entity }: LogEntityIconProps) => {
  return match(entity)
    .with(AuditLogEntity.CREDENTIAL, () => <ShieldAlert className="h-4 w-4" />)
    .with(AuditLogEntity.API_KEY, () => <Key className="h-4 w-4" />)
    .otherwise(() => <LayoutList className="h-4 w-4" />);
};
