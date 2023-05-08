exports.getAll = async (req, res, Model) => {
  try {
    const model = await Model.find();

    res.status(200).json({
      status: "success",
      modelCount: model.length,
      data: {
        data: model,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err: {
        err,
      },
    });
  }
};

exports.create = async (req, res, Model) => {
  try {
    const model = await Model.create(req.body);

    res.status(200).json({
      status: "success",
      data: {
        data: model,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
};

exports.update = async (req, res, Model) => {
  try {
    await Model.findByIdAndUpdate(req.params.id, req.body);
    const updatedModel = await Model.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        data: updatedModel,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err: {
        err,
      },
    });
  }
};

exports.getById = async (req, res, Model) => {
  try {
    const model = await Model.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        data: model,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err: {
        err,
      },
    });
  }
};

exports.delete = async (req, res, Model) => {
  try {
    await Model.findByIdAndRemove(req.params.id);

    res.status(200).json({ status: "success", data: {} });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err: {
        err,
      },
    });
  }
};
