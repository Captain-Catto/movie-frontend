import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

function Avatar({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}
Avatar.displayName = "Avatar";

function AvatarImage({
  className,
  alt,
  src,
  width = 40,
  height = 40,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof Image> & {
  ref?: React.Ref<React.ComponentRef<typeof Image>>;
}) {
  return (
    <Image
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  );
}
AvatarImage.displayName = "AvatarImage";

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

export { Avatar, AvatarImage, AvatarFallback };
