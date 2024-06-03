
export const getRandomColor = (): string => {
  const getRandomValue = () => Math.floor(Math.random() * 156) + 100; // Ensure the value is between 100 and 255
  const red = getRandomValue();
  const green = getRandomValue();
  const blue = getRandomValue();
  return `rgb(${red}, ${green}, ${blue})`;
};

