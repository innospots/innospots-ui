const { theme } = require('antd/lib');
const { convertLegacyToken, defaultTheme } = require('@ant-design/compatible/lib');

const appTokens = require('../src/config/tokens');

const { defaultAlgorithm, defaultSeed } = theme;

const mapV5Token = defaultAlgorithm(defaultSeed);
const v5Vars = convertLegacyToken({
  ...mapV5Token,
  ...appTokens.default,
});

export default {
  modifyVars: v5Vars,
  javascriptEnabled: true,
};
