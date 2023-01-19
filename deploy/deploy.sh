#!/bin/bash

# LOAD PARAMETERS
source parameters

# DELETE OLD STACK IF EXIST ON CTRL+C
trap "echo; echo \"DELETING THE STACK\"; bash destroy.sh -e ${Env} -p ${Project} -t ${Target} -g ${GitUsername}; exit" INT

# CREATE ECR FOR DOCKERIZE LAMBDA
LambdaECR=$(aws ecr describe-repositories --repository-name ${URI}-ecr | jq -r '.repositories[0].repositoryUri')
if [ "$LambdaECR" = "" ]; then
	LambdaECR=$(aws ecr create-repository --repository-name ${URI}-ecr --image-tag-mutability IMMUTABLE --image-scanning-configuration scanOnPush=true | jq -r '.repository.repositoryUri')
	echo "ECR CREATED: ${LambdaECR}"
else
	echo "ECR EXIST: ${LambdaECR}"
fi

# GET SECTRETS
AcmArn=$(echo ${Secrets} | jq .SecretString | jq -rc . | jq -rc '.AcmArn')
HostedZoneId=$(echo ${Secrets} | jq .SecretString | jq -rc . | jq -rc '.HostedZoneId')
GUEST_JWT_SECRET=$(echo ${Secrets} | jq .SecretString | jq -rc . | jq -rc '.GUEST_JWT_SECRET')

# GET URL FROM S3 AND SET VARIABLES
aws s3 cp ${Urls} ./urls.json
Url=$(cat urls.json | jq '."data-elaboration".'${Env} | tr -d '"')
if [ "$Env" = "dev" ]; then
	Url=$(echo ${Url/__username__/$GitUsername})
fi

# SAM BUILD AND DEPLOY
Parameters="ParameterKey=URI,ParameterValue=${URI} ParameterKey=Env,ParameterValue=${Env} ParameterKey=Cron,ParameterValue='${Cron}' ParameterKey=AcmArn,ParameterValue=${AcmArn} ParameterKey=Url,ParameterValue=${Url} ParameterKey=HostedZoneId,ParameterValue=${HostedZoneId} ParameterKey=JwtSecret,ParameterValue=${GUEST_JWT_SECRET}"

sam build -t ./template.yml --parameter-overrides "${Parameters}"
sam deploy \
	--template-file .aws-sam/build/template.yaml \
	--stack-name ${URI} \
	--disable-rollback \
	--resolve-s3 \
	--image-repositories LambdaCron=${LambdaECR} \
	--image-repositories LambdaApi=${LambdaECR} \
	--parameter-overrides "${Parameters}" \
	--capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
	--tags project=${Project} env=${Env} creator=${GitUsername}
