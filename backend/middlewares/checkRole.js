export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ 
        message: `You do not have permission to perform this action. Required roles: ${allowedRoles.join(', ')}`
      });
    }
  };
}; 