FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port 7860 for Hugging Face Spaces
EXPOSE 7860

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run database migrations before starting the server
RUN alembic upgrade head

# Start command for Hugging Face Spaces
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]
