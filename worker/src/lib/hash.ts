/** SHA-256 hash a token string into a hex digest (for session lookup). */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(token));
  const hashArr = new Uint8Array(hashBuf);
  let hex = '';
  for (const b of hashArr) hex += b.toString(16).padStart(2, '0');
  return hex;
}
