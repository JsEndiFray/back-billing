import UsersRepository from "../repository/usersRepository.js";
import bcrypt from 'bcrypt';
import {generateAccessToken, generateRefreshToken, verifyToken} from "../middlewares/tokenManager.js";

//process.loadEnvFile();

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
        const users = await UsersRepository.findByUsername(username);
        if (!users.length > 0) return null;

        const user = users[0];
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

        const users = await UsersRepository.findById(decoded.id);
        if (!users.length > 0) return null;

        const user = users[0];
        if (!user) return null;

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

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

    static async getUserByUsername(username) {
        if (!username) return [];
        return await UsersRepository.findByUsername(username);

    }

    static async getUserByEmail(email) {
        if (!email) return [];
        return await UsersRepository.findByEmail(email);

    }

    static async getUserByPhone(phone) {
        if (!phone) return [];
        return await UsersRepository.findByPhone(phone);

    }

    static async getUserById(id) {
        if (!id || isNaN(Number(id))) return [];
        return await UsersRepository.findById(id);

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
        if (existsUsername.length > 0) return [];

        const existsEmail = await UsersRepository.findByEmail(userData.email);
        if (existsEmail.length > 0) return [];

        const existsPhone = await UsersRepository.findByPhone(userData.phone);
        if (existsPhone.length > 0) return [];

        // Hash contraseña antes de guardar
        userData.password = await bcrypt.hash(userData.password, 10);

        const created = await UsersRepository.create(userData);
        if (!created.length > 0) return [];

        return [{...userData, id: created[0].id}];
    }

    /**
     * Actualizar usuario con validaciones de duplicados
     * Consistente con createUser
     */
    static async updateUser(id, data) {
        if (!id || isNaN(Number(id))) return [];

        const cleanUserData = {
            id: id,
            username: data.username.toLowerCase().trim(),
            password: data.password.trim(),
            email: data.email.toLowerCase().trim(),
            phone: data.phone.trim(),
            role: data.role.trim(),
        }

        const existing = await UsersRepository.findById(id);
        if (!existing.length > 0) return [];

        const currentUser = existing[0];
        if (!currentUser) return [];

        // Verificar duplicados solo si cambian los valores
        if (cleanUserData.username && cleanUserData.username !== currentUser.username) {
            const existingUsername = await UsersRepository.findByUsername(cleanUserData.username);
            if (existingUsername.length > 0) return [];
        }

        if (cleanUserData.email && cleanUserData.email !== currentUser.email) {
            const existingEmail = await UsersRepository.findByEmail(data.email);
            if (existingEmail.length > 0) return [];
        }

        if (cleanUserData.phone && cleanUserData.phone !== currentUser.phone) {
            const existingPhone = await UsersRepository.findByPhone(cleanUserData.phone);
            if (existingPhone.length > 0) return [];
        }

        // Hash nueva contraseña si existe
        if (cleanUserData.password) {
            cleanUserData.password = await bcrypt.hash(cleanUserData.password, 10);
        }

        const updated = await UsersRepository.update(cleanUserData);
        return updated.length > 0 ? [cleanUserData] : [];
    }

    static async deleteUser(id) {
        if (!id || isNaN(Number(id))) return [];

        const existing = await UsersRepository.findById(id);
        if (!existing.length > 0) return [];

        const user = existing[0];
        if (!user) return [];

        const result = await UsersRepository.delete(id);
        return result.length > 0 ? [{deleted: true, id: Number(id)}] : [];
    }
}

/**
 * ✅ PATRÓN CONSISTENTE APLICADO:
 * - Arrays [] para duplicados/errores
 * - Arrays [data] para éxito
 * - Verificaciones .length > 0 para arrays
 * - EXCEPCIÓN: login/refresh retornan objetos de auth (caso especial)
 * - Sanitización lowercase/trim apropiada
 * - Hash de contraseñas seguro
 */