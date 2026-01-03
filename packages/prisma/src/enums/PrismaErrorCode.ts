export const PrismaErrorCode = {
  // --------------------------------------------------------------------------------
  // Common
  // --------------------------------------------------------------------------------

  /**
   * Authentication failed against database server at {database_host}, the provided database credentials for {database_user} are not valid.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1000
   */
  AUTHENTICATION_FAILED: 'P1000',

  /**
   * Can't reach database server at {database_host}:{database_port}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1001
   */
  COULD_NOT_CONNECT_TO_DATABASE: 'P1001',

  /**
   * The database server at {database_host}:{database_port} was reached but timed out.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1002
   */
  CONNECTION_TIMED_OUT: 'P1002',

  /**
   * Database {database_name} does not exist at {database_file_path} or on the database server.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1003
   */
  DATABASE_FILE_NOT_FOUND: 'P1003',

  /**
   * Operations timed out after {time}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1008
   */
  OPERATIONS_TIMED_OUT: 'P1008',

  /**
   * Database {database_name} already exists on the database server.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1009
   */
  DATABASE_ALREADY_EXISTS: 'P1009',

  /**
   * User {database_user} was denied access on the database {database_name}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1010
   */
  ACCESS_DENIED: 'P1010',

  /**
   * Error opening a TLS connection: {message}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1011
   */
  TLS_CONNECTION_ERROR: 'P1011',

  /**
   * Schema validation error. A schema that was valid before version 4.0.0 might be invalid in version 4.0.0 and later.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1012
   */
  SCHEMA_VALIDATION_ERROR: 'P1012',

  /**
   * The provided database string is invalid.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1013
   */
  INVALID_DATABASE_STRING: 'P1013',

  /**
   * The underlying {kind} for model {model} does not exist.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1014
   */
  KIND_FOR_MODEL_DOES_NOT_EXIST: 'P1014',

  /**
   * Your Prisma schema is using features that are not supported for the version of the database.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1015
   */
  UNSUPPORTED_FEATURES: 'P1015',

  /**
   * Your raw query had an incorrect number of parameters.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1016
   */
  INCORRECT_NUMBER_OF_PARAMETERS: 'P1016',

  /**
   * Server has closed the connection.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p1017
   */
  CONNECTION_CLOSED: 'P1017',

  // --------------------------------------------------------------------------------
  // Prisma Client (Query Engine)
  // --------------------------------------------------------------------------------

  /**
   * The provided value for the column is too long for the column's type.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2000
   */
  VALUE_TOO_LONG: 'P2000',

  /**
   * The record searched for in the where condition ({model_name}.{argument_name} = {argument_value}) does not exist.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2001
   */
  RECORD_DOES_NOT_EXIST: 'P2001',

  /**
   * Unique constraint failed on the {constraint}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2002
   */
  UNIQUE_CONSTRAINT_VIOLATION: 'P2002',

  /**
   * Foreign key constraint failed on the field: {field_name}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2003
   */
  FOREIGN_KEY_CONSTRAINT_VIOLATION: 'P2003',

  /**
   * A constraint failed on the database: {database_error}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2004
   */
  CONSTRAINT_VIOLATION: 'P2004',

  /**
   * The value {field_value} stored in the database for the field {field_name} is invalid for the field's type.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2005
   */
  INVALID_STORED_VALUE: 'P2005',

  /**
   * The provided value {field_value} for {model_name} field {field_name} is not valid.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2006
   */
  INVALID_VALUE: 'P2006',

  /**
   * Data validation error {database_error}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2007
   */
  DATA_VALIDATION_ERROR: 'P2007',

  /**
   * Failed to parse the query {query_parsing_error} at {query_position}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2008
   */
  QUERY_PARSING_FAILED: 'P2008',

  /**
   * Failed to validate the query: {query_validation_error} at {query_position}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2009
   */
  QUERY_VALIDATION_FAILED: 'P2009',

  /**
   * Raw query failed. Code: {code}. Message: {message}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2010
   */
  RAW_QUERY_FAILED: 'P2010',

  /**
   * Null constraint violation on the {constraint}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2011
   */
  NULL_CONSTRAINT_VIOLATION: 'P2011',

  /**
   * Missing a required value at {path}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2012
   */
  MISSING_REQUIRED_VALUE: 'P2012',

  /**
   * Missing the required argument {argument_name} for field {field_name} on {object_name}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2013
   */
  MISSING_REQUIRED_ARGUMENT: 'P2013',

  /**
   * The change you are trying to make would violate the required relation '{relation_name}' between the {model_a_name} and {model_b_name} models.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2014
   */
  RELATION_VIOLATION: 'P2014',

  /**
   * A related record could not be found. {details}
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2015
   */
  RELATED_RECORD_NOT_FOUND: 'P2015',

  /**
   * Query interpretation error. {details}
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2016
   */
  QUERY_INTERPRETATION_ERROR: 'P2016',

  /**
   * The records for relation {relation_name} between the {parent_name} and {child_name} models are not connected.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2017
   */
  RECORDS_NOT_CONNECTED: 'P2017',

  /**
   * The required connected records were not found. {details}
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2018
   */
  REQUIRED_CONNECTED_RECORDS_NOT_FOUND: 'P2018',

  /**
   * Input error. {details}
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2019
   */
  INPUT_ERROR: 'P2019',

  /**
   * Value out of range for the type. {details}
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2020
   */
  VALUE_OUT_OF_RANGE: 'P2020',

  /**
   * The table {table} does not exist in the current database.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2021
   */
  TABLE_DOES_NOT_EXIST: 'P2021',

  /**
   * The column {column} does not exist in the current database.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2022
   */
  COLUMN_DOES_NOT_EXIST: 'P2022',

  /**
   * Inconsistent column data: {message}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2023
   */
  INCONSISTENT_COLUMN_DATA: 'P2023',

  /**
   * Timed out fetching a new connection from the connection pool.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2024
   */
  CONNECTION_POOL_TIMEOUT: 'P2024',

  /**
   * An operation failed because it depends on one or more records that were required but not found.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2025
   */
  RECORDS_NOT_FOUND: 'P2025',

  /**
   * The current database provider doesn't support a feature that the query used: {feature}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2026
   */
  UNSUPPORTED_PROVIDER_FEATURE: 'P2026',

  /**
   * Multiple errors occurred on the database during query execution: {errors}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2027
   */
  MULTIPLE_ERRORS: 'P2027',

  /**
   * Transaction API error: {error}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2028
   */
  TRANSACTION_API_ERROR: 'P2028',

  /**
   * Query parameter limit exceeded error: {message}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2029
   */
  QUERY_PARAMETER_LIMIT_EXCEEDED: 'P2029',

  /**
   * Cannot find a fulltext index to use for the search, try adding a @@fulltext([Fields...]) to your schema.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2030
   */
  FULLTEXT_INDEX_NOT_FOUND: 'P2030',

  /**
   * Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2031
   */
  MONGO_REPLICA_SET_REQUIRED: 'P2031',

  /**
   * A number used in the query does not fit into a 64 bit signed integer. Consider using BigInt as field type.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2033
   */
  NUMBER_FIT_ERROR: 'P2033',

  /**
   * Transaction failed due to a write conflict or a deadlock. Please retry your transaction.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2034
   */
  TRANSACTION_FAILED: 'P2034',

  /**
   * Assertion violation on the database: {database_error}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2035
   */
  DATABASE_ASSERTION_VIOLATION: 'P2035',

  /**
   * Error in external connector (id {id}).
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2036
   */
  EXTERNAL_CONNECTOR_ERROR: 'P2036',

  /**
   * Too many database connections opened: {message}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p2037
   */
  TOO_MANY_CONNECTIONS: 'P2037',

  // --------------------------------------------------------------------------------
  // Prisma Migrate
  // --------------------------------------------------------------------------------

  /**
   * Failed to create database: {database_error}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3000
   */
  DATABASE_CREATION_FAILURE: 'P3000',

  /**
   * Migration possible with destructive changes and possible data loss.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3001
   */
  DESTRUCTIVE_CHANGES: 'P3001',

  /**
   * The attempted migration was rolled back: {database_error}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3002
   */
  MIGRATION_ROLLED_BACK: 'P3002',

  /**
   * The format of migrations changed, the saved migrations are no longer valid.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3003
   */
  MIGRATION_FORMAT_CHANGED: 'P3003',

  /**
   * The {database_name} database is a system database, it should not be altered with prisma migrate.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3004
   */
  SYSTEM_DATABASE_ALTERATION_NOT_ALLOWED: 'P3004',

  /**
   * The database schema is not empty.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3005
   */
  DATABASE_SCHEMA_NOT_EMPTY: 'P3005',

  /**
   * Migration {migration_name} failed to apply cleanly to the shadow database.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3006
   */
  MIGRATION_FAILED_TO_APPLY_TO_SHADOW: 'P3006',

  /**
   * Some of the requested preview features are not yet allowed in schema engine.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3007
   */
  PREVIEW_FEATURES_BLOCKED: 'P3007',

  /**
   * The migration {migration_name} is already recorded as applied in the database.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3008
   */
  MIGRATION_ALREADY_APPLIED: 'P3008',

  /**
   * migrate found failed migrations in the target database, new migrations will not be applied.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3009
   */
  FAILED_MIGRATIONS_FOUND: 'P3009',

  /**
   * The name of the migration is too long. It must not be longer than 200 characters.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3010
   */
  MIGRATION_NAME_TOO_LONG: 'P3010',

  /**
   * Migration {migration_name} cannot be rolled back because it was never applied to the database.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3011
   */
  MIGRATION_CANNOT_BE_ROLLED_BACK: 'P3011',

  /**
   * Migration {migration_name} cannot be rolled back because it is not in a failed state.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3012
   */
  MIGRATION_CANNOT_BE_ROLLED_BACK_NOT_FAILED: 'P3012',

  /**
   * Datasource provider arrays are no longer supported in migrate.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3013
   */
  DATASOURCE_PROVIDER_ARRAYS_NOT_SUPPORTED: 'P3013',

  /**
   * Prisma Migrate could not create the shadow database.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3014
   */
  SHADOW_DATABASE_CREATION_FAILURE: 'P3014',

  /**
   * Could not find the migration file at {migration_file_path}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3015
   */
  MIGRATION_FILE_NOT_FOUND: 'P3015',

  /**
   * The fallback method for database resets failed.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3016
   */
  DATABASE_RESET_FALLBACK_FAILED: 'P3016',

  /**
   * The migration {migration_name} could not be found.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3017
   */
  MIGRATION_NOT_FOUND: 'P3017',

  /**
   * A migration failed to apply.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3018
   */
  MIGRATION_FAILED_TO_APPLY: 'P3018',

  /**
   * The datasource provider {provider} specified in your schema does not match the one specified in the migration_lock.toml.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3019
   */
  DATASOURCE_PROVIDER_MISMATCH: 'P3019',

  /**
   * The automatic creation of shadow databases is disabled on Azure SQL.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3020
   */
  SHADOW_DATABASE_CREATION_DISABLED_AZURE: 'P3020',

  /**
   * Foreign keys cannot be created on this database.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3021
   */
  FOREIGN_KEYS_CREATION_NOT_ALLOWED: 'P3021',

  /**
   * Direct execution of DDL (Data Definition Language) SQL statements is disabled on this database.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3022
   */
  DIRECT_DDL_NOT_ALLOWED: 'P3022',

  /**
   * externalTables & externalEnums in your prisma config must contain only fully qualified identifiers.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3023
   */
  EXTERNAL_TABLES_ENUMS_QUALIFIED: 'P3023',

  /**
   * externalTables & externalEnums in your prisma config must contain only simple identifiers without a schema name.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p3024
   */
  EXTERNAL_TABLES_ENUMS_SIMPLE: 'P3024',

  // --------------------------------------------------------------------------------
  // Introspection
  // --------------------------------------------------------------------------------

  /**
   * Introspection operation failed to produce a schema file: {introspection_error}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p4000
   */
  INTROSPECTION_FAILED: 'P4000',

  /**
   * The introspected database was empty.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p4001
   */
  INTROSPECTED_DATABASE_EMPTY: 'P4001',

  /**
   * The schema of the introspected database was inconsistent: {explanation}.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p4002
   */
  INTROSPECTED_DATABASE_INCONSISTENT: 'P4002',

  // --------------------------------------------------------------------------------
  // Prisma Accelerate
  // --------------------------------------------------------------------------------

  /**
   * Generic error to catch all other errors.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p6000
   */
  SERVER_ERROR: 'P6000',

  /**
   * The URL is malformed; for instance, it does not use the prisma:// protocol.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p6001
   */
  INVALID_DATASOURCE: 'P6001',

  /**
   * The API Key in the connection string is invalid.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p6002
   */
  UNAUTHORIZED: 'P6002',

  /**
   * The included usage of the current plan has been exceeded.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p6003
   */
  PLAN_LIMIT_REACHED: 'P6003',

  /**
   * The global timeout of Accelerate has been exceeded.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p6004
   */
  QUERY_TIMEOUT: 'P6004',

  /**
   * The user supplied invalid parameters.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p6005
   */
  INVALID_PARAMETERS: 'P6005',

  /**
   * The chosen Prisma version is not compatible with Accelerate.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p6006
   */
  VERSION_NOT_SUPPORTED: 'P6006',

  /**
   * The engine failed to start.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p6008
   */
  ENGINE_START_ERROR: 'P6008',

  /**
   * The global response size limit of Accelerate has been exceeded.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p6009
   */
  RESPONSE_SIZE_LIMIT_EXCEEDED: 'P6009',

  /**
   * Your accelerate project is disabled.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p6010
   */
  PROJECT_DISABLED: 'P6010',

  /**
   * This error indicates that the request volume exceeded.
   * @see https://www.prisma.io/docs/orm/reference/error-reference#p5011
   */
  TOO_MANY_REQUESTS: 'P5011',
} as const;
