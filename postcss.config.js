module.exports = {
  plugins: [
    require("postcss-import"),
    require("tailwindcss"),
    require("postcss-nested"),
    require("autoprefixer"),
    process.env.NODE_ENV === "production" &&
      require("@fullhuman/postcss-purgecss")({
        content: ["./publish/**/*.html"],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        whitelist: [
          "tab-active",
          "searchresult",
          "md:flex",
          "md:w-1/3",
          "md:w-2/3",
          "border-b",
          "hover:bg-red-100"
        ]
      })
  ]
};
