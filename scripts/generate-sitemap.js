const { SitemapStream, streamToPromise } = require('sitemap');
const { writeFileSync } = require('fs');
const { resolve } = require('path');

async function generateSitemap() {
  const hostname = 'https://malith.is-a.dev';
  const sitemapStream = new SitemapStream({ hostname });

  // Add your URLs
  sitemapStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
  sitemapStream.write({ url: '/about', changefreq: 'weekly', priority: 0.8 });
  // etc. Add whatever path/pages you have

  sitemapStream.end();

  const xml = (await streamToPromise(sitemapStream)).toString();

  const dest = resolve(__dirname, '../public/sitemap.xml');
  writeFileSync(dest, xml);
  console.log('✅ sitemap.xml written to public/');
}

generateSitemap().catch((err) => {
  console.error(err);
  process.exit(1);
});
