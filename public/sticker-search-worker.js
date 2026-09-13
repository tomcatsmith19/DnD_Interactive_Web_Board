let catalogPromise;
let latestRequestId = 0;

function clean(value) {
  return String(value || '')
    .replace(/\.[^.]+$/, '')
    .replace(/^!+/, '')
    .replace(/[\\/_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function subsequenceScore(needle, haystack) {
  let position = -1;
  let score = 0;
  let streak = 0;
  for (const character of needle) {
    const next = haystack.indexOf(character, position + 1);
    if (next < 0) return -Infinity;
    const gap = next - position - 1;
    streak = gap === 0 ? streak + 1 : 0;
    score += 18 + streak * 5 - gap * 1.5;
    if (next === 0 || haystack[next - 1] === ' ') score += 12;
    position = next;
  }
  return score - (haystack.length - needle.length) * 0.12;
}

function score(query, candidate) {
  const exact = candidate.indexOf(query);
  if (exact >= 0) return 3000 - exact * 8 - (candidate.length - query.length) * 0.2;
  const words = candidate.split(' ').filter(Boolean);
  let result = 0;
  for (const token of query.split(' ').filter(Boolean)) {
    let tokenScore = -Infinity;
    for (const word of words) {
      const containedAt = word.indexOf(token);
      tokenScore = Math.max(tokenScore, containedAt >= 0
        ? 700 - containedAt * 5 - (word.length - token.length)
        : subsequenceScore(token, word));
    }
    if (!Number.isFinite(tokenScore)) return -Infinity;
    result += tokenScore;
  }
  return result;
}

function lowerRank(a, b) {
  return a.score !== b.score ? a.score - b.score : b.path.localeCompare(a.path, undefined, { numeric: true });
}

function siftUp(heap, index) {
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    if (lowerRank(heap[parent], heap[index]) <= 0) break;
    [heap[parent], heap[index]] = [heap[index], heap[parent]];
    index = parent;
  }
}

function siftDown(heap, index) {
  while (true) {
    const left = index * 2 + 1;
    const right = left + 1;
    let smallest = index;
    if (left < heap.length && lowerRank(heap[left], heap[smallest]) < 0) smallest = left;
    if (right < heap.length && lowerRank(heap[right], heap[smallest]) < 0) smallest = right;
    if (smallest === index) return;
    [heap[index], heap[smallest]] = [heap[smallest], heap[index]];
    index = smallest;
  }
}

function keepBest(heap, match, limit) {
  if (heap.length < limit) {
    heap.push(match);
    siftUp(heap, heap.length - 1);
  } else if (lowerRank(match, heap[0]) > 0) {
    heap[0] = match;
    siftDown(heap, 0);
  }
}

async function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch('data/sticker-catalog.json?v=1', { cache: 'force-cache' })
      .then(response => {
        if (!response.ok) throw new Error(`Sticker catalog request failed (${response.status})`);
        return response.json();
      })
      .then(catalog => {
        if (!Array.isArray(catalog.files)) throw new Error('Sticker catalog has an invalid format.');
        const files = catalog.files.map(path => ({ type: 'file', path, search: clean(path) }));
        const folderPaths = new Set();
        catalog.files.forEach(path => {
          let separator = path.lastIndexOf('/');
          while (separator > 0) {
            folderPaths.add(path.slice(0, separator));
            separator = path.lastIndexOf('/', separator - 1);
          }
        });
        const folders = [...folderPaths].map(path => ({ type: 'folder', path, search: clean(path) }));
        return { files, folders };
      });
  }
  return catalogPromise;
}

self.addEventListener('message', async event => {
  const { requestId, query } = event.data || {};
  latestRequestId = requestId;
  try {
    const catalog = await loadCatalog();
    if (requestId !== latestRequestId) {
      self.postMessage({ requestId, cancelled: true });
      return;
    }
    const normalizedQuery = clean(query);
    const best = [];
    for (let index = 0; index < catalog.folders.length; index += 1) {
      const item = catalog.folders[index];
      const itemScore = score(normalizedQuery, item.search);
      if (Number.isFinite(itemScore)) keepBest(best, { type: item.type, path: item.path, score: itemScore + 250 }, 80);
      if (index && index % 3000 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
        if (requestId !== latestRequestId) {
          self.postMessage({ requestId, cancelled: true });
          return;
        }
      }
    }
    for (let index = 0; index < catalog.files.length; index += 1) {
      const item = catalog.files[index];
      const itemScore = score(normalizedQuery, item.search);
      if (Number.isFinite(itemScore)) keepBest(best, { type: item.type, path: item.path, score: itemScore }, 80);
      if (index && index % 3000 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
        if (requestId !== latestRequestId) {
          self.postMessage({ requestId, cancelled: true });
          return;
        }
      }
    }
    best.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path, undefined, { numeric: true }));
    self.postMessage({
      requestId,
      count: catalog.files.length,
      folderCount: catalog.folders.length,
      results: best.map(item => ({ type: item.type, path: item.path }))
    });
  } catch (error) {
    self.postMessage({ requestId, error: error?.message || String(error) });
  }
});
