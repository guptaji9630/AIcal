type Point = {
  x: number;
  y: number;
};

type Gesture = 'fraction' | 'exponent' | 'parentheses' | 'digit' | 'operator' | null;

export const recognizeGesture = (start: Point, end: Point, duration: number): Gesture => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Recognize tap for digits
  if (distance < 10 && duration < 6000) {
    return 'digit';
  }

  // Recognize short stroke for operators
  if (distance < 30 && duration < 3000) {
    return 'operator';
  }

  if (distance < 20) return null; // Ignore other small movements

  if (Math.abs(dy) > Math.abs(dx) && dy < 0) {
    return 'fraction';
  } else if (Math.abs(dx) > Math.abs(dy) && dx > 0 && dy < 0) {
    return 'exponent';
  } else if (Math.abs(dx - dy) < 20 && dx > 0 && dy > 0) {
    return 'parentheses';
  }

  return null;
};

export const applyGesture = (gesture: Gesture, currentExpression: string): string => {
  switch (gesture) {
    case 'fraction':
      return `(${currentExpression})/`;
    case 'exponent':
      return `${currentExpression}^`;
    case 'parentheses':
      return `(${currentExpression})`;
    // 'digit' and 'operator' cases will be handled in the main component
    default:
      return currentExpression;
  }
};