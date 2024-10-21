# copu-backend

## features:
- eslint
- makefile
- docker
- swagger
- typeorm
- logger
- exception-filter
- response-format 
- health-check-module
- auth-module
    - login
    - register
    - refresh-token
    - revoke-token

## technical requirements:
- docker
- docker-compose
- nodejs >=20.0.0
- yarn >=1.22.0

## installation guide:
#### 1. install dependencies:
```
yarn install
```

#### 2. prepare project's configurations:
```
.env.example
docker-compose.yaml
package.json
```

#### 3. copy `.env`
```
cp .env.example .env
```

#### 4. run infrastructure services:
```
docker-compose up postgres redis -d
```

#### 5. migrate database:
```
make sync-db
```

#### 6.1. start in the development environment:
```
yarn start:dev
```

#### 6.2. start in the production environment:
```
yarn build
yarn start:prod
```

## other notes:
#### generate new modules:
```
nest g res ${module-name} modules
```

## processor
#### API: 
- Dev env: 
```yarn start:dev```
- Prod env: 
```yarn start:prod```

#### Cronjob delete pending user
- Command: 
    - Dev env: 
    ```yarn delete-pending-user:dev```
    - Prod env: 
    ```yarn delete-pending-user:prod```
- Rule: Cron every 5 minutes (*/5 * * * * )

#### Cronjob sync balance user
- Dev env: 
```yarn sync-balance:dev```
- Prod env: 
```yarn sync-balance:prod```


#### Crawler data
- Dev env: 
```yarn start:crawler:dev```
- Prod env: 
```start:crawler:prod```
