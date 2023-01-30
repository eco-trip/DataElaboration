FROM public.ecr.aws/lambda/nodejs:14

COPY ./ ./

RUN npm ci --omit=dev

CMD ["index.handler"]