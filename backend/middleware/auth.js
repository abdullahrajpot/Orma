const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'orma_dev_secret_change_in_prod';

module.exports = function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required.' });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
