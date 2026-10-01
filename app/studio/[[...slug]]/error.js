'use client';

export default function StudioError({ error, reset }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Studio Error</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
