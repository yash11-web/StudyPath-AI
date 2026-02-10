import React from 'react';
import { ExternalLink, Youtube, Book, Code, Globe } from 'lucide-react';

interface ResourceLinksProps {
  topic: string;
}

const ResourceLinks: React.FC<ResourceLinksProps> = ({ topic }) => {
  const encodedTopic = encodeURIComponent(topic);

  const links = [
    {
      name: 'YouTube',
      url: `https://www.youtube.com/results?search_query=${encodedTopic}+tutorial`,
      icon: <Youtube className="w-4 h-4 text-red-500" />,
      color: 'hover:bg-red-50 hover:text-red-700'
    },
    {
      name: 'GeeksforGeeks',
      url: `https://www.google.com/search?q=site:geeksforgeeks.org+${encodedTopic}`,
      icon: <Code className="w-4 h-4 text-green-600" />,
      color: 'hover:bg-green-50 hover:text-green-700'
    },
    {
      name: 'MIT OCW',
      url: `https://ocw.mit.edu/search/?q=${encodedTopic}`,
      icon: <Book className="w-4 h-4 text-slate-800" />,
      color: 'hover:bg-slate-100 hover:text-slate-900'
    },
    {
      name: 'Google Search',
      url: `https://www.google.com/search?q=${encodedTopic}`,
      icon: <Globe className="w-4 h-4 text-blue-500" />,
      color: 'hover:bg-blue-50 hover:text-blue-700'
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 bg-white border border-slate-200 transition-colors shadow-sm ${link.color}`}
        >
          {link.icon}
          {link.name}
          <ExternalLink className="w-3 h-3 opacity-50" />
        </a>
      ))}
    </div>
  );
};

export default ResourceLinks;
