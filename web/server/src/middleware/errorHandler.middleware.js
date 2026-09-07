const errorHandler = (err, _req, res, _next) => {
  console.error(err.message);

  if (
    err.message.includes("invalid file format") ||
    err.message.includes("bad magic bytes") ||
    err.message.includes("could not read or parse")
  ) {
    return res.status(400).json({ error: "Not a valid .veil file" });
  }

  if (err.message.includes("authentication failed")) {
    return res.status(401).json({ error: "Wrong password or corrupted file" });
  }
  if (
    err.message.includes("invalid file format") ||
    err.message.includes("bad magic bytes")
  ) {
    return res.status(400).json({ error: "Not a valid .veil file" });
  }
  if (err.message.includes("password cannot be empty")) {
    return res.status(400).json({ error: "Password cannot be empty" });
  }
  if (err.message.includes("could not read input file")) {
    return res
      .status(400)
      .json({ error: "Could not process the uploaded file" });
  }

  res.status(500).json({ error: "Something went wrong during processing" });
};

module.exports = { errorHandler };
