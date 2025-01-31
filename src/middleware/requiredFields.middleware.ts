import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/request.types';

const checkRequiredFields = (mandatoryFields: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    let missingFields: string[] = [];
    mandatoryFields.forEach((arg) => {
      if (!(arg in req.body)) {
        missingFields.push(arg);
      }
    });

    const missingFieldsLength = missingFields.length;
    if (!missingFieldsLength) {
      next();
      return;
    }

    const linkingVerb = missingFieldsLength === 1 ? 'is' : 'are';
    const errorMessage = missingFieldsLength === 1 ? 'REQUIRED FIELD IS MISSING' : 'REQUIRED FIELDS ARE MISSING';

    res.status(400).json({
      error: {
        message: errorMessage,
        cause:
          missingFields.reduce((missingField, currentField, index) => {
            if (index === 0) {
              missingField = currentField;
            } else if (index === missingFieldsLength - 1) {
              missingField += ' and ' + currentField;
            } else {
              missingField += ', ' + currentField;
            }
            return missingField;
          }, '') + ` ${linkingVerb} not found.`,
      },
    });
  };
};

export default checkRequiredFields;
