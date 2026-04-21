FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required by pdfplumber / Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# --no-cache-dir saves ~500 MB by not writing the pip HTTP cache to the layer.
# The CPU-only torch wheel is pulled from the extra index declared in requirements.txt.
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
