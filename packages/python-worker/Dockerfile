FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry (optional, or just use pip with pyproject.toml if converted)
# For simplicity, we'll install dependencies via pip directly from pyproject.toml using a helper or just manually for now
# Actually, let's use pip install .
COPY pyproject.toml ./
# Create a setup.py shim or just install dependencies manually for this MVP
RUN pip install temporalio playwright beautifulsoup4 clickhouse-connect python-dotenv requests

COPY src ./src

CMD ["python", "-m", "src.main"]
