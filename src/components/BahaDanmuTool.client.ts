// Client island bootstrapper for the Baha danmu → ASS tool.
// Wires the form UI inside <BahaDanmuTool /> to the pure library in
// `src/lib/baha-danmu/`.

import { extractSn } from '../lib/baha-danmu/url.js';
import { fetchDanmu } from '../lib/baha-danmu/api.js';
import { generateAss } from '../lib/baha-danmu/generate.js';

type Status = 'idle' | 'fetching' | 'parsing' | 'generating' | 'error' | 'done';

interface Refs {
  param: HTMLInputElement;
  offset: HTMLInputElement;
  button: HTMLButtonElement;
  status: HTMLElement;
  error: HTMLElement;
  download: HTMLAnchorElement;
}

const STATUS_LABEL: Record<Status, string> = {
  idle: '',
  fetching: '取得彈幕中...',
  parsing: '解析彈幕中...',
  generating: '產生下載檔案中...',
  error: '錯誤',
  done: '完成,點擊下方下載連結',
};

function setStatus(refs: Refs, s: Status, extra?: string) {
  const label = STATUS_LABEL[s];
  refs.status.textContent = extra ? `${label} ${extra}` : label;
  refs.status.dataset.status = s;
}

function showError(refs: Refs, msg: string) {
  setStatus(refs, 'error');
  refs.error.textContent = msg;
  refs.error.hidden = false;
}

function clearError(refs: Refs) {
  refs.error.textContent = '';
  refs.error.hidden = true;
}

function offerDownload(refs: Refs, sn: number, ass: string) {
  const blob = new Blob([ass], { type: 'application/octet-stream' });
  // Revoke any previous URL we created.
  const prev = refs.download.dataset.objectUrl;
  if (prev) URL.revokeObjectURL(prev);
  const url = URL.createObjectURL(blob);
  refs.download.href = url;
  refs.download.download = `${sn}.ass`;
  refs.download.textContent = `下載 ${sn}.ass`;
  refs.download.hidden = false;
  refs.download.dataset.objectUrl = url;
}

async function handleSubmit(refs: Refs): Promise<void> {
  clearError(refs);
  refs.download.hidden = true;
  refs.button.disabled = true;
  try {
    const rawInput = refs.param.value;
    const offsetRaw = refs.offset.value;
    const offset = Number.parseInt(offsetRaw, 10);
    if (!Number.isFinite(offset)) {
      throw new Error('時間差必須是整數');
    }

    let sn: number;
    try {
      sn = extractSn(rawInput);
    } catch (e) {
      throw new Error((e as Error).message || '無效的網址或 SN');
    }

    setStatus(refs, 'fetching');
    const items = await fetchDanmu(sn);

    setStatus(refs, 'parsing', `(${items.length} 則)`);
    setStatus(refs, 'generating');
    const ass = generateAss(items, { offset });

    offerDownload(refs, sn, ass);
    setStatus(refs, 'done');
  } catch (e) {
    showError(refs, (e as Error).message || '未知錯誤');
  } finally {
    refs.button.disabled = false;
  }
}

function bind(): void {
  const root = document.querySelector<HTMLElement>('[data-baha-danmu-tool]');
  if (!root) return;

  const refs: Refs = {
    param: root.querySelector<HTMLInputElement>('#baha-param')!,
    offset: root.querySelector<HTMLInputElement>('#baha-offset')!,
    button: root.querySelector<HTMLButtonElement>('#baha-get')!,
    status: root.querySelector<HTMLElement>('#baha-status')!,
    error: root.querySelector<HTMLElement>('#baha-error')!,
    download: root.querySelector<HTMLAnchorElement>('#baha-download')!,
  };

  setStatus(refs, 'idle');
  clearError(refs);
  refs.download.hidden = true;

  refs.button.addEventListener('click', (ev) => {
    ev.preventDefault();
    void handleSubmit(refs);
  });
  refs.param.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      void handleSubmit(refs);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bind, { once: true });
} else {
  bind();
}
