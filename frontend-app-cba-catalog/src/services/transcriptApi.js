async function requestJson(url) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${url}`);
  }
  return res.json();
}

export async function fetchTranscript() {
  try {
    return await requestJson('/api/records/me/transcript/');
  } catch (_err) {
    return [];
  }
}
