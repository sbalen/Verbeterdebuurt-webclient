// Shared env vars in all environments
var shared = {
};

//
var environments = {
    development: {
        ENV_VARS: shared
    },
    staging: {
        ENV_VARS: shared
    },
    production: {
        ENV_VARS: shared
    }
};

module.exports = environments;