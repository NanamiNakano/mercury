import antfu from "@antfu/eslint-config"

export default antfu({
  react: true,
  stylistic: {
    quotes: "double",
  },
  ignores: ["**/*.md"],
})
