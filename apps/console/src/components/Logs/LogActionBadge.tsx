import { LogAction } from '@repo/activity-log/enums';
import { Badge } from '@repo/ui/components/ui/badge';
import { match } from 'ts-pattern';

export type LogActionBadgeProps = {
  action: LogAction;
};

export const LogActionBadge = ({ action }: LogActionBadgeProps) => {
  return match(action)
    .with(LogAction.CREATE, LogAction.UPDATE, () => (
      <Badge className="bg-emerald-600 hover:bg-emerald-700">{action}</Badge>
    ))
    .with(LogAction.GET, LogAction.LIST, () => (
      <Badge variant="secondary" className="text-muted-foreground">
        {action}
      </Badge>
    ))
    .with(LogAction.DELETE, () => <Badge variant="destructive">{action}</Badge>)
    .exhaustive();
};
