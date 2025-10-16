export enum STATUS {
  SUCCESS = 200,
  CREATE = 201,
  UNAUTHORIZED = 401,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
}

export enum NODE_ENV {
  LOCAL = "local",
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

export enum TOKEN {
  ACCESS = "access",
  REFRESH = "refresh",
}

export enum STATUS_ERROR_MESSAGE {
  UNAUTHORIZED = "You are not Authorized",
  LOGIN_TO_ACCESS = "Please login to acccess this resource",
  INTERNAL_SERVER = "Internal server error",
  INVALID_TOKEN = "Invalid token type",
}

export enum METHOD {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
}
