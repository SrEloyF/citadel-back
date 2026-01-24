module.exports = {
  access: {
    secret: process.env.JWT_SECRET,
    expiresIn: '30m',
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
  },
};
