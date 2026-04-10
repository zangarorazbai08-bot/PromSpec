export const notFound = (req, res) => {
  res.status(404).json({
    message: `${req.method} ${req.originalUrl} табылмады`
  });
};

export const errorHandler = (error, req, res, next) => {
  const status =
    error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE'
      ? 400
      : error.status || 500;

  const message =
    error.code === 'LIMIT_FILE_SIZE'
      ? 'Бір сурет көлемі тым үлкен. Әр файл 5 МБ-тан аспауы керек'
      : error.code === 'LIMIT_FILE_COUNT'
        ? 'Тым көп файл таңдалды'
        : error.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Жарамсыз файл өрісі жіберілді'
          : error.message || 'Ішкі сервер қатесі';

  res.status(status).json({
    message
  });
};
