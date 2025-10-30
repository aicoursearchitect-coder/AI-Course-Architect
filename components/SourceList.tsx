import React from 'react';
import type { Source } from '../types';
import { LinkIcon } from './icons/LinkIcon';

interface SourceListProps {
  sources: Source[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg sticky top-24">
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <LinkIcon className="w-6 h-6" />
        Sources
      </h3>
      <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {sources.map((source, index) => (
          <li key={index}>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 text-brand-secondary hover:text-blue-400 transition-colors"
            >
              <span className="mt-1 flex-shrink-0 text-sm opacity-70 group-hover:opacity-100">{index + 1}.</span>
              <span className="break-all group-hover:underline">{source.title || new URL(source.uri).hostname}</span>
            </a>
            {source.snippet && (
              <blockquote className="mt-2 pl-5 text-sm text-text-secondary border-l-2 border-base-300 italic">
                "{source.snippet}"
              </blockquote>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SourceList;
