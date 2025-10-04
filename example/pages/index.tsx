import Head from 'next/head';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { useMemo } from 'react';
import StreamingHint from '../sections/StreamingHint';

const markdown = `## Why this demo can get sluggish

This page intentionally ships a few anti-patterns so that \`next-speed-kit\` has something to improve:

- A hero image without fixed dimensions, which can cause layout shifts.
- Heavy markdown rendering bundled on the critical path.
- Missing font preconnect hints.

Run the provided scripts or CLI commands to see how the toolkit nudges these issues in the right direction.`;

export default function Home() {
  const markdownContent = useMemo(() => markdown, []);

  return (
    <>
      <Head>
        <title>next-speed-kit demo</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <main>
        <h1>Ship faster Next.js apps</h1>
        <p>
          This example mimics a marketing homepage with markdown content, hero media and a sprinkle of
          client-side interactivity. It is intentionally sub-optimal so you can try the kit locally.
        </p>

        <section>
          <Image src="/hero.png" alt="Speed graph" priority />
        </section>

        <section>
          <ReactMarkdown>{markdownContent}</ReactMarkdown>
        </section>

        <section>
          <StreamingHint />
        </section>
      </main>
    </>
  );
}
