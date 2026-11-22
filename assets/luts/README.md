# assets/luts — 原创相机 Log → Rec.709 3D LUT

本目录由 **Arrowlogy 自己生成**的两个原始 `.cube` 3D LUT（本产品随发行版分发之物）：

| 文件 | 变换 | 规格 |
|---|---|---|
| `arrowlogy-slog3-rec709-33.cube` | S-Log3（S-Gamut3.Cine）→ Rec.709（BT.709-6 OETF） | 33³，full-range in/out，域 [0,1]³ |
| `arrowlogy-canonlog3-bt709-33.cube` | Canon Log 3 v1.2（Canon Cinema Gamut）→ BT.709（BT.709-6 OETF） | 33³，full-range in/out，域 [0,1]³ |

它们**不是** Sony/Canon 厂商 LUT 的副本，也不包含任何厂商二进制/IP 数据。
它们是完全独立的实现，依据**公开标准公式**推导：

- **S-Log3 反曲线**：Sony 公开的 S-Log3 特性（全范围 10-bit 码值形式：黑 95、18% 灰 420、
  log 斜率 261.5/decade、偏移 0.01/0.19、线性脚区交接点 171.2102946929/1023），
  与 Colour-Science `colour.models.rgb.transfer_functions.sony.log_decoding_SLog3`
  （BSD-3-Clause，https://github.com/colour-science/colour ）镜像一致。
- **Canon Log 3 v1.2 反曲线**：Canon 公开的 Canon Log 3 传递曲线（2020 v1.2 规格，
  常量按 10-bit legal swing 表达，反射系数 ×0.9），与 Colour-Science
  `colour.models.rgb.transfer_functions.canon.log_decoding_CanonLog3_v1_2`
  （BSD-3-Clause）镜像一致。
- **色域基色**（均为厂商公开数据）：
  - S-Gamut3.Cine：R(0.766,0.275) G(0.225,0.800) B(0.089,−0.087)（D65）
  - Canon Cinema Gamut：R(0.740,0.270) G(0.170,1.140) B(0.080,−0.100)（D65）
  - ITU-R BT.709：R(0.640,0.330) G(0.300,0.600) B(0.150,0.060)（D65）
  RGB→XYZ 用标准的 normalised-primary-matrix 算法（Colour-Science 同款）从基色+
  白点（D65，CIE 1931 2°）计算，生成器自检会与 Colour-Science 公开矩阵核对。
- **Rec.709 OETF**：BT.709-6 相机 OETF（`x<0.018 → 4.5x`，否则 `1.099·x^0.45−0.099`），
  与应用内 `src/gl/fx/lut.frag` 的 `linearToBt709` 一致。
- **输出格式**：Adobe/IRIDAS `.cube`，`LUT_3D_SIZE 33`，默认域 [0,1]³，
  R 最慢 / B 最快采样顺序，全范围输入输出。

## 重新生成

```sh
node scripts/gen-log-luts.mjs          # 零依赖；自带公式/矩阵/锚点自检
# 或
fnm exec --using=24.22.1 -- node scripts/gen-log-luts.mjs
```

重新生成是纯函数：同一脚本 → 同一输出。脚本头部注释含每个常量的来源与公式。

## 许可说明（合规记录，2026-11-23）

- 厂商 LUT（`Sony_Slog3_s709.cube`、`CinemaGamut_CanonLog3-to-Canon709_33_Ver.1.0.cube`）
  在商业应用中未获分发许可（审计结论：Canon 明确仅限个人非商业使用；Sony 无商业嵌入授权）。
  它们仍保留在本目录供开发参考，**从不随发行版打包**（见 `config/electron-builder.config.mjs`）。
- 本目录两个 `arrowlogy-*.cube` 为原创推导变换；所用公式/常量均来自公开标准
  （Sony/Canon 公布的曲线参数、ITU-R BT.709-6）与 MIT/BSD 开源参考实现
  （Colour-Science，BSD-3-Clause），不构成对任何厂商版权作品的复制或再分发。
- 详细法律记录见 `THIRD_PARTY_NOTICES.md` §8 及 `~/openchatcut/HANDOFF.md` §12.11。