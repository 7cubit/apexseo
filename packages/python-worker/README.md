# Python Worker

This package contains a Temporal worker implemented in Python. It is designed to handle tasks that are better suited for the Python ecosystem, such as:

- **Advanced Web Scraping**: Using libraries like `requests`, `BeautifulSoup`, or `playwright` (future).
- **Data Processing**: Heavy data manipulation using `pandas` or `numpy`.
- **ML/AI Tasks**: Generating embeddings, NLP analysis, or running local models.

## Current Activities

### `fetch_html`
Fetches the HTML content of a given URL and stores the raw crawl log (URL, HTML, headers, status, timestamp) directly into ClickHouse.

## Setup & Running

1.  **Install Dependencies**:
    Ensure you have Python 3.9+ installed.
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: You may need to create a virtual environment first)*

2.  **Environment Variables**:
    The worker requires access to Temporal and ClickHouse. Ensure `.env` variables are loaded or passed explicitly.
    - `TEMPORAL_ADDRESS`: Address of the Temporal server (default: `localhost:7233`)
    - `CLICKHOUSE_HOST`, `CLICKHOUSE_PORT`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`

3.  **Start the Worker**:
    ```bash
    python src/main.py
    ```

## Development

The source code is located in `src/`.
- `main.py`: Entry point that connects to Temporal and registers the worker.
- `activities.py`: Definitions of the Temporal activities.
