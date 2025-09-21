export async function downloadBlob(url: string, filename: string) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`Falha ao baixar: ${res.status}`);
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
