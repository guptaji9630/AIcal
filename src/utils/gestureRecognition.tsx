type Point = {
    x: number;
    y: number;
  };
  
  type Gesture = 'fraction' | 'exponent' | 'parentheses' | null;
  
  export const recognizeGesture = (start: Point, end: Point): Gesture => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
  
    if (distance < 20) return null; // Ignore small movements
  
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
      default:
        return currentExpression;
    }
  };