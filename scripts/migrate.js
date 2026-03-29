/**
 * Runner de migraciones SQL.
 *
 * Comportamiento:
 *  - Crea la tabla schema_migrations si no existe.
 *  - Lee todos los archivos NNN_*.sql de /migrations, ordenados por nombre.
 *  - Aplica solo los que aún no están registrados en schema_migrations.
 *  - Registra cada migración aplicada con su timestamp.
 *  - Para en el primer error para no dejar la BD en estado inconsistente.
 *
 * Uso:
 *   npm run migrate
 *   node scripts/migrate.js
 */

try { process.loadEnvFile(); } catch { /* .env ya cargado o no existe */ }

import { readdir, readFile } from 'node:fs/promises';
import { join, dirname }     from 'node:path';
import { fileURLToPath }     from 'node:url';
import mysql2                from 'mysql2/promise';

const __dirname       = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR  = join(__dirname, '..', 'migrations');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Crea la tabla de tracking si no existe.
 * Si el usuario no tiene CREATE TABLE, da instrucciones claras.
 */
async function ensureMigrationsTable(conn) {
    // Comprobar si la tabla ya existe antes de intentar crearla
    const [[row]] = await conn.execute(
        `SELECT COUNT(*) AS cnt
         FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schema_migrations'`
    );

    if (row.cnt > 0) return; // Ya existe, nada que hacer

    try {
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id         INT          AUTO_INCREMENT PRIMARY KEY,
                filename   VARCHAR(255) NOT NULL,
                applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uq_filename (filename)
            )
        `);
    } catch (err) {
        if (err.code === 'ER_TABLEACCESS_DENIED_ERROR' || err.errno === 1142) {
            console.error('✗ El usuario de BD no tiene permiso para CREATE TABLE.');
            console.error('  Ejecuta primero como administrador:');
            console.error('  mysql -h $DB_HOST -u ADMIN_USER -p $DB_DATABASE < scripts/setup-migrations.sql');
            console.error('  O define DB_MIGRATE_USER / DB_MIGRATE_PASSWORD en .env con un usuario con CREATE.');
            process.exit(1);
        }
        throw err;
    }
}

/** Devuelve el conjunto de nombres de archivo ya aplicados. */
async function getApplied(conn) {
    const [rows] = await conn.execute(
        'SELECT filename FROM schema_migrations ORDER BY applied_at ASC'
    );
    return new Set(rows.map(r => r.filename));
}

/** Limpia USE <db>; ya que la conexión ya apunta a la base correcta. */
function stripUseLine(sql) {
    return sql.replace(/^\s*USE\s+\S+\s*;\s*$/gim, '');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
    const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE'];
    const missing  = required.filter(k => !process.env[k]);
    if (missing.length > 0) {
        console.error(`✗ Variables de entorno faltantes: ${missing.join(', ')}`);
        process.exit(1);
    }

    // Si se definen DB_MIGRATE_USER / DB_MIGRATE_PASSWORD se usan para
    // el runner (necesita CREATE TABLE). De lo contrario se usa el usuario de app.
    const user     = process.env.DB_MIGRATE_USER     || process.env.DB_USER;
    const password = process.env.DB_MIGRATE_PASSWORD || process.env.DB_PASSWORD;

    // Conexión dedicada con multipleStatements para ejecutar archivos SQL completos
    const conn = await mysql2.createConnection({
        host:               process.env.DB_HOST,
        user,
        password,
        port:               Number(process.env.DB_PORT) || 3306,
        database:           process.env.DB_DATABASE,
        multipleStatements: true,
    });

    try {
        await ensureMigrationsTable(conn);

        const applied = await getApplied(conn);

        // Archivos con formato NNN_nombre.sql ordenados lexicográficamente
        const allFiles = (await readdir(MIGRATIONS_DIR))
            .filter(f => /^\d{3}_.*\.sql$/.test(f))
            .sort();

        const pending = allFiles.filter(f => !applied.has(f));

        const isBaseline = process.argv.includes('--baseline');

        if (isBaseline) {
            if (pending.length === 0) {
                console.log('✓ No hay migraciones pendientes para marcar como base.');
                return;
            }
            console.log(`Marcando ${pending.length} migración(es) como ya aplicadas (baseline)...\n`);
            for (const file of pending) {
                await conn.execute(
                    'INSERT INTO schema_migrations (filename) VALUES (?)', [file]
                );
                console.log(`  ✓ ${file} registrada`);
            }
            console.log(`\n✓ Baseline completado. Ejecuta 'npm run migrate' para futuras migraciones.`);
            return;
        }

        if (pending.length === 0) {
            console.log('✓ No hay migraciones pendientes.');
            return;
        }

        console.log(`Aplicando ${pending.length} migración(es)...\n`);

        for (const file of pending) {
            process.stdout.write(`  → ${file} ... `);

            const raw = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
            const sql = stripUseLine(raw).trim();

            if (!sql) {
                // Archivo vacío o solo comentarios — marcar sin ejecutar
                await conn.execute(
                    'INSERT INTO schema_migrations (filename) VALUES (?)', [file]
                );
                console.log('✓ (vacío, omitido)');
                continue;
            }

            await conn.query(sql);
            await conn.execute(
                'INSERT INTO schema_migrations (filename) VALUES (?)', [file]
            );
            console.log('✓');
        }

        console.log(`\n✓ ${pending.length} migración(es) aplicada(s) correctamente.`);

    } catch (err) {
        console.error(`\n✗ Error durante la migración: ${err.message}`);
        process.exit(1);
    } finally {
        await conn.end();
    }
}

run();
