FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# ✅ Run Vite directly with host binding
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]
