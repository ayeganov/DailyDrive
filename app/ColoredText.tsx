import React, { CSSProperties } from 'react';
import { useRandomColor } from '@/app/hooks/useRandomColor';


type ColoredTextProps =
{
  text: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
};


const ColoredText: React.FC<ColoredTextProps> = ({ text, className, style, onClick }) =>
{
  const coloredText = useRandomColor(text, className, style);
  return <div onClick={onClick}>{coloredText}</div>;
};

export default ColoredText;
