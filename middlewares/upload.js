const multer = require('multer');

const storage = multer.memoryStorage();

const multerUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Tipo de archivo no permitido'), false);
    }
    cb(null, true);
  }
});

const secureUpload = {
  single: (fieldName) => {
    const middleware = multerUpload.single(fieldName);

    return async (req, res, next) => {
      middleware(req, res, async (err) => {
        if (err) return next(err);

        if (!req.file) return next();

        try {
          const { fileTypeFromBuffer } = await import('file-type');
          const type = await fileTypeFromBuffer(req.file.buffer);

          if (
            !type ||
            !type.mime.startsWith('image/') ||
            type.mime === 'image/svg+xml'
          ) {
            return next(new Error('Archivo no es una imagen válida'));
          }

          return next();
        } catch (error) {
          return next(error);
        }
      });
    };
  },

  fields: (fieldsConfig) => {
    const middleware = multerUpload.fields(fieldsConfig);

    return async (req, res, next) => {
      middleware(req, res, async (err) => {
        if (err) return next(err);

        try {
          const { fileTypeFromBuffer } = await import('file-type');

          const files = req.files || {};

          for (const field in files) {
            for (const file of files[field]) {
              const type = await fileTypeFromBuffer(file.buffer);

              if (
                !type ||
                !type.mime.startsWith('image/') ||
                type.mime === 'image/svg+xml'
              ) {
                return next(new Error('Archivo no es una imagen válida'));
              }
            }
          }

          return next();
        } catch (error) {
          return next(error);
        }
      });
    };
  }
};

module.exports = secureUpload;
