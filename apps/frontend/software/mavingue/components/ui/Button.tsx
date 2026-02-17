"use client";

import clsx from "clsx";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"danger" }) {
  const { className, variant="primary", ...rest } = props;

  const base = "rounded-lg px-4 py-2 font-semibold disabled:opacity-60";
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return <button className={clsx(base, styles[variant], className)} {...rest} />;
}
