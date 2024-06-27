import { CSSProperties, useEffect, useState } from 'react';
import { getRandomColor } from '@/app/lib/randomColor';


export const useRandomColor = (text: string, className?: string, style?: CSSProperties) => {
  const [coloredText, setColoredText] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const letters = text.split('');
    const coloredLetters = letters.map((letter, index) => (
      <span key={index} className={className} style={{ color: getRandomColor(), padding: 0, ...style }}>
        {letter}
      </span>
    ));

    setColoredText(coloredLetters);
  }, [text, className, style]);

  return coloredText;
};
