import React, { createContext, useContext, useState } from 'react';


interface AnimationContext
{
  isAnimating: boolean;
  setAnimating: (animating: boolean) => void;
}

const AnimationContext = createContext<AnimationContext>({ isAnimating: false, setAnimating: () => {} });


export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAnimating, setAnimating] = useState(false);

  return (
    <AnimationContext.Provider value={{ isAnimating, setAnimating }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => useContext(AnimationContext);
