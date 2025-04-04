import { ThemeModeContext } from '@/components/main/useAppThemeMode';
import { renderColor } from '@/utils/color';
import { getIcon } from '@/utils/emoji';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ReactComponent as SpaceIcon1 } from '@/assets/space_icon/space_icon_1.svg';
import { ReactComponent as SpaceIcon2 } from '@/assets/space_icon/space_icon_2.svg';
import { ReactComponent as SpaceIcon3 } from '@/assets/space_icon/space_icon_3.svg';
import { ReactComponent as SpaceIcon4 } from '@/assets/space_icon/space_icon_4.svg';
import { ReactComponent as SpaceIcon5 } from '@/assets/space_icon/space_icon_5.svg';
import { ReactComponent as SpaceIcon6 } from '@/assets/space_icon/space_icon_6.svg';
import { ReactComponent as SpaceIcon7 } from '@/assets/space_icon/space_icon_7.svg';
import { ReactComponent as SpaceIcon8 } from '@/assets/space_icon/space_icon_8.svg';
import { ReactComponent as SpaceIcon9 } from '@/assets/space_icon/space_icon_9.svg';
import { ReactComponent as SpaceIcon10 } from '@/assets/space_icon/space_icon_10.svg';
import { ReactComponent as SpaceIcon11 } from '@/assets/space_icon/space_icon_11.svg';
import { ReactComponent as SpaceIcon12 } from '@/assets/space_icon/space_icon_12.svg';
import { ReactComponent as SpaceIcon13 } from '@/assets/space_icon/space_icon_13.svg';
import { ReactComponent as SpaceIcon14 } from '@/assets/space_icon/space_icon_14.svg';
import { ReactComponent as SpaceIcon15 } from '@/assets/space_icon/space_icon_15.svg';
import DOMPurify from 'dompurify';

export const getIconComponent = (icon: string) => {
  switch (icon) {
    case 'space_icon_1':
    case '':
      return SpaceIcon1;
    case 'space_icon_2':
      return SpaceIcon2;
    case 'space_icon_3':
      return SpaceIcon3;
    case 'space_icon_4':
      return SpaceIcon4;
    case 'space_icon_5':
      return SpaceIcon5;
    case 'space_icon_6':
      return SpaceIcon6;
    case 'space_icon_7':
      return SpaceIcon7;
    case 'space_icon_8':
      return SpaceIcon8;
    case 'space_icon_9':
      return SpaceIcon9;
    case 'space_icon_10':
      return SpaceIcon10;
    case 'space_icon_11':
      return SpaceIcon11;
    case 'space_icon_12':
      return SpaceIcon12;
    case 'space_icon_13':
      return SpaceIcon13;
    case 'space_icon_14':
      return SpaceIcon14;
    case 'space_icon_15':
      return SpaceIcon15;

    default:
      return null;
  }
};

function SpaceIcon({ value, char, bgColor, className: classNameProp }: {
  value: string,
  char?: string,
  bgColor?: string,
  className?: string
}) {
  const IconComponent = getIconComponent(value);
  const isDark = useContext(ThemeModeContext)?.isDark || false;
  const [customIconContent, setCustomIconContent] = useState<string>('');

  useEffect(() => {
    if (value) {
      void getIcon(value).then(icon => {
        setCustomIconContent(icon?.content || '');
      });
    }
  }, [value]);

  const customIcon = useMemo(() => {
    if (customIconContent) {
      const cleanSvg = DOMPurify.sanitize(customIconContent.replaceAll('black', isDark ? 'black' : 'white').replace('<svg', '<svg width="100%" height="100%"'), {
        USE_PROFILES: { svg: true, svgFilters: true },
      });

      return <span className={'flex p-[0.2em] items-center justify-center'}><span dangerouslySetInnerHTML={{
        __html: cleanSvg,
      }}/></span>;
    }
  }, [customIconContent, isDark]);

  const content = useMemo(() => {
    if (char) {
      return (
        <span className={'text-content-on-fill font-medium h-full w-full flex items-center justify-center'}>
        {char}
      </span>
      );
    }

    if (!IconComponent) {
      return customIcon;
    }

    return <IconComponent className={'h-full w-full'}/>;
  }, [IconComponent, char, customIcon]);

  const className = useMemo(() => {
    const classList = ['icon', 'h-[1.2em]', 'w-[1.2em]', 'shrink-0', 'rounded-[4px]', 'p-[0.1em]'];

    if (classNameProp) {
      classList.push(classNameProp);
    }

    return classList.join(' ');
  }, [classNameProp]);

  return <span
    className={className}
    style={{
      backgroundColor: bgColor ? renderColor(bgColor) : 'rgb(163, 74, 253)',
    }}
  >{content}</span>;
}

export default SpaceIcon;
