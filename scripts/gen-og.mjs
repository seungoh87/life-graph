import sharp from 'sharp'
import { writeFileSync } from 'fs'

const W = 1200, H = 630

// 샘플 그래프 포인트 (인생 곡선)
const pts = [
  { age: 0,  v: 0   },
  { age: 10, v: 70  },
  { age: 18, v: 40  },
  { age: 25, v: -20 },
  { age: 30, v: 30  },
  { age: 38, v: 60  },
  { age: 45, v: 20  },
  { age: 55, v: 50  },
  { age: 65, v: 40  },
]

const ML = 80, MR = 60, MT = 100, MB = 160
const gW = W - ML - MR, gH = H - MT - MB
const minAge = 0, maxAge = 65

const xS = age => ML + ((age - minAge) / (maxAge - minAge)) * gW
const yS = v  => MT + gH / 2 - (v / 100) * (gH / 2)

// 폴리라인 좌표
const linePoints = pts.map(p => `${xS(p.age)},${yS(p.v)}`).join(' ')

// 영역 채우기 (zero 기준)
const areaUp = [
  `M ${xS(pts[0].age)},${yS(0)}`,
  ...pts.map(p => `L ${xS(p.age)},${yS(p.v)}`),
  `L ${xS(pts[pts.length - 1].age)},${yS(0)}`,
  'Z'
].join(' ')

const zero = yS(0)

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8f9ff"/>
      <stop offset="100%" stop-color="#eef2ff"/>
    </linearGradient>
    <clipPath id="up">
      <rect x="${ML}" y="${MT}" width="${gW}" height="${zero - MT}"/>
    </clipPath>
    <clipPath id="dn">
      <rect x="${ML}" y="${zero}" width="${gW}" height="${MT + gH - zero}"/>
    </clipPath>
  </defs>

  <!-- 배경 -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- 그래프 영역 배경 -->
  <rect x="${ML}" y="${MT}" width="${gW}" height="${gH}" fill="white" rx="12" opacity="0.7"/>

  <!-- 그리드 라인 -->
  <line x1="${ML}" x2="${ML + gW}" y1="${yS(50)}"  y2="${yS(50)}"  stroke="#e8e8e8" stroke-width="1"/>
  <line x1="${ML}" x2="${ML + gW}" y1="${yS(0)}"   y2="${yS(0)}"   stroke="#ccc"    stroke-width="1.5"/>
  <line x1="${ML}" x2="${ML + gW}" y1="${yS(-50)}" y2="${yS(-50)}" stroke="#e8e8e8" stroke-width="1"/>

  <!-- 영역 채우기 -->
  <path d="${areaUp}" fill="#f6465d" opacity="0.12" clip-path="url(#up)"/>
  <path d="${areaUp}" fill="#2196f3" opacity="0.12" clip-path="url(#dn)"/>

  <!-- 라인 -->
  <polyline points="${linePoints}" fill="none" stroke="#f6465d" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#up)"/>
  <polyline points="${linePoints}" fill="none" stroke="#2196f3" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" clip-path="url(#dn)"/>

  <!-- 포인트 -->
  ${pts.slice(1).map(p => `
  <circle cx="${xS(p.age)}" cy="${yS(p.v)}" r="10" fill="white" stroke="${p.v >= 0 ? '#f6465d' : '#2196f3'}" stroke-width="2"/>
  `).join('')}

  <!-- 텍스트 -->
  <text x="80" y="62" font-family="'Apple SD Gothic Neo','Malgun Gothic',sans-serif" font-size="42" font-weight="800" fill="#111" letter-spacing="-1">인생 그래프</text>
  <text x="${W - 80}" y="${H - 36}" font-family="'Apple SD Gothic Neo','Malgun Gothic',sans-serif" font-size="26" fill="#555" text-anchor="end">나의 인생 만족도를 그래프로 그려보세요</text>
  <text x="${W - 80}" y="${H - 70}" font-family="'Apple SD Gothic Neo','Malgun Gothic',sans-serif" font-size="22" fill="#999" text-anchor="end">로그인 없이 무료 · life-graph-ashy.vercel.app</text>

  <!-- Y축 레이블 -->
  <text x="${ML - 10}" y="${yS(50)  + 5}" font-family="sans-serif" font-size="18" fill="#aaa" text-anchor="end">+50</text>
  <text x="${ML - 10}" y="${yS(0)   + 5}" font-family="sans-serif" font-size="18" fill="#888" text-anchor="end" font-weight="600">0</text>
  <text x="${ML - 10}" y="${yS(-50) + 5}" font-family="sans-serif" font-size="18" fill="#aaa" text-anchor="end">-50</text>
</svg>`

const buf = Buffer.from(svg)
const outPath = 'public/og-image.png'

sharp(buf).png().toFile(outPath, (err) => {
  if (err) { console.error(err); process.exit(1) }
  console.log(`✓ ${outPath} 생성 완료`)
})
