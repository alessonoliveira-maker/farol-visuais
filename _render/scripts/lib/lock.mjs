/**
 * Trava entre processos: um diretorio criado com `mkdir`, que e atomico no sistema de arquivos.
 *
 * Regra da casa: nao travar o PC. Varios agentes chamando `render` ou `check` ao mesmo tempo
 * entram em fila aqui, em vez de abrir varios navegadores ou varios compiladores. A trava tem
 * dono (pid), batimento (mtime renovado) e expiracao: dono morto ou batimento parado ha mais de
 * `STALE_MS` libera a vez para o proximo da fila.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { LOCK_DIR } from './paths.mjs';

const STALE_MS = Number(process.env.FAROL_LOCK_STALE_MS ?? 120_000);
const HEARTBEAT_MS = 10_000;
const MAX_WAIT_MS = Number(process.env.FAROL_LOCK_MAX_WAIT_MS ?? 45 * 60_000);
const OWNER_FILE = path.join(LOCK_DIR, 'owner.json');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

function readOwner() {
  try {
    const stat = fs.statSync(OWNER_FILE);
    const owner = JSON.parse(fs.readFileSync(OWNER_FILE, 'utf8'));
    return { ...owner, beatAge: Date.now() - stat.mtimeMs };
  } catch {
    try {
      const stat = fs.statSync(LOCK_DIR);
      // Diretorio sem dono: o criador ainda vai gravar o owner.json, ou morreu entre as duas chamadas.
      return { pid: -1, label: '?', beatAge: Date.now() - stat.mtimeMs, orphanDir: true };
    } catch {
      return null;
    }
  }
}

function breakStale(owner) {
  const grave = `${LOCK_DIR}-vencida-${process.pid}-${Date.now()}`;
  try {
    fs.renameSync(LOCK_DIR, grave);
    fs.rmSync(grave, { recursive: true, force: true });
    console.warn(
      `[trava] liberada trava vencida (pid ${owner.pid}, ${owner.label}, batimento ha ${Math.round(owner.beatAge / 1000)} s).`,
    );
  } catch {
    // Outro processo chegou antes; a proxima volta do laco decide.
  }
}

export async function acquireLock(label) {
  const started = Date.now();
  let announced = false;
  for (;;) {
    try {
      fs.mkdirSync(LOCK_DIR);
      fs.writeFileSync(
        OWNER_FILE,
        JSON.stringify({
          pid: process.pid,
          label,
          host: os.hostname(),
          startedAt: new Date().toISOString(),
        }),
      );
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    const owner = readOwner();
    if (owner) {
      const grace = owner.orphanDir ? 10_000 : STALE_MS;
      const dead = !owner.orphanDir && !isAlive(owner.pid);
      if (dead || owner.beatAge > grace) {
        breakStale(owner);
        continue;
      }
      if (!announced) {
        console.log(
          `[trava] em fila: "${owner.label}" (pid ${owner.pid}) esta usando a ferramenta. Aguardando a vez...`,
        );
        announced = true;
      }
    }
    if (Date.now() - started > MAX_WAIT_MS) {
      throw new Error(`[trava] desisti depois de ${Math.round(MAX_WAIT_MS / 60000)} min de espera.`);
    }
    await sleep(700 + Math.floor(Math.random() * 500));
  }

  const beat = setInterval(() => {
    try {
      const now = new Date();
      fs.utimesSync(OWNER_FILE, now, now);
    } catch {
      // Trava sumiu: o trabalho segue e o proximo mkdir resolve a fila.
    }
  }, HEARTBEAT_MS);
  beat.unref();

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    clearInterval(beat);
    try {
      const owner = JSON.parse(fs.readFileSync(OWNER_FILE, 'utf8'));
      if (owner.pid !== process.pid) return;
      fs.rmSync(LOCK_DIR, { recursive: true, force: true });
    } catch {
      // Ja liberada.
    }
  };
  const onSignal = (signal) => {
    release();
    process.exit(signal === 'SIGINT' ? 130 : 143);
  };
  process.once('exit', release);
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
  if (announced) {
    console.log(`[trava] vez obtida depois de ${Math.round((Date.now() - started) / 1000)} s.`);
  }
  return release;
}

export async function withLock(label, fn) {
  const release = await acquireLock(label);
  try {
    return await fn();
  } finally {
    release();
  }
}
