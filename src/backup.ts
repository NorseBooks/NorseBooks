/**
 * Functions for backing up the database.
 * @packageDocumentation
 */

import { exec } from 'child_process';

/**
 * The default backup interval.
 */
const defaultBackupInterval = 3600;

/**
 * Return type for command executions.
 */
interface ExecuteReturn {
  stdout: string;
  stderr: string;
}

/**
 * Execute a command.
 *
 * @param command The command to execute.
 * @returns The resulting stdout and stderr.
 */
async function execute(command: string): Promise<ExecuteReturn> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (!error) {
        resolve({ stdout, stderr });
      } else {
        reject({ error, stdout, stderr });
      }
    });
  });
}

/**
 * Backup the database.
 */
export async function backupDB(dbURL: string): Promise<void> {
  try {
    const backupRes = await execute(
      `python3 scripts/backup.py --url "${dbURL}"`,
    );
    const backupFile = backupRes.stdout.trim();
  } catch (err) {
    console.error(err);
  }
}

/**
 * Backup the database automatically and wait for the first successful backup.
 *
 * @param interval The interval in seconds to wait between backups.
 */
export async function autoBackupDB(
  dbURL: string,
  interval = defaultBackupInterval,
): Promise<void> {
  await backupDB(dbURL);
  setInterval(() => backupDB(dbURL), interval * 1000);
}
