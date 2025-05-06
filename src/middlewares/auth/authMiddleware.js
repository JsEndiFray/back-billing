import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'No autorizado. Token requerido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // aquí tendremos { id, username, role }
        next();
    } catch (error) {
        return res.status(401).json({ msg: 'Token inválido o expirado.' });
    }
}