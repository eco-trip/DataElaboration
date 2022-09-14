# DataElaboration

Data Elaboration Service as AWS Lambda with Docker container

## Local development

To build your application locally on your machine, enter:

```sh
cd deploy
sam build -t ./template.yml --parameter-overrides ParameterKey=URI,ParameterValue=ecotrip-des-local ParameterKey=Env,ParameterValue=dev
```

To test the code by locally invoking the Lambda using the following command:

```sh
sam local invoke Lambda
```
