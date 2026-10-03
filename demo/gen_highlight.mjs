// M3 亮点视频：生成各片段 → concat → 全局 BGM(sidechain ducking)
import { execSync } from 'child_process';
import fs from 'fs';

const REPO = '/home/user/.doubao/agent_mode/workspace/changan-yunque-ar';
const TOUR = `${REPO}/miniprogram/package-tour`;
const SEG = '/tmp/cy-seg';
fs.rmSync(SEG, { recursive: true, force: true });
fs.mkdirSync(SEG, { recursive: true });

const FONT = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc';
const W = 540, H = 960, FPS = 30;

const dur = (p) =>
  parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${p}"`).toString().trim());

const sh = (cmd, label) => {
  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (e) {
    console.error('===== FAIL:', label, '=====');
    const txt = (e.stderr || Buffer.from('')).toString();
    console.error(txt.split('\n').filter((l) => /error|invalid|unable|option|not found|no such|cannot|unrecognized|warning/i.test(l)).slice(-10).join('\n'));
    throw e;
  }
};

// 点位：[id, 中文序号, 点位名, 选句nid]
const POINTS = [
  ['danfengmen', '壹', '丹凤门', 'dfm-3'],
  ['hanyuan', '贰', '含元殿', 'hy-2'],
  ['xuanzheng', '叁', '宣政殿 · 廊下食', 'xz-2'],
  ['zichen', '肆', '紫宸殿', 'zc-2'],
  ['taiyechi', '伍', '太液池', 'tyc-2'],
  ['linde', '陆', '麟德殿', 'ld-2'],
  ['xuanwumen', '柒', '玄武门', 'xwm-2'],
];

const segFiles = [];

// ---------- 七点位段 ----------
POINTS.forEach(([id, idx, name, nid], i) => {
  const video = `${TOUR}/assets/scenes/${id}/restore.mp4`;
  const voice = `${TOUR}/assets/audio/${nid}.mp3`;
  const vd = dur(voice);
  const T = +(vd + 0.8).toFixed(2);
  const out = `${SEG}/p${i + 1}.mp4`;
  const label = `${idx} · ${name}`;
  const cmd = `ffmpeg -y -i "${video}" -i "${voice}" -filter_complex ` +
    `"[0:v]fps=${FPS},scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,` +
    `tpad=stop=-1:stop_mode=clone,trim=duration=${T},setpts=PTS-STARTPTS,` +
    `drawtext=fontfile=${FONT}:text='${label}':x=36:y=h-120:fontsize=38:fontcolor=0xf4ecdd:` +
    `shadowcolor=black@0.55:shadowx=2:shadowy=2[v];` +
    `[1:a]aresample=44100,adelay=220|220,apad,atrim=duration=${T},asetpts=PTS-STARTPTS[a]" ` +
    `-map "[v]" -map "[a]" -r ${FPS} -c:v libx264 -pix_fmt yuv420p -profile:v high -crf 23 ` +
    `-c:a aac -b:a 128k -t ${T} "${out}"`;
  sh(cmd, `point ${idx} ${name}`);
  segFiles.push(out);
  console.log(`point ${idx} ${name}: ${T}s`);
});

fs.writeFileSync(`${SEG}/points_list.txt`, segFiles.map((f) => `file '${f}'`).join('\n'));
console.log('seven point segments done');

// ---------- 通用：静音音轨片段 ----------
const silentVideo = (out, inV, drawChain, T) => {
  const cmd = `ffmpeg -y -i "${inV}" -f lavfi -i anullsrc=r=44100:cl=stereo -filter_complex ` +
    `"[0:v]fps=${FPS},scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,${drawChain.replace(/,$/, '')}[v];` +
    `[1:a]atrim=duration=${T},asetpts=PTS-STARTPTS[a]" -map "[v]" -map "[a]" -t ${T} -r ${FPS} ` +
    `-c:v libx264 -pix_fmt yuv420p -crf 23 -c:a aac -b:a 128k "${out}"`;
  sh(cmd);
};

// ---------- 开场 ----------
const introOut = `${SEG}/a0_intro.mp4`;
silentVideo(
  introOut, `${REPO}/assets/videos/yunque-opening.mp4`,
  `drawtext=fontfile=${FONT}:text='长安云阙':x=(w-tw)/2:y=h-330:fontsize=86:fontcolor=0xf3d488:shadowcolor=black@0.6:shadowx=2:shadowy=2,` +
    `drawtext=fontfile=${FONT}:text='AR文旅助手 · 随云阙游大明宫':x=(w-tw)/2:y=h-215:fontsize=32:fontcolor=0xf4ecdd:shadowcolor=black@0.6:shadowx=2:shadowy=2,`,
  5
);
console.log('intro done');

// ---------- 前端四截图（Ken Burns 轻推，3.2s 每张） ----------
const FR = [
  ['tour-check.png', '云阙AR巡游'],
  ['mall-check.png', '云阙商城'],
  ['mine-check.png', '我的集章'],
  ['ar-check.png', '现场AR'],
];
const frFiles = [];
FR.forEach(([img, title], i) => {
  const out = `${SEG}/f${i + 1}.mp4`;
  const D = Math.round(3.2 * FPS);
  const cmd = `ffmpeg -y -i "${REPO}/demo/${img}" -f lavfi -i anullsrc=r=44100:cl=stereo -filter_complex ` +
    `"[0:v]scale=${W}:-1,zoompan=z='min(zoom+0.0009,1.10)':d=${D}:s=${W}x${H}:y=0:x='iw/2-(iw/zoom/2)':fps=${FPS},setsar=1[v];` +
    `[1:a]atrim=duration=3.2,asetpts=PTS-STARTPTS[a]" -map "[v]" -map "[a]" -t 3.2 -r ${FPS} ` +
    `-c:v libx264 -pix_fmt yuv420p -crf 23 -c:a aac -b:a 128k "${out}"`;
  sh(cmd);
  frFiles.push(out);
});
console.log('frontend shots done');

// ---------- 结尾 ----------
const outroOut = `${SEG}/z9_outro.mp4`;
silentVideo(
  outroOut, `${REPO}/assets/videos/finale.mp4`,
  `drawtext=fontfile=${FONT}:text='七鳞聚齐 · 把长安带回家':x=(w-tw)/2:y=h-280:fontsize=46:fontcolor=0xf3d488:shadowcolor=black@0.6:shadowx=2:shadowy=2,`,
  5
);
console.log('outro done');

// ---------- 最终顺序清单 ----------
const ordered = [introOut, ...segFiles, ...frFiles, outroOut];
fs.writeFileSync(`${SEG}/all_list.txt`, ordered.map((f) => `file '${f}'`).join('\n'));
console.log('all segments ordered:', ordered.length);
