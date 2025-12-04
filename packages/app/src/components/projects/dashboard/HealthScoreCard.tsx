import { Card } from "@apexseo/ui";

interface HealthScoreCardProps {
    score: number;
}

export function HealthScoreCard({ score }: HealthScoreCardProps) {
    // Determine color based on score
    const getColor = (s: number) => {
        if (s >= 90) return "text-green-500";
        if (s >= 70) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <Card className="p-6 flex flex-col items-center justify-center space-y-4">
            <h3 className="text-lg font-medium text-muted-foreground">Health Score</h3>
            <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-muted/20"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={351.86}
                        strokeDashoffset={351.86 - (351.86 * score) / 100}
                        className={`${getColor(score)} transition-all duration-1000 ease-out`}
                        strokeLinecap="round"
                    />
                </svg>
                <span className={`absolute text-4xl font-bold ${getColor(score)}`}>
                    {score}
                </span>
            </div>
            <p className="text-sm text-muted-foreground">
                Based on latest crawl
            </p>
        </Card>
    );
}
