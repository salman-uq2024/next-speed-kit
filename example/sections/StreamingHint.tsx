import { useEffect, useState } from 'react';

const steps = [
  'Bootstrapping data fetch…',
  'Streaming hero content…',
  'Inlining critical CSS…',
  'Hydrating interactive widgets…',
];

export default function StreamingHint() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((value) => (value + 1) % steps.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Streaming pipeline</h2>
      <p>{steps[index]}</p>
    </div>
  );
}
