export const validateParams = (type: string, params: Array<any>) => {
  let message: string;

  const answer = params.every((param) => {
    const value: any = Object.entries(param)[0][1];

    const paramName = Object.entries(param)[0][0];
    let validated: boolean = false;

    if (type === 'must_have') {
      validated = value !== undefined && value !== null && value !== '';

      if (!validated) {
        message = `Please enter a value for "${paramName}"`;
      }
    }

    if (type === 'is_json') {
      try {
        JSON.parse(value);
        validated = true;
      } catch (e) {
        validated = false;
      }

      if (!validated) {
        message = `"${paramName}" is not a valid JSON string`;
      }
    }

    return validated;
  });

  return { validated: answer, message };
};
