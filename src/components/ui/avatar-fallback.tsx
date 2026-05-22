import * as React from "react";
import { cn } from "@/lib/utils";

function AvatarFallback({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  );
}
AvatarFallback.displayName = "AvatarFallback";

export { AvatarFallback };
