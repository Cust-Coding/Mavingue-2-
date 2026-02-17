import { forwardRef } from "react";
import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(function Input({ className, error, label, id, ...props }, ref) {
  const inputId = id ?? props.name;

  return (
    <label className="block w-full" htmlFor={inputId}>
      {label ? <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        {...props}
        id={inputId}
        ref={ref}
        className={clsx(
          "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
          error && "border-red-500 focus:border-red-500 focus:ring-red-100",
          className,
        )}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
});

export default Input;
