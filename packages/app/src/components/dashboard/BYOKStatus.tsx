import { CheckCircle2, AlertCircle, Zap, Facebook, Instagram } from 'lucide-react';

import { useDashboardStore } from '@/lib/stores/dashboard-store';

export const BYOKStatus: React.FC = () => {
    const { byok: status } = useDashboardStore();

    return (
        <div className="px-4 py-3 mt-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0F1219]">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    API Status (BYOK)
                </span>
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                    Est. ${(status.openai.cost + status.perplexity.cost).toFixed(2)}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between" title={`GPT-4 Usage: $${status.openai.cost.toFixed(2)}`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${status.openai.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">OpenAI</span>
                    </div>
                    <span className="text-[10px] text-gray-500 cursor-help border-b border-dotted border-gray-400">
                        ${status.openai.cost.toFixed(2)}
                    </span>
                </div>

                <div className="flex items-center justify-between" title={`Research Usage: $${status.perplexity.cost.toFixed(2)}`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${status.perplexity.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Perplexity</span>
                    </div>
                    <span className="text-[10px] text-gray-500 cursor-help border-b border-dotted border-gray-400">
                        ${status.perplexity.cost.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Brand Voice</span>
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Professional SaaS</span>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Follow Us</p>
                <div className="flex items-center justify-between px-1">
                    <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Facebook className="h-4 w-4" />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors">
                        <Instagram className="h-4 w-4" />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        {/* X (Twitter) Icon */}
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        {/* TikTok Icon */}
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v10.1c-.05 2.31-1.3 4.49-3.24 5.9-2.07 1.41-4.66 1.62-6.98.59-2.29-1.02-3.82-3.23-4.02-5.71-.19-2.48.97-4.85 3.01-6.13 2.04-1.28 4.6-1.27 6.65.01.34.21.66.44.96.69v-4.2c-1.12-.34-2.3-.53-3.48-.53-2.68-.01-5.21 1.05-7.1 2.97-1.92 1.96-2.96 4.55-2.92 7.23.05 2.71 1.12 5.26 3.06 7.13 1.94 1.87 4.56 2.88 7.27 2.8 2.67-.08 5.23-1.15 7.11-3.04 1.88-1.89 2.93-4.48 2.91-7.15V6.12c1.77.3 3.55.22 5.3-.24V1.96c-1.76.04-3.52.02-5.28.02v.03c-.15-1.6-.7-3.18-1.8-4.28-1.15-1.15-2.77-1.7-4.38-1.71H12.53v.02z" />
                            <path d="M19.7 0H4.3C1.9 0 0 1.9 0 4.3v15.4C0 22.1 1.9 24 4.3 24h15.4c2.4 0 4.3-1.9 4.3-4.3V4.3C24 1.9 22.1 0 19.7 0z" fill="none" />
                            {/* Simplified path for TikTok logo usually looks like a music note */}
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
};
