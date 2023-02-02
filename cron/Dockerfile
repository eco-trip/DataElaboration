FROM public.ecr.aws/lambda/nodejs:16

COPY ./ ./

RUN npm ci --omit=dev

CMD ["index.handler"]