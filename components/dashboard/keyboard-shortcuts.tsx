"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: 'Open search', action: 'search' },
  { keys: ['Ctrl', 'B'], description: 'Toggle sidebar', action: 'sidebar' },
  { keys: ['Ctrl', '1'], description: 'AI Chat', action: 'tab-chat' },
  { keys: ['Ctrl', '2'], description: 'Job Analysis', action: 'tab-job-analysis' },
  { keys: ['Ctrl', '3'], description: 'Resume Analysis', action: 'tab-resume-analysis' },
  { keys: ['Ctrl', '4'], description: 'Cover Letter', action: 'tab-cover-letter' },
  { keys: ['Ctrl', '5'], description: 'Applications', action: 'tab-applications' },
  { keys: ['Ctrl', '?'], description: 'Show keyboard shortcuts', action: 'shortcuts' },
];

const tabMap: Record<string, string> = {
  'tab-chat': 'chat',
  'tab-job-analysis': 'job-analysis',
  'tab-resume-analysis': 'resume-analysis',
  'tab-cover-letter': 'cover-letter',
  'tab-applications': 'applications',
};

export function KeyboardShortcuts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      
      if (!cmdOrCtrl) return;

      switch (e.key.toLowerCase()) {
        case 'k':
          e.preventDefault();
          // Focus search input
          const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
          break;
        
        case 'b':
          e.preventDefault();
          const currentState = localStorage.getItem('sidebar-collapsed') === 'true';
          const newState = !currentState;
          localStorage.setItem('sidebar-collapsed', String(newState));
          setSidebarCollapsed(newState);
          window.dispatchEvent(new Event('sidebar-toggle'));
          break;
        
        case '?':
          e.preventDefault();
          setIsOpen(true);
          break;
        
        case '1':
          e.preventDefault();
          router.push('/dashboard?tab=chat');
          break;
        case '2':
          e.preventDefault();
          router.push('/dashboard?tab=job-analysis');
          break;
        case '3':
          e.preventDefault();
          router.push('/dashboard?tab=resume-analysis');
          break;
        case '4':
          e.preventDefault();
          router.push('/dashboard?tab=cover-letter');
          break;
        case '5':
          e.preventDefault();
          router.push('/dashboard?tab=applications');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Check sidebar state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSidebarCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Keyboard Shortcuts</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Use these shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index}>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-neutral-300">{shortcut.description}</span>
                <div className="flex items-center gap-1.5">
                  {shortcut.keys.map((key, keyIndex) => (
                    <div key={keyIndex}>
                      <Badge 
                        variant="outline" 
                        className="bg-neutral-800 border-neutral-700 text-neutral-300 font-mono text-xs px-2 py-1"
                      >
                        {key}
                      </Badge>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="mx-1 text-neutral-500">+</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {index < shortcuts.length - 1 && <Separator className="bg-neutral-800" />}
            </div>
          ))}
        </div>
        
        <div className="text-xs text-neutral-500 text-center pt-4 border-t border-neutral-800">
          Press <Badge variant="outline" className="bg-neutral-800 border-neutral-700 text-neutral-300 text-xs px-1.5 py-0.5">Ctrl</Badge> + <Badge variant="outline" className="bg-neutral-800 border-neutral-700 text-neutral-300 text-xs px-1.5 py-0.5">?</Badge> to open this dialog anytime
        </div>
      </DialogContent>
    </Dialog>
  );
}

