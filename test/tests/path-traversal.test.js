import { LocalFileService } from '../../src/services/fileService.js';

// Unit test — no app or DB needed.
// #resolveAndGuard throws AppError(403) before any filesystem I/O,
// so these tests run without touching disk.

describe('LocalFileService - path traversal protection', () => {
    let service;

    beforeEach(() => {
        service = new LocalFileService();
    });

    it('blocks ../ traversal attempt', async () => {
        await expect(service.downloadFile('../../../etc/passwd'))
            .rejects.toMatchObject({ statusCode: 403 });
    });

    it('blocks absolute path outside upload directory', async () => {
        await expect(service.downloadFile('/etc/passwd'))
            .rejects.toMatchObject({ statusCode: 403 });
    });

    it('allows a valid filename (returns 404, not 403)', async () => {
        // A safe filename stays inside uploadPath — guard passes,
        // file just doesn't exist on disk in the test environment.
        await expect(service.downloadFile('invoice-safe.pdf'))
            .rejects.toMatchObject({ statusCode: 404 });
    });
});
