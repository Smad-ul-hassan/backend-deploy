const SUPPORTED_LANGS = ["en", "ar"];

const lang = (req, res, next) => {
  const { lang } = req.query;
  if (lang && typeof lang === "string" && SUPPORTED_LANGS.includes(lang)) {
    req.lang = lang;
  } else {
    req.lang = "en";
  }
  next();
};

export default lang;
