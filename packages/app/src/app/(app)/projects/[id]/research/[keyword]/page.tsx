import { KeywordStrategyView } from '@/components/research/KeywordStrategyView';

interface PageProps {
    params: {
        id: string; // Project ID
        keyword: string; // Keyword ID or Text
    };
}

export default function StrategyPage({ params }: PageProps) {
    return <KeywordStrategyView keyword={params.keyword} projectId={params.id} />;
}
