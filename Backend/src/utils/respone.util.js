const responseOK = (res, message = "OK", data, statusCode = 200) => {
  const response = {
    status: "OK",
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const responseNG = (res, message = "NG", statusCode = 400) => {
  return res.status(statusCode).json({
    status: "NG",
    message,
  });
};

const responseErrorServer = (res, message = "Server error", statusCode = 500) => {
  return res.status(statusCode).json({
    status: "NG",
    message,
  });
};

module.exports = { responseOK, responseNG, responseErrorServer};
