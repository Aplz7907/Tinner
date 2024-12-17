import swagger from "@elysiajs/swagger"

export const SwaggerConfig = swagger({
    path: '/api-doc',
    documentation: {
        info: {
            title: 'Tinner App API',
            version: 'beta ronaldo version 1.0.1'
        }
    }
})