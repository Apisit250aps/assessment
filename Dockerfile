# ขั้นตอน build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build   # ได้ไฟล์ใน dist/

# ขั้นตอน serve ด้วย nginx
FROM nginx:stable-alpine AS production
WORKDIR /usr/share/nginx/html

# ลบไฟล์ default ของ nginx
RUN rm -rf ./*

# คัดลอกไฟล์จาก build stage
COPY --from=build /app/dist ./

# คัดลอก config nginx ถ้าต้องการ custom
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
