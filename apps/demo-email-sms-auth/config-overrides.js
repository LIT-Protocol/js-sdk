module.exports = {
	webpack: function(config, env) {
		config.module.rules = config.module.rules.map(rule => {
			if (rule.oneOf instanceof Array) {
				rule.oneOf[rule.oneOf.length - 1].exclude = [
					/\.(js|mjs|jsx|cjs|ts|tsx)$/,
					/\.html$/,
					/\.json$/,
				];
			}
			return rule;
		});
		return config;
	},
};