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

# SAM BUILD AND DEPLOY
Parameters="ParameterKey=URI,ParameterValue=${URI} ParameterKey=Env,ParameterValue=${Env} ParameterKey=Cron,ParameterValue='${Cron}'"

sam build -t ./template.yml --parameter-overrides "${Parameters}"
sam deploy \
	--template-file .aws-sam/build/template.yaml \
	--stack-name ${URI} \
	--disable-rollback \
	--resolve-s3 \
	--image-repositories Lambda=${LambdaECR} \
	--parameter-overrides "${Parameters}" \
	--capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
	--tags project=${Project} env=${Env} creator=${GitUsername}
