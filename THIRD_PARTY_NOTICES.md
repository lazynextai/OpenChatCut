# Third-Party Notices — Arrowlogy

This file documents the third-party components bundled with or distributed via
the Arrowlogy desktop application and its npm dependency tree, with exact
license names and the obligations that apply to redistribution.

- License fields below were read from `package-lock.json` (lockfileVersion 3)
  unless noted otherwise; versions are the exact locked versions.
- This document is a factual record for compliance purposes. It is **not**
  legal advice. Where a license field is a pointer ("SEE LICENSE IN
  LICENSE.md"), the referenced license text ships inside the package in
  `node_modules/`.
- Items explicitly flagged **unverified** must be confirmed before any
  commercial distribution.

---

## 1. Embedded / native binaries

### FFmpeg (via `ffmpeg-static`)

| | |
|---|---|
| Package | `ffmpeg-static` |
| Version | 5.3.0 |
| License | **GPL-3.0-or-later** |
| Type | Prebuilt FFmpeg binary distributed inside the app (`node_modules/ffmpeg-static`). |

Obligations: the binary is GPL-3.0 licensed. Distribute a corresponding source
offer for FFmpeg: <https://ffmpeg.org/download.html> (source code of the
configured FFmpeg build used by ffmpeg-static; build recipe at
<https://github.com/eugeneware/ffmpeg-static>). GPL-3.0 terms apply to the
binary; the app's own code remains under AGPL-3.0-or-later.

### ffprobe (via `@ffprobe-installer/ffprobe`)

| | |
|---|---|
| Package | `@ffprobe-installer/ffprobe` |
| Version | 2.1.2 |
| License | **LGPL-2.1** (darwin-arm64 binary) / **GPL-3.0** (binaries for other platforms) |

Obligations: license depends on which platform binary ships. On darwin-arm64
the bundled ffprobe is LGPL-2.1; on other platforms the ffprobe binary is
GPL-3.0. If GPL-3.0 binaries are shipped, they need the corresponding source
offer as above.

### libheif (via `heic-to`)

| | |
|---|---|
| Package | `heic-to` |
| Version | 1.6.6 |
| License | **LGPL-3.0** |

Obligations: LGPL-3.0 — used as a dynamically linked library per package
design; retain notices, and make the corresponding source of the LGPL-3.0
components available under LGPL-3.0 on request.

### libvips (via `sharp` / `@img/sharp-libvips-*`)

| | |
|---|---|
| Package | `sharp` |
| Version | 0.35.5 |
| License | **Apache-2.0** |
| Package | `@img/sharp-libvips-darwin-arm64` (and other platform variants) |
| Version | 1.3.4 |
| License | **LGPL-3.0-or-later** — applies **only if packaged** (only the target platform's package is shipped; see obligations) |

Obligations: the libvips shared libraries inside `@img/sharp-libvips-*` are
LGPL-3.0-or-later. If those binaries are distributed in a build, the LGPL-3.0
notice must be retained and the LGPL-3.0 source of libvips
(<https://github.com/libvips/libvips>) offered on request. `sharp` itself is
Apache-2.0.

---

## 2. Remotion (© Remotion, custom license)

| | |
|---|---|
| Packages | `@remotion/bundler`, `@remotion/player`, `@remotion/renderer`, `@remotion/media`, `@remotion/google-fonts`, `@remotion/openai-whisper`, plus compositor packages `@remotion/compositor-*` |
| Version | 4.0.542 |
| License | **Remotion License** (custom; "SEE LICENSE IN LICENSE.md"), free tier: individuals, for-profit organizations with **up to 3 employees**, non-profit/not-for-profit organizations, and non-commercial evaluation. Beyond that, a **Remotion Company License** is required. |

Obligations: eligibility for free use is a factual question about the
distributing entity (see §12.8 of `HANDOFF.md`). If the company grows past 3
employees, purchase a Company License (see `node_modules/@remotion/renderer/LICENSE.md`
and <https://remotion.pro/license>) before further commercial distribution.
The Remotion free license disallows copying/modifying Remotion code for the
purpose of selling, renting, licensing, relicensing, or sublicensing your own
derivative of Remotion — this covers the internal use of the library, not the
AGPL license applied to Arrowlogy's own code.

---

## 3. GitHub Copilot CLI (proprietary EULA)

| | |
|---|---|
| Packages | `@github/copilot`, `@github/copilot-darwin-arm64`, `@github/copilot-darwin-x64`, `@github/copilot-linux-*`, `@github/copilot-win32-*` |
| Version | 1.0.101 |
| License | **Proprietary — "GitHub Copilot CLI License"** (SEE LICENSE IN LICENSE.md) |

Obligations (from the license text shipped in `node_modules/@github/copilot/LICENSE.md`):

- Redistribute the software **only in unmodified form**;
- Redistribute **only as part of an application or service** that provides
  **material functionality beyond the software itself** (never standalone or as
  a primary product);
- **Include a copy of the GitHub Copilot CLI License** and retain all
  applicable copyright, trademark, and attribution notices;
- **Never modify, adapt, translate, or create derivative works** of the
  software (no patching);
- The application or service must be licensed independently of the software.

---

## 4. MPL-2.0 components

| Package | Version | License | Notes |
|---|---|---|---|
| `mediabunny` | 1.64.0 | **MPL-2.0** | File-level copyleft; retain notices |
| `lightningcss` | 1.33.0 | **MPL-2.0** | Includes prebuilt native binaries; retain notices |

MPL-2.0 obligations: modified files must remain available under MPL-2.0, and
notice preservation applies. Unmodified use imposes no source-distribution duty
beyond retaining the license notices shipped in the packages.

---

## 5. MIT / Apache-2.0 npm components

| Package | Version | License |
|---|---|---|
| `sqlite-vec` | 0.1.9 | **MIT OR Apache-2.0** |
| `koffi` | 3.2.1 | **MIT** |
| `onnxruntime-node` | 1.22.0-rev | **MIT** |
| `onnxruntime-web` | 1.29.0 | **MIT** |
| `@huggingface/transformers` | 4.2.0 | **Apache-2.0** |
| `@mediapipe/tasks-vision` | 1.1.1 | **Apache-2.0** |
| `electron` | 43.8.3 | **MIT** |
| `ai` (Vercel AI SDK core) | 7.0.148 | **Apache-2.0** |
| `@ai-sdk/*` (openai, anthropic, google, …) | (per package, e.g. `@ai-sdk/openai` 4.0.99) | **Apache-2.0** |
| `@aws-sdk/*` (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, …) | 3.1154.0 | **Apache-2.0** |
| `react` | 19.3.1 | **MIT** |
| `jszip` | 3.10.1 | **(MIT OR GPL-3.0-or-later)** — used under the **MIT grant** |
| `mammoth` | 1.13.0 | **BSD-2-Clause** |
| `pdfjs-dist` | 6.4.299 | **Apache-2.0** |
| `@modelcontextprotocol/sdk` | 1.32.1 | **MIT** |
| `@e2b/code-interpreter` | 2.9.0 | **MIT** |
| `@github/copilot-sdk` | 1.0.11 | **MIT** (distinct from the proprietary Copilot CLI binaries in §3) |
| `capcut-cli` | **not bundled** — runtime-only: `server/external-agent/capcut-command.ts` spawns pinned `npx --yes capcut-cli@0.26.0`; absent from `package.json` / `package-lock.json` / `node_modules` | **MIT (verified 2026-11-22)** — npm license field + GitHub (renezander030/capcut-cli); unofficial, not affiliated with ByteDance; runtime use fine since it is never redistributed |

Obligations: MIT / Apache-2.0 / BSD-2-Clause components require retention of
their copyright and license notices. The full texts ship inside each package in
`node_modules/`; npm installs preserve them.

---

## 6. Fonts

The app bundles two sets of fonts:

1. **Product fonts under `assets/fonts/`** — covered in
   [`assets/fonts/LICENSES.md`](assets/fonts/LICENSES.md): Noto Sans SC,
   Smiley Sans, DouyinSans (抖音美好体), JasonHandwriting,
   Huxiaobo (Nanshen/Saobao/Zhenshuai), Pangmen Zhengdao (Biaoti/Qingsong),
   plus **Geist** and **IoskeleyMono** added 2026-11-22:

   | Font | License | Status |
   |---|---|---|
   | Geist (Vercel, `public/fonts/Geist-*.woff2`) | **OFL-1.1** | OK — SIL Open Font License 1.1 |
   | IoskeleyMono (`public/fonts/IoskeleyMono-*.woff2`, used as the "Geist Mono" glyph source) | **OFL-1.1** (verified 2026-11-22 — upstream [LICENSE](https://github.com/ahatem/IoskeleyMono/blob/main/LICENSE): © 2015-2026 Belleve Invis (Iosevka) + © 2025 Ahmed Hatem, no Reserved Font Name; independent open font built on Iosevka, not a Berkeley Mono clone) | ✅ OK — OFL expressly permits bundling in commercial software with the OFL text + copyright notice shipped (`OFL-1.1.txt` + `assets/fonts/LICENSES.md`) |

2. **Google-fonts runtime fonts** via `@remotion/google-fonts` — covered by the
   Remotion and Google Fonts terms; OFL/Apache per individual font card.

---

## 7. AI models

| Component | Source | License / status |
|---|---|---|
| Whisper (ASR) | openai whisper via `@remotion/openai-whisper`; local `whisper-cli` | **MIT** |
| whisper.cpp / ggml models | `ggerganov/whisper.cpp` (HF repo), see `shared/asr-ggml-cache.ts` | **MIT** |
| Silero VAD (`public/models/silero-vad/`) | snakers4/silero-vad | **MIT** — license notice added at `public/models/silero-vad/LICENSE.md` on 2026-11-22 |
| beat-this (`musetric/beat-this-onnx`, rhythm-lite) | HF model pack (declared in `shared/model-packs/catalog.ts`) | **MIT** (declared) |
| Chinese-CLIP (`Xenova/chinese-clip-vit-base-patch16`) | HF model pack | **Apache-2.0** (declared) |
| CLAP / clap-htsat-unfused (`Xenova/clap-htsat-unfused`) | HF model pack | **Apache-2.0 (verified 2026-11-22)** — source model `laion/clap-htsat-unfused` is license-tagged `apache-2.0` on HF (API `cardData.license`); the Xenova ONNX conversion carries no tag of its own (mechanical derivative) — treat as Apache-2.0; the paper is CC-BY-4.0 (cite [arXiv:2211.06687](https://arxiv.org/abs/2211.06687)) |

Notes: these model packs are downloaded at runtime from Hugging Face by
`server/plugins/hf-proxy.ts` (not bundled into the installer). The declared
licenses live in `shared/model-packs/catalog.ts`.

---

## 8. Camera-log LUTs — vendor files excluded; original derived transforms shipped

| File | Source | Status |
|---|---|---|
| `assets/luts/Sony_Slog3_s709.cube` (Sony S-Log3 → s709, 33³) | Sony vendor LUT | **❌ not cleared** (2026-11-22) — free to download (Sony Look Profile / `pro.sony` LUT library) but no published grant to embed or redistribute in a commercial app; kept excluded from distribution. **Replaced** (2026-11-23) by original transform `arrowlogy-slog3-rec709-33.cube` |
| `assets/luts/CinemaGamut_CanonLog3-to-Canon709_33_Ver.1.0.cube` (Canon Log 3 → BT.709, 33³) | Canon vendor LUT | **❌ not permissible** (2026-11-22) — Canon's download disclaimer allows only personal, non-commercial use and forbids distribution, modification and derivative works ([asia.canon/en/support/0200747702](https://asia.canon/en/support/0200747702)); kept excluded from distribution. **Replaced** (2026-11-23) by original transform `arrowlogy-canonlog3-bt709-33.cube` |
| `assets/luts/arrowlogy-slog3-rec709-33.cube` (S-Log3 / S-Gamut3.Cine → Rec.709, 33³) | **Original Arrowlogy transform** — generated from published standards by `scripts/gen-log-luts.mjs` | **✅ OK** (2026-11-23) — independent implementation: Sony's published S-Log3 curve (full-range 10-bit code form) + published gamut primaries (normalised primary matrix, D65) + BT.709-6 OETF. Constants mirrored from Colour-Science (BSD-3-Clause, open reference). No Sony/Canon IP or vendor .cube data redistributed |
| `assets/luts/arrowlogy-canonlog3-bt709-33.cube` (Canon Log 3 / Cinema Gamut → BT.709, 33³) | **Original Arrowlogy transform** — generated from published standards by `scripts/gen-log-luts.mjs` | **✅ OK** (2026-11-23) — independent implementation: Canon's published Canon Log 3 v1.2 curve (legal-swing constants, reflection ×0.9) + Canon Cinema Gamut primaries + BT.709-6 OETF. Constants mirrored from Colour-Science (BSD-3-Clause). No Canon IP or vendor .cube data redistributed |

As of **2026-11-23** the vendor LUTs remain **excluded from distribution**; the two **original Arrowlogy transforms ship in the installer**:

- `config/electron-builder.config.mjs` `extraResources` excludes only the two vendor `.cube` files by name (`!luts/Sony_Slog3_s709.cube`, `!luts/CinemaGamut_CanonLog3-to-Canon709_33_Ver.1.0.cube`) — the `arrowlogy-*.cube` files are included (first re-included package: next release, v0.2.20).
- The vendor source files remain in the repository under `assets/luts/` for development reference; they are **not** deleted from git history and are **never** packaged.
- The built-in camera-log LUT effects ("S-Log3 → Rec.709 (SDR)", "Canon Log 3 → BT.709", defined in `src/gl/fx/lutEffects.ts`) now load the original Arrowlogy transforms, so they render correctly in packaged builds.
- Verified 2026-11-22: Canon's disclaimer prohibits redistribution and derivative works outright; Sony publishes its LUTs for download but grants no redistribution right in a commercial product. **Resolution (2026-11-23): re-implemented** — the S-Log3 → Rec.709 and Canon Log 3 → BT.709 transforms are now expressed from published curve + gamut math (`scripts/gen-log-luts.mjs`; formulas + constant sources in `assets/luts/README.md`); no vendor deliverable is distributed.

---

*Generated 2026-11-23. Keep in sync with `assets/THIRD_PARTY_NOTICES.md` (the
copy served inside the app at `/THIRD_PARTY_NOTICES.md`).*