#!/bin/bash

source ../.env

GitUsername=$(echo $(git config user.name) | tr '[:upper:]' '[:lower:]')

export AWS_PROFILE=$AWS_PROFILE
export AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION
export AWS_PAGER=""

echo "AWS_PROFILE: ${AWS_PROFILE}"
echo "AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION}"

DataTable=ecotrip.dev.data
AdministrationTable=ecotrip.dev.administration

cd data
aws dynamodb create-table --table-name ${DataTable} \
	--attribute-definitions file://attribute-definitions.json \
	--key-schema file://key-schema.json --global-secondary-indexes \
	file://global-secondary-indexes.json --billing-mode PAY_PER_REQUEST

aws dynamodb wait table-exists --table-name ${DataTable}
aws dynamodb batch-write-item --request-items file://seed.json

cd ../administration
aws dynamodb create-table --table-name ${AdministrationTable} \
	--attribute-definitions file://attribute-definitions.json \
	--key-schema file://key-schema.json --global-secondary-indexes \
	file://global-secondary-indexes.json --billing-mode PAY_PER_REQUEST

aws dynamodb wait table-exists --table-name ${AdministrationTable}
aws dynamodb batch-write-item --request-items file://seed.json
