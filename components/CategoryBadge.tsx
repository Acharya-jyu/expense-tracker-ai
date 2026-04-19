import { CATEGORY_BG, getCategoryColor, BuiltinCategory } from '@/types/expense';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

export default function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const cls = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  const builtinClass = CATEGORY_BG[category as BuiltinCategory];

  if (builtinClass) {
    return (
      <span className={`inline-flex items-center rounded-full font-medium ${cls} ${builtinClass}`}>
        {category}
      </span>
    );
  }

  const color = getCategoryColor(category);
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${cls}`}
      style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}40` }}
    >
      {category}
    </span>
  );
}
