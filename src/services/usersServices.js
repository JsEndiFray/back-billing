import UsersRepository from "../repository/usersRepository.js";
import RefreshTokenRepository from "../repository/refreshTokenRepository.js";
import bcrypt from 'bcrypt';
import {generateAccessToken, generateRefreshToken, verifyToken} from "../services/tokenManager.js";
import { AppError } from "../errors/AppError.js";
import db from "../db/dbConnect.js";

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

//process.loadEnvFile();

/**
 * Servicio de usuarios con autenticación JWT
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
        if (users.length === 0) throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');

        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Persist hashed token — enables revocation
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await RefreshTokenRepository.save(user.id, refreshToken, expiresAt);

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
        if (!refreshToken) throw new AppError('Token de actualización requerido', 400, 'MISSING_REFRESH_TOKEN');

        const decoded = verifyToken(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        if (!decoded) throw new AppError('Token expirado o inválido', 401, 'INVALID_REFRESH_TOKEN');

        // Validate against DB (detects revoked tokens)
        const rows = await RefreshTokenRepository.findValid(refreshToken);
        if (rows.length === 0) throw new AppError('Token expirado o inválido', 401, 'INVALID_REFRESH_TOKEN');

        const users = await UsersRepository.findById(decoded.id);
        if (users.length === 0) throw new AppError('Token expirado o inválido', 401, 'INVALID_REFRESH_TOKEN');

        const user = users[0];

        // Generar nuevos tokens en memoria (antes de la transacción)
        const newAccessToken  = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        const expiresAt       = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Rotate dentro de transacción: revoke + save son atómicos.
        // Si save falla, el token antiguo NO queda revocado → usuario no pierde sesión.
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();
            await RefreshTokenRepository.revoke(refreshToken, conn);
            await RefreshTokenRepository.save(user.id, newRefreshToken, expiresAt, conn);
            await conn.commit();
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }

        return {
            accessToken:  newAccessToken,
            refreshToken: newRefreshToken
        };
    }

    /**
     * Logout: revoca el refresh token de la sesión actual
     */
    static async logout(refreshToken) {
        if (refreshToken) {
            await RefreshTokenRepository.revoke(refreshToken);
        }
    }

    // ========================================
    // CONSULTAS
    // ========================================

    static async getAllUsers() {
        return await UsersRepository.getAll();
    }

    static async getUserByUsername(username) {
        if (!username) return [];
        const users = await UsersRepository.findByUsername(username);
        return users.map(({password, ...rest}) => rest);
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

    static async createUser(user) {
        const userData = {
            username: user.username.toLowerCase().trim(),
            password: user.password.trim(),
            email: user.email.toLowerCase().trim(),
            phone: user.phone.trim(),
            role: user.role.trim(),
        };

        const existsUsername = await UsersRepository.findByUsername(userData.username);
        if (existsUsername.length > 0) throw new AppError('El nombre de usuario ya está en uso', 409, 'DUPLICATE_USERNAME');

        const existsEmail = await UsersRepository.findByEmail(userData.email);
        if (existsEmail.length > 0) throw new AppError('El email ya está en uso', 409, 'DUPLICATE_EMAIL');

        const existsPhone = await UsersRepository.findByPhone(userData.phone);
        if (existsPhone.length > 0) throw new AppError('El teléfono ya está en uso', 409, 'DUPLICATE_PHONE');

        userData.password = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);

        const created = await UsersRepository.create(userData);
        if (created.length === 0) throw new AppError('Error al crear usuario', 500, 'USER_CREATE_ERROR');

        const {password: _, ...safeData} = userData;
        return [{...safeData, id: created[0].id}];
    }

    static async updateUser(id, data) {
        if (!id || isNaN(Number(id))) throw new AppError('ID de usuario inválido', 400, 'INVALID_USER_ID');

        const cleanUserData = {
            id: id,
            username: data.username.toLowerCase().trim(),
            password: data.password.trim(),
            email: data.email.toLowerCase().trim(),
            phone: data.phone.trim(),
            role: data.role.trim(),
        };

        const existing = await UsersRepository.findById(id);
        if (existing.length === 0) throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');

        const currentUser = existing[0];

        if (cleanUserData.username && cleanUserData.username !== currentUser.username) {
            const existingUsername = await UsersRepository.findByUsername(cleanUserData.username);
            if (existingUsername.length > 0) throw new AppError('El nombre de usuario ya está en uso', 409, 'DUPLICATE_USERNAME');
        }

        if (cleanUserData.email && cleanUserData.email !== currentUser.email) {
            const existingEmail = await UsersRepository.findByEmail(data.email);
            if (existingEmail.length > 0) throw new AppError('El email ya está en uso', 409, 'DUPLICATE_EMAIL');
        }

        if (cleanUserData.phone && cleanUserData.phone !== currentUser.phone) {
            const existingPhone = await UsersRepository.findByPhone(cleanUserData.phone);
            if (existingPhone.length > 0) throw new AppError('El teléfono ya está en uso', 409, 'DUPLICATE_PHONE');
        }

        if (cleanUserData.password) {
            cleanUserData.password = await bcrypt.hash(cleanUserData.password, BCRYPT_ROUNDS);
        }

        const updated = await UsersRepository.update(cleanUserData);
        if (updated.length === 0) throw new AppError('Error al actualizar usuario', 500, 'USER_UPDATE_ERROR');
        return [cleanUserData];
    }

    static async deleteUser(id) {
        if (!id || isNaN(Number(id))) throw new AppError('ID de usuario inválido', 400, 'INVALID_USER_ID');

        const existing = await UsersRepository.findById(id);
        if (existing.length === 0) throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');

        const result = await UsersRepository.delete(id);
        if (result.length === 0) throw new AppError('Error al eliminar usuario', 500, 'USER_DELETE_ERROR');
        return [{deleted: true, id: Number(id)}];
    }
}
