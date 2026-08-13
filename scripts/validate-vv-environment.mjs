const env = process.env.VVOS_ENV;
const url = process.env.NEXT_PUBLIC_SITE_URL || "";
const errors = [];

if (!['staging','production'].includes(env)) errors.push('VVOS_ENV moet staging of production zijn');
if (process.env.VVOS_DATA_MODE !== 'firebase') errors.push('VVOS_DATA_MODE moet firebase zijn');
if (process.env.VVOS_REQUIRE_AUTH !== 'true') errors.push('VVOS_REQUIRE_AUTH moet true zijn');

if (env === 'staging' && !url.includes('staging.')) errors.push('Staging hoort een staging URL te gebruiken');
if (env === 'staging' && /www\.voltvroom\.nl/i.test(url)) errors.push('Staging mag niet naar het production domein wijzen');
if (env === 'production' && url.includes('staging.')) errors.push('Production mag geen staging URL gebruiken');
if (env === 'production' && !url.includes('voltvroom.nl')) errors.push('Production URL moet voltvroom.nl zijn');

for (const key of ['CRON_SECRET', 'VWE_WEBHOOK_SECRET', 'PORTAL_TOKEN_SECRET', 'AUDIT_HASH_SALT']) {
  const value = process.env[key] || '';
  if (value.length < 24) errors.push(`${key} ontbreekt of is te kort`);
}

console.log(JSON.stringify({ ok: errors.length === 0, environment: env, siteUrl: url, errors }, null, 2));
if (errors.length) process.exit(1);
