const swaggerUi =require('swagger-ui-express');
const swaggereJsdoc =require('swagger-jsdoc')
const express =require('express')

const router = express.Router();

const options = {
//swagger문서 설정
    swaggerDefinition: {
        info: {
            title: 'DCS REST API',
            version: '1.0.0',
            description: 'DCS Team Project-곰방 (REST API with express)',
        },
        host: 'localhost:3000',
        basePath: '/'
    },
//swagger api가 존재하는 곳 입니다.
    apis: ['./routes/*.js','./definitions/*.js']
};

const specs = swaggereJsdoc(options);

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

module.exports = router;