import RingCentral from '@rc-ex/core';
import DebugExt from '@rc-ex/debug';

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});

const main = async () => {
  await rc.authorize({
    jwt: process.env.RINGCENTRAL_JWT_TOKEN!,
  });

  const r = await rc.restapi().account().extension().get();
  console.log(JSON.stringify(r, null, 2));

  const r2 = await rc.restapi().account().extension().messageStore().list();
  console.log(JSON.stringify(r2.records?.map((r) => r.id), null, 2));

  const debugExt = new DebugExt();
  await rc.installExtension(debugExt);
  debugExt.enabled = true;
  await rc.put(
    '/restapi/v1.0/account/~/extension/~/message-store/*',
    r2.records!.slice(0, 2).map((r) => ({ resourceId: r.id, body: { readStatus: 'Read' } })),
    undefined,
    {
      headers: { 'Content-Type': 'application/vnd.ringcentral.multipart+json' },
    },
  );
  debugExt.enabled = false;

  await rc.revoke();
};
main();
