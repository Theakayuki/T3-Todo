import React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = (props) => {
  const { children, onClick, className, type } = props;
  return (
    <button
      className={twMerge(
        "mx-auto rounded-full border border-rose-950 bg-amber-100 px-10 py-3 font-semibold text-orange-950 no-underline shadow-md shadow-rose-800 transition hover:bg-amber-100/75 dark:border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:shadow-slate-300 dark:hover:bg-slate-700",
        className
      )}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
