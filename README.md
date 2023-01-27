# DataElaboration

Data Elaboration Service composed by:

- AWS Lambda with Docker container triggered by Cron to elavborate aggregate data
- AWS Api gateway for REST API endpont to retrive Data by JWT

## Local development

To test your application locally on your machine...

#### Cron

Put env variables `SOURCE_TABLE` and `HOTEL_TABLE` in your .env.development file with the tables that want use to test and then run:

```sh
npm run local
```

Remember to change relative `event.json` according to your need and data

#### Api

```sh
npm run local
```
