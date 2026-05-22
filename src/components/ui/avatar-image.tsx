import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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

export { AvatarImage };
