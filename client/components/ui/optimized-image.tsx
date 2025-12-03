/**
 * Optimized Image Component
 * 
 * Next.js Image component wrapper with best practices
 */

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized Image with loading state and fallback
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  quality = 75,
  sizes,
  objectFit = "cover",
  fallback = "/placeholder.png",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallback);
    onError?.();
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-white/5 animate-pulse" />
      )}

      {/* Error fallback */}
      {hasError && !imageSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-white/5">
          <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
      )}

      {/* Image */}
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          sizes={sizes}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            objectFit === "cover" && "object-cover",
            objectFit === "contain" && "object-contain"
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

/**
 * Product Image Component
 * 
 * Optimized for product cards
 */
export function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src || "/placeholder-product.png"}
      alt={alt}
      fill
      className={className}
      quality={80}
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
      objectFit="cover"
    />
  );
}

/**
 * Avatar Image Component
 * 
 * Optimized for user avatars
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
}: {
  src?: string | null;
  alt: string;
  size?: number;
}) {
  return (
    <OptimizedImage
      src={src || "/placeholder-avatar.png"}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
      quality={90}
      priority={false}
    />
  );
}

