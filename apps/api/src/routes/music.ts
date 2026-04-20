import { FastifyInstance } from 'fastify';
import { MusicService } from '../services/musicService';
import { prisma } from '../db/client';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const idParamSchema = z.object({
  id: z.string(),
});

export const musicRoutes = async (app: FastifyInstance) => {
  app.get('/trending', async (request, reply) => {
    const tracks = await MusicService.getTrending();
    return { tracks };
  });

  app.get('/new-releases', async (request, reply) => {
    const tracks = await MusicService.getNewReleases();
    return { tracks };
  });


  app.get('/:id/cover', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const storage = await prisma.songStorage.findUnique({ where: { trackId: id } });
    if (!storage || !fs.existsSync(storage.filePath)) return reply.status(404).send({ error: 'Not found' });
    
    try {
      const { parseFile } = await import('music-metadata');
      const metadata = await parseFile(storage.filePath);
      const picture = metadata.common.picture?.[0];
      if (picture) {
        reply.header('Content-Type', picture.format);
        return reply.send(picture.data);
      }
    } catch {}
    return reply.status(404).send({ error: 'No cover' });
  });

  app.get('/:id/stream', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    console.log(`[Stream Req] ID: ${id}`);

    try {
        const storage = await prisma.songStorage.findUnique({ where: { trackId: id } });
        if (!storage) return reply.status(404).send({ error: 'DB record missing' });

        let filePath = storage.filePath;
        if (!fs.existsSync(filePath)) {
            // Extension probe
            const exts = ['.mp3', '.flac', '.m4a', '.mp4'];
            let found = false;
            for (const ext of exts) {
                if (fs.existsSync(filePath + ext)) {
                    filePath += ext;
                    found = true;
                    await prisma.songStorage.update({ where: { id: storage.id }, data: { filePath } });
                    break;
                }
            }
            if (!found) return reply.status(404).send({ error: 'File missing' });
        }

        const mediaRoot = path.resolve(__dirname, '../../media');
        const relativePath = path.relative(mediaRoot, filePath).replace(/\\/g, '/');
        
        console.log(`[Stream Debug] mediaRoot: ${mediaRoot}`);
        console.log(`[Stream Debug] filePath: ${filePath}`);
        console.log(`[Stream Debug] relativePath: ${relativePath}`);
        console.log(`[Stream Debug] exists: ${fs.existsSync(filePath)}`);

        if (!fs.existsSync(filePath)) {
          return reply.status(404).send({ error: 'File path invalid after probe' });
        }

        console.log(`[Stream OK] Serving: ${relativePath}`);
        return reply.sendFile(relativePath, mediaRoot);
    } catch (err) {
        console.error('[Stream Error]', err);
        return reply.status(500).send({ error: 'Streaming failed' });
    }
  });

  app.get('/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const track = await MusicService.getTrackById(id);
    return { track };
  });
};
