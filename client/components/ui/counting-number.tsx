"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface CountingNumberProps {
  value: number;
  className?: string;
  duration?: number;
  formatOptions?: Intl.NumberFormatOptions;
}

export function CountingNumber({ 
  value, 
  className = "",
  duration = 1.5,
  formatOptions = {}
}: CountingNumberProps) {
  const [isClient, setIsClient] = useState(false);
  
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) => {
    return new Intl.NumberFormat("uz-UZ", formatOptions).format(Math.round(current));
  });

  useEffect(() => {
    setIsClient(true);
    spring.set(value);
  }, [spring, value]);

  if (!isClient) {
    return <span className={className}>0</span>;
  }

  return <motion.span className={className}>{display}</motion.span>;
}

