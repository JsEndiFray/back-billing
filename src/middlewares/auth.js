import {verifyToken} from "./tokenManager.js";

export default function auth(req, res, next) {

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json('No autorizado. Token requerido.');
    }

    //Verificar el token - verifyToken ya maneja internamente los errores
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    if (!decoded) {
        return res.status(401).json('Token inválido o expirado.');
    }

    //Token válido
    req.user = decoded; //aquí tendremos { id, username, role }
    next();
}