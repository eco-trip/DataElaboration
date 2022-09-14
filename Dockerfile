FROM public.ecr.aws/lambda/nodejs:14

COPY index.js package.json package-lock.json ./

RUN npm ci

CMD ["index.handler"]