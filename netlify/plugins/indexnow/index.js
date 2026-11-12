// Netlify build plugin: after a successful production deploy, submit every URL
// in the built sitemap.xml to IndexNow (Bing, Yandex, Seznam, Naver).
// Never fails the deploy: problems are logged as warnings.

const { readFileSync } = require('node:fs');
const { join } = require('node:path');

module.exports = {
  async onSuccess({ inputs, constants }) {
    if (process.env.CONTEXT !== 'production') {
      console.log(`IndexNow: skipped (context: ${process.env.CONTEXT})`);
      return;
    }

    try {
      const xml = readFileSync(
        join(constants.PUBLISH_DIR, 'sitemap.xml'),
        'utf8',
      );
      const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
        m[1].trim(),
      );
      if (urlList.length === 0) {
        console.warn(
          'IndexNow: no URLs found in sitemap.xml, nothing submitted',
        );
        return;
      }

      const res = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: inputs.host,
          key: inputs.key,
          keyLocation: `https://${inputs.host}/${inputs.key}.txt`,
          urlList,
        }),
        signal: AbortSignal.timeout(15000),
      });

      // 200 = submitted, 202 = accepted (key check pending)
      if (res.status === 200 || res.status === 202) {
        console.log(
          `IndexNow: submitted ${urlList.length} URLs (HTTP ${res.status})`,
        );
      } else {
        console.warn(`IndexNow: HTTP ${res.status} ${await res.text()}`);
      }
    } catch (e) {
      console.warn(`IndexNow: submission failed: ${e.message}`);
    }
  },
};
