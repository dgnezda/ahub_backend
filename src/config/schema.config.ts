import * as Joi from '@hapi/joi' //

export const configValidationSchema = Joi.object({
  STAGE: Joi.string().required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.string().default(5432).required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PWD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_SECRET_EXPIRES: Joi.number().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET_EXPIRES: Joi.number().required(),
})
