/**
 * Test setup function.
 * @packageDocumentation
 */

import { DBService } from './db/db.service';
import { getService } from './test-util';

export = async () => {
  const dbService = await getService(DBService);

  await dbService.wipeTestDB();
  await dbService.initDB({ populateStatic: true, prune: false });
};
