const { admin, initializeAdminApp } = require('./Supabase-admin-app');

const allowedRoles = new Set([
  'admin',
  'executive',
  'chairlady',
  'vice_chairlady_1',
  'vice_chairlady_2',
  'secretary',
  'vice_secretary',
  'treasurer',
  'vice_treasurer',
  'media',
  'organizer',
  'amir_director',
  'student'
]);

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) continue;
    const key = item.slice(2);
    const next = argv[index + 1];
    args[key] = next && !next.startsWith('--') ? next : true;
    if (args[key] === next) index += 1;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = String(args.email || '').trim();
  const role = String(args.role || '').trim();
  const adminFlag = args.admin === true || args.admin === 'true' || role === 'admin';
  const superAdminFlag = args.superAdmin === true || args.superAdmin === 'true';

  if (!email || !role) {
    throw new Error('Usage: npm run claims:set -- --email user@example.com --role treasurer [--admin true] [--superAdmin true]');
  }
  if (!allowedRoles.has(role)) {
    throw new Error(`Unsupported role: ${role}`);
  }

  initializeAdminApp();
  const user = await admin.auth().getUserByEmail(email);
  const claims = {
    ...(user.customClaims || {}),
    role,
    admin: adminFlag,
    superAdmin: superAdminFlag
  };
  if (!adminFlag) delete claims.admin;
  if (!superAdminFlag) delete claims.superAdmin;

  await admin.auth().setCustomUserClaims(user.uid, claims);
  console.log(`Updated admin roles for ${email}: ${JSON.stringify(claims)}`);
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
