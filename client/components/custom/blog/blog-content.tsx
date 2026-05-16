"use client";

import type { ImgHTMLAttributes } from "react";
import { Streamdown } from "streamdown";

// Styled markdown components matching the app's design system.
const MD_COMPONENTS = {
  h1({ children }: { children?: React.ReactNode }) {
    return <h1 className="text-3xl font-bold mt-8 mb-4 tracking-tight">{children}</h1>;
  },
  h2({ children }: { children?: React.ReactNode }) {
    return <h2 className="text-2xl font-bold mt-8 mb-3 tracking-tight">{children}</h2>;
  },
  h3({ children }: { children?: React.ReactNode }) {
    return <h3 className="text-xl font-semibold mt-6 mb-2">{children}</h3>;
  },
  h4({ children }: { children?: React.ReactNode }) {
    return <h4 className="text-lg font-semibold mt-5 mb-2">{children}</h4>;
  },
  p({ children }: { children?: React.ReactNode }) {
    return <p className="mb-4 leading-7">{children}</p>;
  },
  ul({ children }: { children?: React.ReactNode }) {
    return <ul className="list-disc list-outside pl-5 space-y-1 my-4">{children}</ul>;
  },
  ol({ children }: { children?: React.ReactNode }) {
    return <ol className="list-decimal list-outside pl-5 space-y-1 my-4">{children}</ol>;
  },
  li({ children }: { children?: React.ReactNode }) {
    return <li className="leading-7">{children}</li>;
  },
  blockquote({ children }: { children?: React.ReactNode }) {
    return (
      <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4">
        {children}
      </blockquote>
    );
  },
  pre({ children }: { children?: React.ReactNode }) {
    return (
      <pre className="bg-muted border border-border rounded-lg p-4 overflow-x-auto my-5 text-sm">
        {children}
      </pre>
    );
  },
  code({ children, className }: { children?: React.ReactNode; className?: string }) {
    if (!className) {
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      );
    }
    return <code className={`font-mono text-sm ${className}`}>{children}</code>;
  },
  a({ children, href }: { children?: React.ReactNode; href?: string }) {
    return (
      <a
        href={href}
        className="text-primary underline underline-offset-4 hover:no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },
  hr() {
    return <hr className="border-border/50 my-6" />;
  },
  strong({ children }: { children?: React.ReactNode }) {
    return <strong className="font-semibold">{children}</strong>;
  },
  table({ children }: { children?: React.ReactNode }) {
    return (
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },
  th({ children }: { children?: React.ReactNode }) {
    return (
      <th className="text-left font-semibold py-2 px-3 border-b border-border">
        {children}
      </th>
    );
  },
  td({ children }: { children?: React.ReactNode }) {
    return (
      <td className="py-2 px-3 border-b border-border/50">{children}</td>
    );
  },
  img({
    node: _node,
    src,
    alt,
    ...rest
  }: ImgHTMLAttributes<HTMLImageElement> & { node?: object }) {
    if (!src) return <></>;
    return (
      <figure className="my-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          {...rest}
          className="w-full rounded-xl border border-border object-cover"
          loading="lazy"
        />
        {alt && (
          <figcaption className="mt-2 text-center text-xs text-muted-foreground italic">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },
};

interface BlogContentProps {
  content: string;
  className?: string;
}

export function BlogContent({ content, className }: BlogContentProps) {
  return (
    <div className={className}>
      <Streamdown components={MD_COMPONENTS}>{content}</Streamdown>
    </div>
  );
}
