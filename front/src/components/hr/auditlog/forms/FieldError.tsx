type FieldErrorProps = {
  message?: string;
};

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p className="mt-1 text-[12px] leading-[16px] text-red-500">{message}</p>
  );
}
