# DataElaboration

Data Elaboration Service composed by:

- AWS Lambda with Docker container triggered by Cron to elavborate aggregate data
- AWS Api gateway for REST API endpont to retrive Data by JWT

## Local development

To test your application locally on your machine, run:

```sh
npm run local
```

On `api` or `cron` folder, remember to change relative `event.json` according to your need and data
