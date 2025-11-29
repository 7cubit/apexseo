# ApexSEO

ApexSEO is a comprehensive SEO platform designed to help you analyze, optimize, and track your website's performance.

## Features

- **Project Management**: Organize your SEO efforts by project.
- **Site Graph**: Visualize your website's internal linking structure.
- **Cluster Analysis**: Identify content clusters and opportunities.
- **Leaderboard**: Track your TSPR (Topic Sensitive PageRank) ranking.
- **Recommendations**: Get actionable SEO insights.
- **Orphan Page Detection**: Find pages that are not linked to from other pages.
- **One-Click Analysis**: Quickly analyze any page for SEO issues.
- **Fact Verification**: Verify the accuracy of your content.
- **UX Simulation**: Simulate user interactions to identify UX issues.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/apexseo.git
    cd apexseo
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Copy `.env.local.example` to `.env.local` and fill in the required values.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.**

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Neo4j, ClickHouse
- **AI**: OpenAI GPT-4o-mini, @xenova/transformers
- **Visualization**: React Flow, Recharts
- **State Management**: Zustand

## License

MIT
