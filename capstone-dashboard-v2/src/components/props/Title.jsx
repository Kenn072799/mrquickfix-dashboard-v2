import clsx from "clsx";
import React from "react";

export const Title = ({
  variant = "secondarySemibold",
  size = "lg",
  children,
  ...props
}) => {
  const variantStyle = {
    primaryBold: "text-primary-500 font-bold",
    primarySemibold: "text-primary-500 font-semibold",
    primaryNormal: "text-primary-500",
    secondaryBold: "text-secondary-900 font-bold",
    secondarySemibold: "text-secondary-900 font-semibold",
    secondaryNormal: "text-secondary-900",
    whiteBold: "text-white font-bold",
    whiteSemibold: "text-white font-semibold",
    whiteNormal: "text-white",
    
  };

  const sizeStyle = {
    xxxxxl: "text-5xl",
    xxxxl: "text-4xl",
    xxxl: "text-3xl",
    xxl: "text-2xl",
    xl: "text-xl",
    lg: "text-lg",
    md: "text-md",
    sm: "text-sm",
  };

  return (
    <h1 className={clsx(variantStyle[variant], sizeStyle[size])} {...props}>
      {children}
    </h1>
  );
};
