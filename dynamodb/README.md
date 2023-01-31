# Data Dynamo BD schema

The schema to create data table populated by IOTCore

```sh
aws dynamodb create-table --table-name ecotrip.dev.data --region eu-west-1 \
 --attribute-definitions file://attribute-definitions.json \
 --key-schema file://key-schema.json --global-secondary-indexes \
 file://global-secondary-indexes.json --billing-mode PAY_PER_REQUEST
```

Load the sample data into table:

```sh
aws dynamodb batch-write-item --region eu-west-1 --request-items file://seed.json
```
