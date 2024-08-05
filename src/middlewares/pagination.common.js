const paggination = (req, res, next) => {
  let { offset, limit } = req.query;

  if (offset !== undefined) {
    offset = parseInt(offset);
    if (isNaN(offset)) {
      req.query.offset = 0;
    } else {
      req.query.offset = offset;
    }
  } else {
    req.query.offset = 0;
  }

  if (limit !== undefined) {
    limit = parseInt(limit);
    if (isNaN(limit)) {
      req.query.limit = 10;
    } else {
      req.query.limit = limit;
    }
  } else {
    req.query.limit = 10;
  }

  next();
};

export default paggination;
