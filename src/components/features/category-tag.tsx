interface CategoryTagProps {
  name: string;
  color: string;
}

export function CategoryTag({ name, color }: CategoryTagProps) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {name}
    </span>
  );
}
