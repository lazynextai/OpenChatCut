// Vendor-page factories for providers that serve more than one capability from a
// single Key (MiniMax, BytePlus ModelArk) plus Fal's model-list page. Split out of
// settingsSchema.ts to keep that file under the 500-line ceiling.
import { FAL_MODELS } from '../../../shared/fal-models';
import { secret, text, type SettingsField, type SettingsVendorPage } from './settingsFields';
import type { VendorId } from './vendorIcons';

const MINIMAX_NOTE = 'MiniMax 同一个 Key，配置一次全能力（生图 / 配音 / 视频 / 音乐）通用。';
export const minimaxPage = (cap: string, modelField: SettingsField, title = 'MiniMax', vendor: VendorId = 'minimax'): SettingsVendorPage => ({
  key: `${cap}/${vendor}`, vendor, title, note: MINIMAX_NOTE,
  fields: [
    secret('MINIMAX_API_KEY', 'API Key'),
    text('MINIMAX_BASE_URL', 'Base URL', '默认 https://api.minimaxi.com'),
    modelField,
  ],
});

// BytePlus ModelArk serves image (Seedream) and video (Seedance) from the same Key/Base URL,
// separate from LLM_BYTEPLUS_* (Agent chat) — same sharing convention as MiniMax above.
const BYTEPLUS_NOTE = 'BytePlus ModelArk 同一个 Key，图生 / 视频生成通用；与「Agent 大脑」的 BytePlus 配置各自独立。';
export const byteplusPage = (cap: string, modelField: SettingsField, title = 'BytePlus · ModelArk'): SettingsVendorPage => ({
  key: `${cap}/byteplus`, vendor: 'byteplus', title, note: BYTEPLUS_NOTE,
  fields: [
    secret('BYTEPLUS_API_KEY', 'API Key'),
    text('BYTEPLUS_BASE_URL', 'Base URL', '默认 https://ark.ap-southeast.bytepluses.com/api/v3'),
    modelField,
  ],
});

export const falPage = (cap: 'image' | 'video'): SettingsVendorPage => ({
  key: `${cap}/fal`, vendor: 'fal', title: 'Fal.ai',
  note: '选择 Fal.ai 作为默认厂商，然后选择模型。聊天中指定的模型优先于此默认值。',
  fields: [
    secret('FAL_KEY', 'API Key'),
    {
      name: cap === 'image' ? 'FAL_IMAGE_MODEL' : 'FAL_VIDEO_MODEL',
      label: cap === 'image' ? '生图模型' : '视频模型', kind: 'select',
      options: [
        { value: '', label: '每次询问（默认）' },
        ...FAL_MODELS.filter((model) => model.kind === cap).map(({ id, label }) => ({ value: id, label })),
      ],
    },
  ],
});
