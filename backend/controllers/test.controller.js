export const testApi = (req, res) => {
  res.json({
    message: "Backend test API working",
    time: new Date().toISOString()
  });
};
