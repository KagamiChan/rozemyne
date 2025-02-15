import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  tseslint.configs.stylistic,
  eslintPluginPrettierRecommended,
)
