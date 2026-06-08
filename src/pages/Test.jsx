export default function Test() {
  return (
    <div style={{padding: 20}}>
      <p>URL: {import.meta.env.VITE_SUPABASE_URL || 'NO ENCUENTRA'}</p>
      <p>KEY: {import.meta.env.VITE_CEREBRAS_API_KEY ? 'SÍ hay key' : 'NO ENCUENTRA'}</p>
      <p>ANON: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SÍ hay anon' : 'NO ENCUENTRA'}</p>
    </div>
  );
}
