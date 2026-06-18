FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

ENV CHROMA_PERSIST_DIR=/data/chroma

CMD ["chroma", "run", "--path", "/data/chroma", "--host", "0.0.0.0", "--port", "8000", "--allow-reset"]
