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

Put env variables `SOURCE_TABLE` in your .env.development file with the table that want use to test and then run:

```sh
npm run local
```

## Dev development

To test environment on AWS as development, run following script on `dynamodb` folder:

```sh
bash deploy.sh
```

You can change seed data on relative folders
