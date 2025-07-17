# Stage 1: Build frontend
FROM node:22.14 AS frontend-builder
WORKDIR /app/frontend
COPY webapp/package*.json ./
RUN npm install
COPY webapp/ ./

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Build backend
FROM python:3.10.6
WORKDIR /app
ENV PYTHONPATH=/app

COPY pyapp/ ./pyapp

# Install python dependencies
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code

# Copy frontend build from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/webapp/dist

# Expose port
EXPOSE 8080

# Run uvicorn (make sure your backend serves frontend static files from ./frontend/build)
CMD ["uvicorn", "pyapp.main:app", "--host", "0.0.0.0", "--port", "8080"]
