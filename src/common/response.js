import messages from "../../config/messages.js";

export const sendResponse = (req, res, code, data) => {
  if (code && typeof code === "number") {
    var message = messages[code]["msg"]["en"];
  }
  return res.status(200).send({
    success: 1,
    message: message || "successful",
    data: data || {},
  });
};
