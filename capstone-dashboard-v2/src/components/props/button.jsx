import clsx from "clsx";
import React from "react";

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  ...props
}) => {
  const variantStyle = {
    primary:
      "bg-primary-500 select-none text-white rounded-sm w-full flex items-center justify-center hover:bg-primary-600 active:bg-primary-700",
    secondary:
      "bg-primary-500 select-none text-white rounded-sm hover:bg-primary-600 active:bg-primary-700",
  };

  const sizeStyle = {
    md: "text-sm font-semibold p-3",
    sm: "text-sm font-semibold p-2",
  };

  const baseStyle = "transition-all";

  return (
    <button
      className={clsx(variantStyle[variant], sizeStyle[size], baseStyle)}
      {...props}
    >
      {children}
    </button>
  );
};
