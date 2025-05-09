import { FC, useMemo } from 'react';
import { ReactComponent as CircleIcon } from '@/assets/icons/bulleted_1.svg';

export interface TagProps {
  color?: string;
  label?: string;
  size?: 'small' | 'medium';
  badge?: string;
}

export const Tag: FC<TagProps> = ({ color, size = 'small', label, badge }) => {
  const className = useMemo(() => {
    const classList = ['rounded-[6px]', 'font-medium', 'leading-[1.35em]', 'flex items-center gap-0.5 max-w-full'];

    if (color) classList.push(`text-text-title`);
    if (size === 'small') classList.push('px-2', 'py-0.5');
    if (size === 'medium') classList.push('px-3', 'py-1');
    if (badge) classList.push('pr-4');
    return classList.join(' ');
  }, [color, size, badge]);

  return (
    <div
      style={{
        backgroundColor: color ? `var(${color})` : undefined,
      }}
      className={className}
    >
      {badge && (
        <CircleIcon
          style={{
            color: `var(${badge})`,
          }}
          className={`h-5 w-5`}
        />
      )}
      <div className={'truncate'}>{label}</div>
    </div>
  );
};
