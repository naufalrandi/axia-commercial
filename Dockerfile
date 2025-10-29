FROM node:20-alpine as api

# Create app directory
WORKDIR /usr/src/app

RUN apk add g++ make py3-pip
RUN apk add git
RUN apk add nano
RUN apk add tzdata
RUN cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime
RUN echo "Asia/Jakarta" >  /etc/timezone
RUN date

COPY . .
COPY package*.json ./
RUN rm -rf node_modules package-lock.json
# RUN yarn upgrade
RUN yarn install
RUN yarn migrate
# RUN npm install


EXPOSE 4000

CMD [ "npm", "start" ]
