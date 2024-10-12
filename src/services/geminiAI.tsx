// A simple and safe way to evaluate mathematical expressions
const safeEval = (expression: string): number => {
  // Remove any characters that aren't numbers, operators, or parentheses
  const sanitizedExpr = expression.replace(/[^0-9+\-*/().]/g, '');
  
  // Use Function constructor to create a function that returns the result
  // This is safer than using eval() directly
  try {
    return new Function(`return ${sanitizedExpr}`)() as number;
  } catch (error) {
    console.error('Error evaluating expression:', error);
    throw new Error('Invalid mathematical expression');
  }
};

export const calculateExpression = async (expression: string): Promise<string> => {
  try {
    const result = safeEval(expression);
    return result.toString();
  } catch (error) {
    console.error('Error calculating expression:', error);
    throw error;
  }
};