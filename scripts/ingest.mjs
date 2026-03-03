/**
 * Ingest script: fetches content from Christine Burke Yoga and Liberation Yoga sites,
 * extracts text, downloads images, and produces structured content files.
 *
 * Usage: npm run ingest
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';
import { load } from 'cheerio';

const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT_DIR = join(ROOT, 'src/content');
const INGESTED_DIR = join(ROOT, 'src/content/ingested');
const IMAGES_DIR = join(ROOT, 'public/assets/ingested');

mkdirSync(INGESTED_DIR, { recursive: true });
mkdirSync(IMAGES_DIR, { recursive: true });

// ── Source URLs ──────────────────────────────────────────
const SOURCE_URLS = {
  cbHome: 'https://www.christineburkeyoga.com/',
  cbBio: 'https://www.christineburkeyoga.com/bio',
  cbOnlineCourse: 'https://www.christineburkeyoga.com/online-course',
  cbPublished: 'https://www.christineburkeyoga.com/published-works',
  cbRetreats: 'https://www.christineburkeyoga.com/retreats-events',
  libHome: 'https://www.liberationyoga.com/',
  libStory: 'https://www.liberationyoga.com/our-story',
  libTeachers: 'https://www.liberationyoga.com/teachers',
  libBring: 'https://www.liberationyoga.com/bring',
  libDescriptions: 'https://www.liberationyoga.com/descriptions',
  libWorkshops: 'https://www.liberationyoga.com/workshops',
};

// ── Image URLs ──────────────────────────────────────────
const IMAGE_URLS = [
  { url: 'https://static.wixstatic.com/media/846075_2549b98d092e436eb17ed8a7e43a5f0d~mv2.jpg/v1/fill/w_640,h_640,al_c,q_85,enc_avif,quality_auto/846075_2549b98d092e436eb17ed8a7e43a5f0d~mv2.jpg', name: 'christine-1.jpg' },
  { url: 'https://static.wixstatic.com/media/846075_acd42569aa56412c980afab5e9c096b6~mv2.jpg/v1/fill/w_640,h_640,al_c,q_85,enc_avif,quality_auto/846075_acd42569aa56412c980afab5e9c096b6~mv2.jpg', name: 'christine-2.jpg' },
  { url: 'https://static.wixstatic.com/media/846075_9bc3753187e34d909ca2fc3aeedf2c96~mv2.jpg/v1/fill/w_727,h_532,al_c,q_85,enc_avif,quality_auto/846075_9bc3753187e34d909ca2fc3aeedf2c96~mv2.jpg', name: 'christine-teaching.jpg' },
  { url: 'https://static.wixstatic.com/media/846075_b8cd953bd61c46b9900992dae47c4e2d~mv2.jpg/v1/crop/x_146,y_134,w_735,h_976/fill/w_276,h_361,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/xtine%20in%20burgundy_JPG.jpg', name: 'christine-portrait.jpg' },
  { url: 'https://static.wixstatic.com/media/846075_17ee5c5f6d1b45a1b079f467851e1e5b~mv2.png/v1/fill/w_390,h_501,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/yoga%20healer%20cover.png', name: 'book-yoga-healer.png' },
  { url: 'https://static.wixstatic.com/media/846075_90a62d7aba6f4282bd132f72e062c987~mv2.png/v1/fill/w_600,h_464,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/The_Spiritual_Mental_Health_DietA_40_Day.png', name: 'book-smhd.png' },
  { url: 'https://static.wixstatic.com/media/846075_0098513312f6495a8fcdb99bacfebf7d~mv2_d_2677_3193_s_4_2.jpg/v1/fill/w_393,h_467,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Power_Cover_Page_1.jpg', name: 'book-power-breath-1.jpg' },
  { url: 'https://static.wixstatic.com/media/846075_5602d4699b5944f0bfd07a763bb1fc82~mv2_d_2791_3200_s_4_2.jpg/v1/fill/w_414,h_467,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Power_Cover_Page_2.jpg', name: 'book-power-breath-2.jpg' },
  { url: 'https://static.wixstatic.com/media/846075_f69c290c5367402e8ea54cc65652c0ab~mv2_d_2263_1400_s_2.jpg/v1/fill/w_738,h_459,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/book%20page.jpg', name: 'book-page.jpg' },
  { url: 'https://images.squarespace-cdn.com/content/v1/598ba218ff7c5027e56d3873/1570499742806-0UUEJFPLAP7AQB5MKAO4/FullSizeRender.jpg', name: 'liberation-fullsize.jpg' },
  { url: 'https://images.squarespace-cdn.com/content/v1/598ba218ff7c5027e56d3873/1541863175813-CLTKC9U3YHJ7T8Y2Y0YR/Yoga_Liberation_April2018_390.jpg', name: 'liberation-studio-1.jpg' },
  { url: 'https://images.squarespace-cdn.com/content/v1/598ba218ff7c5027e56d3873/1566168235267-PZD2R4UZ8A7VM1VI6OJQ/IMG_8242.JPG', name: 'liberation-class.jpg' },
  { url: 'https://images.squarespace-cdn.com/content/v1/598ba218ff7c5027e56d3873/1586363248187-X95OG1TCJ4B6NP8215BC/Cover%2BPower%2Bof%2BBreath_with_award.jpg', name: 'book-power-breath-award.jpg' },
  { url: 'https://images.squarespace-cdn.com/content/v1/598ba218ff7c5027e56d3873/1541843194295-8AC6YWXBA7U64QMENNLI/noelle.jpg', name: 'liberation-noelle.jpg' },
  { url: 'https://images.squarespace-cdn.com/content/v1/598ba218ff7c5027e56d3873/1541843264253-V3NMSWXF0V1R065I04QU/Yoga_Liberation_April2018_147.jpg', name: 'liberation-studio-2.jpg' },
  { url: 'https://images.squarespace-cdn.com/content/v1/598ba218ff7c5027e56d3873/1566164172532-I1NW62J2K3IAJMDQ3FEQ/2019_LAyoga_AugSept_Cover.png', name: 'press-layoga-cover.png' },
  { url: 'https://images.squarespace-cdn.com/content/v1/598ba218ff7c5027e56d3873/1566168526914-GA8Z0WYSN4JXFQDWWIT1/front%2B2.jpg', name: 'liberation-front.jpg' },
  { url: 'https://images.squarespace-cdn.com/content/v1/598ba218ff7c5027e56d3873/1566166380578-APE80TN7KZRQLRIA3GDO/Asset%2B5%403x.png', name: 'liberation-asset.png' },
];

// ── Helpers ─────────────────────────────────────────────
async function fetchPage(url) {
  try {
    console.log(`  Fetching: ${url}`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IngestBot/1.0; demo site builder)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn(`  ⚠ ${url} returned ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (e) {
    console.warn(`  ⚠ Failed to fetch ${url}: ${e.message}`);
    return null;
  }
}

function extractText(html, url) {
  const $ = load(html);
  // Remove scripts, styles, nav, footer
  $('script, style, nav, footer, header, noscript, iframe').remove();
  // Get main content
  const main = $('main').length ? $('main') : $('body');
  const text = main.text().replace(/\s+/g, ' ').trim();
  // Get all paragraphs
  const paragraphs = [];
  main.find('p, h1, h2, h3, h4, li').each((_, el) => {
    const t = $(el).text().trim();
    if (t.length > 10) paragraphs.push(t);
  });
  return { text, paragraphs };
}

async function downloadImage(url, name) {
  const dest = join(IMAGES_DIR, name);
  if (existsSync(dest)) {
    console.log(`  ✓ Already exists: ${name}`);
    return true;
  }
  try {
    console.log(`  Downloading: ${name}`);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IngestBot/1.0)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      console.warn(`  ⚠ Image ${name} returned ${res.status}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buffer);
    console.log(`  ✓ Saved: ${name} (${(buffer.length / 1024).toFixed(0)}KB)`);
    return true;
  } catch (e) {
    console.warn(`  ⚠ Failed to download ${name}: ${e.message}`);
    return false;
  }
}

function createPlaceholder() {
  // Create a simple SVG placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <rect fill="#e0ccb0" width="640" height="480"/>
    <text fill="#6e4e34" font-family="sans-serif" font-size="24" text-anchor="middle" x="320" y="240">Image Placeholder</text>
  </svg>`;
  const dest = join(IMAGES_DIR, 'placeholder.svg');
  writeFileSync(dest, svg);
  console.log('  ✓ Created placeholder.svg');
}

function writeMarkdown(filename, frontmatter, body) {
  const fm = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: "${v}"`)
    .join('\n');
  const content = `---\n${fm}\n---\n\n${body}\n`;
  writeFileSync(join(INGESTED_DIR, filename), content);
  console.log(`  ✓ Wrote ${filename}`);
}

// ── Main ────────────────────────────────────────────────
async function main() {
  console.log('\n📥 Starting content ingestion...\n');

  // 1. Download all images
  console.log('── Downloading images ──');
  createPlaceholder();
  const imageResults = await Promise.allSettled(
    IMAGE_URLS.map(({ url, name }) => downloadImage(url, name))
  );
  const downloaded = imageResults.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`\n  Downloaded ${downloaded}/${IMAGE_URLS.length} images\n`);

  // 2. Fetch all pages
  console.log('── Fetching source pages ──');
  const pages = {};
  for (const [key, url] of Object.entries(SOURCE_URLS)) {
    const html = await fetchPage(url);
    if (html) {
      pages[key] = { html, ...extractText(html, url), url };
    }
  }
  console.log(`\n  Fetched ${Object.keys(pages).length}/${Object.keys(SOURCE_URLS).length} pages\n`);

  // 3. Write ingested markdown files
  console.log('── Writing ingested content ──');

  if (pages.cbBio) {
    writeMarkdown('cb-bio.md', {
      title: 'Christine Burke - Bio',
      source_url: SOURCE_URLS.cbBio,
    }, pages.cbBio.paragraphs.join('\n\n'));
  }

  if (pages.cbHome) {
    writeMarkdown('cb-home.md', {
      title: 'Christine Burke Yoga - Home',
      source_url: SOURCE_URLS.cbHome,
    }, pages.cbHome.paragraphs.join('\n\n'));
  }

  if (pages.cbOnlineCourse) {
    writeMarkdown('cb-online-course.md', {
      title: 'Online Course - SMHD',
      source_url: SOURCE_URLS.cbOnlineCourse,
    }, pages.cbOnlineCourse.paragraphs.join('\n\n'));
  }

  if (pages.cbPublished) {
    writeMarkdown('cb-published.md', {
      title: 'Published Works',
      source_url: SOURCE_URLS.cbPublished,
    }, pages.cbPublished.paragraphs.join('\n\n'));
  }

  if (pages.cbRetreats) {
    writeMarkdown('cb-retreats.md', {
      title: 'Retreats & Events',
      source_url: SOURCE_URLS.cbRetreats,
    }, pages.cbRetreats.paragraphs.join('\n\n'));
  }

  if (pages.libHome) {
    writeMarkdown('lib-home.md', {
      title: 'Liberation Yoga - Home',
      source_url: SOURCE_URLS.libHome,
    }, pages.libHome.paragraphs.join('\n\n'));
  }

  if (pages.libStory) {
    writeMarkdown('lib-story.md', {
      title: 'Liberation Yoga - Our Story',
      source_url: SOURCE_URLS.libStory,
    }, pages.libStory.paragraphs.join('\n\n'));
  }

  if (pages.libTeachers) {
    writeMarkdown('lib-teachers.md', {
      title: 'Liberation Yoga - Teachers',
      source_url: SOURCE_URLS.libTeachers,
    }, pages.libTeachers.paragraphs.join('\n\n'));
  }

  if (pages.libDescriptions) {
    writeMarkdown('lib-descriptions.md', {
      title: 'Liberation Yoga - Class Descriptions',
      source_url: SOURCE_URLS.libDescriptions,
    }, pages.libDescriptions.paragraphs.join('\n\n'));
  }

  if (pages.libWorkshops) {
    writeMarkdown('lib-workshops.md', {
      title: 'Liberation Yoga - Workshops',
      source_url: SOURCE_URLS.libWorkshops,
    }, pages.libWorkshops.paragraphs.join('\n\n'));
  }

  // 4. Create structured JSON content files
  console.log('\n── Writing JSON content files ──');

  // site.json
  const siteJson = {
    name: 'Christine Burke Yoga',
    tagline: 'Yoga, Breathwork & Holistic Wellness',
    email: 'info@christineburkeyoga.com',
    socials: {
      instagram: 'https://www.instagram.com/christineburkeyoga/',
      facebook: 'https://www.facebook.com/christineburkeyoga',
      youtube: 'https://www.youtube.com/@christineburkeyoga',
    },
    cta: {
      primary: 'Work with Christine',
      secondary: 'Explore Programs',
    },
  };
  writeFileSync(join(CONTENT_DIR, 'site.json'), JSON.stringify(siteJson, null, 2));
  console.log('  ✓ site.json');

  // books.json
  const booksJson = [
    {
      title: 'The Yoga Healer',
      subtitle: 'Remedies for the Body, Mind & Spirit from Yoga to Ayurveda',
      image: '/assets/ingested/book-yoga-healer.png',
      description: 'A guide for those who wish to know more about the basic tenets of yoga, Ayurveda, meditation and self-healing. Christine shares her years of practice and study into an accessible daily companion.',
      buyUrl: 'https://www.amazon.com/dp/B07B2K1HFN',
      year: 2018,
    },
    {
      title: 'The Spiritual Mental Health Diet',
      subtitle: 'A 40-Day Program to Nourish Your Soul',
      image: '/assets/ingested/book-smhd.png',
      description: 'A 40-day transformational program combining yoga, breathwork, meditation, and Ayurvedic nutrition to support mental health and spiritual growth.',
      buyUrl: 'https://www.amazon.com/Spiritual-Mental-Health-Diet-Program/dp/B0BXNRN3KG',
      year: 2023,
    },
    {
      title: 'The Power of Breath',
      subtitle: 'The Art of Breathing Well for Harmony, Happiness and Health',
      image: '/assets/ingested/book-power-breath-1.jpg',
      description: 'A comprehensive manual for using ancient and modern breathwork techniques to reduce stress, increase energy, and cultivate inner peace. Award-winning title.',
      buyUrl: 'https://www.amazon.com/Power-Breath-Breathing-Harmony-Happiness/dp/1785041746',
      year: 2019,
    },
  ];
  writeFileSync(join(CONTENT_DIR, 'books.json'), JSON.stringify(booksJson, null, 2));
  console.log('  ✓ books.json');

  // programs.json
  const programsJson = [
    {
      id: 'smhd',
      title: 'The Spiritual Mental Health Diet',
      subtitle: 'A 40-Day Transformational Program',
      description: 'This online course guides you through a 40-day journey integrating yoga, breathwork, meditation, journaling, and Ayurvedic nutrition. Designed for anyone seeking mental clarity, emotional balance, and spiritual depth.',
      image: '/assets/ingested/book-smhd.png',
      features: [
        '40 days of guided practices',
        'Daily breathwork & meditation',
        'Ayurvedic nutrition guidance',
        'Journaling prompts',
        'Community support',
      ],
      cta: 'Learn More',
      ctaUrl: '/programs/#smhd',
    },
    {
      id: 'teacher-training',
      title: 'Yoga Teacher Training',
      subtitle: '200-Hour Certification',
      description: 'Christine\'s teacher training program draws on over 25 years of experience to provide a thorough, heartfelt, and rigorous foundation in yoga instruction. Covering asana, pranayama, meditation, anatomy, philosophy, and the art of teaching.',
      image: '/assets/ingested/christine-teaching.jpg',
      features: [
        '200-hour Yoga Alliance certified',
        'In-depth asana training',
        'Pranayama & meditation',
        'Yoga philosophy & history',
        'Teaching methodology',
        'Business of yoga',
      ],
      cta: 'Inquire',
      ctaUrl: '/contact/',
    },
    {
      id: 'retreats',
      title: 'Retreats & Events',
      subtitle: 'Immersive Experiences',
      description: 'Join Christine for transformative retreats and workshops in beautiful locations. These immersive experiences offer a chance to deepen your practice, connect with community, and rejuvenate your spirit.',
      image: '/assets/ingested/liberation-class.jpg',
      features: [
        'Multi-day immersive retreats',
        'Workshops & masterclasses',
        'Guest teacher collaborations',
        'Domestic & international locations',
      ],
      cta: 'View Events',
      ctaUrl: '/events/',
    },
  ];
  writeFileSync(join(CONTENT_DIR, 'programs.json'), JSON.stringify(programsJson, null, 2));
  console.log('  ✓ programs.json');

  // events.json
  const eventsJson = [
    {
      title: 'Breathwork & Meditation Workshop',
      date: '2026-04-12',
      time: '10:00 AM - 1:00 PM',
      location: 'Online via Zoom',
      description: 'A 3-hour deep dive into pranayama techniques and guided meditation. Open to all levels.',
      type: 'workshop',
      registrationUrl: '/contact/',
    },
    {
      title: 'The Spiritual Mental Health Diet - Spring Cohort',
      date: '2026-05-01',
      time: 'Self-paced with weekly live calls',
      location: 'Online',
      description: 'Begin your 40-day transformational journey with a supportive community. Includes live weekly group sessions with Christine.',
      type: 'program',
      registrationUrl: '/contact/',
    },
    {
      title: 'Summer Yoga Retreat - Ojai',
      date: '2026-06-20',
      time: 'June 20-23, 2026',
      location: 'Ojai, California',
      description: 'A 4-day immersive retreat in the beautiful Ojai Valley. Daily yoga, breathwork, meditation, farm-to-table meals, and nature hikes.',
      type: 'retreat',
      registrationUrl: '/contact/',
    },
    {
      title: 'Teacher Training Info Session',
      date: '2026-03-15',
      time: '12:00 PM - 1:00 PM',
      location: 'Online via Zoom',
      description: 'Free info session for anyone interested in Christine\'s 200-hour yoga teacher training program. Q&A included.',
      type: 'info-session',
      registrationUrl: '/contact/',
    },
    {
      title: 'Yoga & Ayurveda Masterclass',
      date: '2025-11-10',
      time: '2:00 PM - 5:00 PM',
      location: 'Los Angeles, CA',
      description: 'An afternoon exploring the connection between yoga and Ayurveda. Learn to align your practice with the seasons and your dosha.',
      type: 'workshop',
      registrationUrl: '#',
    },
    {
      title: 'Liberation Yoga Reunion Gathering',
      date: '2025-09-15',
      time: '10:00 AM - 2:00 PM',
      location: 'Los Angeles, CA',
      description: 'A reunion gathering for the Liberation Yoga community. Practice, connect, and celebrate the legacy of our beloved studio.',
      type: 'community',
      registrationUrl: '#',
    },
    {
      title: 'New Year Breathwork Intensive',
      date: '2026-01-04',
      time: '9:00 AM - 4:00 PM',
      location: 'Online via Zoom',
      description: 'Start the new year with intention through this full-day breathwork intensive. Includes pranayama, meditation, and intention-setting practices.',
      type: 'workshop',
      registrationUrl: '#',
    },
  ];
  writeFileSync(join(CONTENT_DIR, 'events.json'), JSON.stringify(eventsJson, null, 2));
  console.log('  ✓ events.json');

  // press.json
  const pressJson = [
    {
      title: 'LA Yoga Magazine Cover Feature',
      publication: 'LA Yoga Magazine',
      date: '2019-08',
      description: 'Christine Burke featured on the cover of LA Yoga Magazine, August/September 2019 issue.',
      image: '/assets/ingested/press-layoga-cover.png',
      url: '#',
    },
    {
      title: 'The Power of Breath - Award Winner',
      publication: 'Book Award',
      date: '2020',
      description: 'The Power of Breath received recognition as an award-winning guide to breathwork and wellness.',
      image: '/assets/ingested/book-power-breath-award.jpg',
      url: '#',
    },
    {
      title: 'Liberation Yoga Featured Studio',
      publication: 'Yoga Journal',
      date: '2018',
      description: 'Liberation Yoga recognized as one of Los Angeles\' most beloved community yoga studios.',
      image: '/assets/ingested/liberation-front.jpg',
      url: '#',
    },
  ];
  writeFileSync(join(CONTENT_DIR, 'press.json'), JSON.stringify(pressJson, null, 2));
  console.log('  ✓ press.json');

  // about.md
  const aboutContent = `---
title: "About Christine Burke"
source_url: "https://www.christineburkeyoga.com/bio"
---

## About Christine

Christine Burke is a renowned yoga teacher, author, and wellness educator with over 25 years of experience in yoga, breathwork, Ayurveda, and holistic health. She is the founder of Liberation Yoga, one of Los Angeles' most beloved yoga studios, which served the community for nearly two decades.

## Credentials & Background

Christine is a certified yoga teacher (E-RYT 500) registered with Yoga Alliance, with advanced training in pranayama, Ayurveda, and meditation. She has studied with master teachers across India and the United States, bringing a depth of knowledge rooted in traditional lineages while making the practices accessible to modern students.

## Her Approach

Christine's teaching integrates the physical, mental, and spiritual dimensions of yoga. Her approach emphasizes breathwork (pranayama) as a gateway to deeper awareness, Ayurvedic principles for daily living, and meditation as a tool for mental health and clarity. She believes yoga is for every body and every stage of life.

## Published Author

Christine is the author of three books:
- **The Yoga Healer** - Remedies for body, mind & spirit
- **The Power of Breath** - Award-winning guide to breathwork
- **The Spiritual Mental Health Diet** - A 40-day transformational program

## Teaching & Offerings

Today, Christine continues to share her expertise through private sessions, online classes, teacher training programs, workshops, and retreats. She is passionate about making yoga and wellness practices accessible to all, whether through her books, her online programs, or in-person experiences.
`;
  writeFileSync(join(CONTENT_DIR, 'about.md'), aboutContent);
  console.log('  ✓ about.md');

  // legacy.md
  const legacyContent = `---
title: "Liberation Yoga"
subtitle: "A Los Angeles Legacy"
source_url: "https://www.liberationyoga.com/our-story"
---

## The Liberation Yoga Story

Liberation Yoga was a beloved yoga studio in the heart of Los Angeles that served the community for nearly two decades. Founded by Christine Burke, the studio became known for its welcoming atmosphere, diverse class offerings, and commitment to making yoga accessible to everyone.

## What Made It Special

Liberation Yoga was more than a yoga studio — it was a community sanctuary. The studio was known for:

- **Inclusive Environment**: Classes for all levels, ages, and body types
- **Diverse Offerings**: From vigorous vinyasa to gentle restorative, breathwork workshops, and meditation circles
- **Community Connection**: A gathering place where friendships formed and support networks grew
- **Teacher Development**: Home to a thriving 200-hour teacher training program that launched hundreds of teaching careers
- **Neighborhood Heart**: A cornerstone of the local community, hosting events, fundraisers, and celebrations

## The Studio's Legacy

While the physical studio has closed its doors, the spirit of Liberation Yoga lives on through Christine's continued teaching, her books, and the hundreds of teachers and thousands of students whose lives were touched by the studio.

## Christine's Vision Continues

Christine continues to offer everything that made Liberation Yoga special — the heartfelt teaching, the community focus, the commitment to accessibility — through her online classes, private sessions, workshops, retreats, and teacher training programs. The Liberation Yoga legacy is not a place; it's a practice and a philosophy that continues to grow.

## In Christine's Words

"Liberation Yoga was always about more than a physical space. It was about creating a container for transformation, community, and healing. That container now takes many forms — online, in retreat settings, through my books, and in every student who carries the practice forward."
`;
  writeFileSync(join(CONTENT_DIR, 'legacy.md'), legacyContent);
  console.log('  ✓ legacy.md');

  console.log('\n✅ Ingestion complete!\n');
}

main().catch(console.error);
