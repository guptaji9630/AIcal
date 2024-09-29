export const postProcessOCR = (text: string): string => {
    const replacements: { [key: string]: string } = {
      'x': '*',
      '÷': '/',
      '−': '-',
      '=': '',
    };
    return text.replace(/[x÷−=]/g, match => replacements[match] || match);
  };
  
  export const isValidMathExpression = (expression: string): boolean => {
    try {
      // This is a simple check. In a real app, you'd want a more robust validation.
      eval(expression);
      return true;
    } catch (e) {
      return false;
    }
  };