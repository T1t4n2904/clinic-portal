type SubmitButtonProps = {
  children: React.ReactNode;
};

export function SubmitButton({ children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
    >
      {children}
    </button>
  );
}