import { LoaderCircle } from "lucide-react";

export const Loading = () => (
  <div className="flex h-full w-full items-center justify-center">
    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
  </div>
);
