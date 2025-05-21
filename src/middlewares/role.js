export default function role(roles = []) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'No tienes permisos para realizar esta acción.' });
        }

        next();
    }
}