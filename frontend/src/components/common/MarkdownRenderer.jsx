import React from 'react';

/**
 * Parses inline markdown tokens (bold, italics, inline code, links) into React elements.
 */
function parseInline(text) {
  if (!text) return null;

  // Split by inline code first: `code`
  const codeParts = text.split(/(`[^`]+`)/g);
  return codeParts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-black/5 font-mono text-[0.88em] text-emerald-800 font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Process bold, italic, and links in non-code parts
    // Regex matches: **bold**, *italic*, [link text](url)
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
    const subParts = part.split(regex);

    return (
      <React.Fragment key={i}>
        {subParts.map((sub, j) => {
          if (sub.startsWith('**') && sub.endsWith('**') && sub.length >= 4) {
            return (
              <strong key={j} className="font-semibold text-[#0F291E]">
                {sub.slice(2, -2)}
              </strong>
            );
          }
          if (sub.startsWith('*') && sub.endsWith('*') && sub.length >= 2) {
            return (
              <em key={j} className="italic text-[#2C3E35]">
                {sub.slice(1, -1)}
              </em>
            );
          }
          const linkMatch = sub.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (linkMatch) {
            return (
              <a
                key={j}
                href={linkMatch[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-800 underline font-medium"
              >
                {linkMatch[1]}
              </a>
            );
          }
          return sub;
        })}
      </React.Fragment>
    );
  });
}

/**
 * Production MarkdownRenderer component for Ask VITTANAYA Copilot messages.
 * Prevents raw markdown syntax (**text**, ```code```, etc.) from leaking to users.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = null;
  let listType = null; // 'ul' | 'ol'

  const flushList = () => {
    if (currentList && currentList.length > 0) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-1.5 ml-4 list-disc space-y-1 text-inherit">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInline(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-1.5 ml-4 list-decimal space-y-1 text-inherit">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {parseInline(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
      listType = null;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Heading 3: ### Heading
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={idx} className="mt-2.5 mb-1 font-bold text-xs sm:text-sm text-[#0F291E]">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }

    // Heading 2: ## Heading
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={idx} className="mt-3 mb-1 font-bold text-sm sm:text-base text-[#0F291E]">
          {parseInline(trimmed.slice(3))}
        </h3>
      );
      return;
    }

    // Heading 1: # Heading
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={idx} className="mt-3 mb-1.5 font-extrabold text-base sm:text-lg text-[#0F291E]">
          {parseInline(trimmed.slice(2))}
        </h2>
      );
      return;
    }

    // Unordered list item: - , * , •
    if (/^[-*•]\s+/.test(trimmed)) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
        currentList = [];
      }
      currentList.push(trimmed.replace(/^[-*•]\s+/, ''));
      return;
    }

    // Ordered list item: 1. , 2.
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
        currentList = [];
      }
      currentList.push(olMatch[2]);
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={idx} className="my-1 leading-relaxed">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className={`markdown-body ${className}`}>{elements}</div>;
}
