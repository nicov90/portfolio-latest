"use client";
import { Github, Linkedin } from 'lucide-react';
import React from 'react';

const LINKS = {
  github: 'https://github.com/nicov90',
  linkedin: 'https://www.linkedin.com/in/nicov90/'
}

export const SocialSidebar: React.FC = () => {
  return (
    <div className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 z-40">
      <div className="flex flex-col items-center gap-3.5 rounded-2xl bg-white/20 backdrop-blur-xl py-3 shadow-[0_0_20px_rgba(0,0,0,0.12)]">
        <a
          href={LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-gray-900 transition-transform hover:-translate-y-0.5 px-2.5"
          aria-label="GitHub"
        >
          <Github className="h-5 w-5" />
        </a>
        <a
          href={LINKS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-gray-900 transition-transform hover:-translate-y-0.5 px-2.5"
          aria-label="LinkedIn"
        >
          <Linkedin className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
};
