import jwt from 'jsonwebtoken';

//Tokens de acceso (corta duración)
export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // Token de corta duración
    );
};

//Tokens de refresco (larga duración)
export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id }, //Solo incluimos el ID para seguridad
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '7d' } //Token de larga duración
    );
};

//Función para verificar token
export const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        console.error("Error al verificar token:", error);
        return null;
    }
};