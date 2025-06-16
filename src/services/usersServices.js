import UsersRepository from "../repository/usersRepository.js";
import bcrypt from 'bcrypt';
import {generateAccessToken, generateRefreshToken, verifyToken} from "../middlewares/tokenManager.js";

process.loadEnvFile();

/**
 * Servicio de usuarios con autenticación JWT
 * CORREGIDO: Ahora usa patrón consistente con otros servicios
 */
export default class UserService {

    // ========================================
    // AUTENTICACIÓN JWT
    // ========================================

    /**
     * Login con JWT tokens
     * Nota: Retorna objeto completo (único caso donde es apropiado)
     */
    static async login(username, password) {
        const user = await UsersRepository.findByUsername(username);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return {
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            },
            accessToken,
            refreshToken
        };
    }

    /**
     * Renovar token de acceso usando refresh token
     */
    static async refreshToken(refreshToken) {
        if (!refreshToken) return null;

        const decoded = verifyToken(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );

        if (!decoded) return null;

        const user = await UsersRepository.findById(decoded.id);
        if (!user || user.length === 0) return null;

        const userData = Array.isArray(user) ? user[0] : user;

        const newAccessToken = generateAccessToken(userData);
        const newRefreshToken = generateRefreshToken(userData);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }

    // ========================================
    // CONSULTAS
    // ========================================

    static async getAllUsers() {
        return await UsersRepository.getAll();
    }

    static async getUsername(username) {
        if (!username) return null;
        const user = await UsersRepository.findByUsername(username);
        return user || null;
    }

    static async getUserEmail(email) {
        if (!email) return null;
        const userEmail = await UsersRepository.findByEmail(email);
        return userEmail || null;
    }

    static async getUserPhone(phone) {
        if (!phone) return null;
        const userPhone = await UsersRepository.findByPhone(phone);
        return userPhone || null;
    }

    static async getUserId(id) {
        if (!id || isNaN(Number(id))) return null;
        const userId = await UsersRepository.findById(id);
        return userId || null;
    }

    // ========================================
    // CRUD CON HASH PASSWORD Y VALIDACIONES
    // ========================================

    /**
     * Crear usuario con validaciones de unicidad
     * ✅ CORREGIDO: Ahora usa null para consistencia
     */
    static async createUser(user) {
        const userData = {
            username: user.username.toLowerCase().trim(),
            password: user.password.trim(),
            email: user.email.toLowerCase().trim(),
            phone: user.phone.trim(),
            role: user.role.trim(),
        }

        // Validar campos únicos - ahora retorna null para consistencia
        const existsUsername = await UsersRepository.findByUsername(userData.username);
        if (existsUsername) return null; // ✅ Cambiado de objeto a null

        const existsEmail = await UsersRepository.findByEmail(userData.email);
        if (existsEmail) return null; // ✅ Cambiado de objeto a null

        const existsPhone = await UsersRepository.findByPhone(userData.phone);
        if (existsPhone) return null; // ✅ Cambiado de objeto a null

        // Hash contraseña antes de guardar
        userData.password = await bcrypt.hash(userData.password, 10);

        const created = await UsersRepository.create(userData);
        if (!created) return null;

        return userData;
    }

    /**
     * Actualizar usuario con validaciones de duplicados
     * ✅ CORREGIDO: Consistente con createUser
     */
    static async updateUser(id, data) {
        if (!id || isNaN(Number(id))) return null;

        const cleanUserData = {
            id: id,
            username: data.username.toLowerCase().trim(),
            password: data.password.trim(),
            email: data.email.toLowerCase().trim(),
            phone: data.phone.trim(),
            role: data.role.trim(),
        }

        const existing = await UsersRepository.findById(id);
        if (!existing) return null;

        // Verificar duplicados solo si cambian los valores
        if (cleanUserData.username && cleanUserData.username !== existing.username) {
            const existingUsername = await UsersRepository.findByUsername(cleanUserData.username);
            if (existingUsername) return null; // ✅ Consistente con createUser
        }

        if (cleanUserData.email && cleanUserData.email !== existing.email) {
            const existingEmail = await UsersRepository.findByEmail(data.email);
            if (existingEmail) return null; // ✅ Consistente con createUser
        }

        if (cleanUserData.phone && cleanUserData.phone !== existing.phone) {
            const existingPhone = await UsersRepository.findByPhone(cleanUserData.phone);
            if (existingPhone) return null; // ✅ Consistente con createUser
        }

        // Hash nueva contraseña si existe
        if (cleanUserData.password) {
            cleanUserData.password = await bcrypt.hash(cleanUserData.password, 10);
        }

        const updated = await UsersRepository.update(cleanUserData);
        if (!updated) return null;

        return cleanUserData;
    }

    static async deleteUser(id) {
        if (!id || isNaN(Number(id))) return null;

        const existing = await UsersRepository.findById(id);
        if (!existing) return null;

        const result = await UsersRepository.delete(id);
        return result > 0;
    }
}

/**
 * ✅ PATRÓN CORREGIDO Y CONSISTENTE:
 * - null para duplicados/errores simples
 * - Objetos solo para autenticación (login/refresh)
 * - Sanitización lowercase/trim apropiada
 * - Hash de contraseñas seguro
 */