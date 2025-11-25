import { AuditLogAction } from '@repo/audit-log/enums';
import { Badge } from '@repo/ui/components/ui/badge';
import { match } from 'ts-pattern';

export type LogActionBadgeProps = {
  action: AuditLogAction;
};

export const LogActionBadge = ({ action }: LogActionBadgeProps) => {
  return match(action)
    .with(AuditLogAction.CREATE, AuditLogAction.UPDATE, () => (
      <Badge className="bg-emerald-600 hover:bg-emerald-700">{action}</Badge>
    ))
    .with(AuditLogAction.GET, AuditLogAction.LIST, () => (
      <Badge variant="secondary" className="text-muted-foreground">
        {action}
      </Badge>
    ))
    .with(AuditLogAction.DELETE, () => (
      <Badge variant="destructive">{action}</Badge>
    ))
    .exhaustive();
};
