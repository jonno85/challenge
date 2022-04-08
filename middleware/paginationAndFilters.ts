import { PaginateArgs } from '@nc/utils/pagination';
import { NextFunction, Request, Response } from 'express';

export default function paginationAndFilters(req: Request, res: Response, next: NextFunction) {
  const { page = 0, offset = 0, size = 10, sortBy, direction, ...rest } = req.query;

  let sortByResult: string[] = [];

  if (sortBy) {
    sortByResult = sortBy
      .replace('[', '')
      .replace(']', '')
      .split(',')
      .map((element) => element.trim().replace(/['"]+/g, ''));
  }

  let directionResult = [];
  if (direction) {
    directionResult = direction
      .replace('[', '')
      .replace(']', '')
      .split(',')
      .map((element) => element.trim().replace(/['"]+/g, ''));
  }

  const cleanFilters = {};
  for (const [key, value] of Object.entries(rest)) {
    const cleanKey = key.replace(/['"]+/g, '');
    const cleanValue = value.replace(/['"]+/g, '');
    cleanFilters[cleanKey] = cleanValue;
  }

  const paginate: PaginateArgs = {
    pagination: { page: +page, offset: +offset, pageSize: +size },
    sort: { by: sortByResult, direction: directionResult },
    filters: { ...cleanFilters },
  };

  req.paginate = paginate;
  /*
   pagination is not added into the response because not all the endpoints are subjected to pagination
   */

  next();
}
