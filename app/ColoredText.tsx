import React, { CSSProperties } from 'react';
import { useRandomColor } from '@/app/hooks/useRandomColor';


type ColoredTextProps =
{
  text: string;
  className?: string;
  style?: CSSProperties;
};


const ColoredText: React.FC<ColoredTextProps> = ({ text, className, style }) =>
{
  const coloredText = useRandomColor(text, className, style);
  return <div>{coloredText}</div>;
};

export default ColoredText;
