import { useEffect, useState } from 'react';

export function useSession() {
  const [token, setToken] = useState<string | null>(null);
  const [schema, setSchema] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('auth_token');
    const s = localStorage.getItem('church_schema');
    if (t) setToken(t);
    if (s) setSchema(s);
  }, []);

  const save = (t: string | null, s: string | null) => {
    setToken(t);
    setSchema(s);
    if (t) localStorage.setItem('auth_token', t); else localStorage.removeItem('auth_token');
    if (s) localStorage.setItem('church_schema', s); else localStorage.removeItem('church_schema');
  };

  return { token, schema, save };
}
