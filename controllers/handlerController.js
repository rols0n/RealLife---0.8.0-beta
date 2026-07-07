const AppError = require("../middlewares/utils/AppError");

exports.getAll = async (req, res, Model) => {
  const models = await Model.find();

  res.status(200).json({
    status: "success",
    modelCount: models.length,
    data: {
      data: models,
    },
  });
};

exports.create = async (req, res, Model) => {
  const model = await Model.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      data: model,
    },
  });
};

exports.update = async (req, res, Model) => {
  const updatedModel = await Model.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedModel) {
    throw new AppError(
      "Document doesn't exist",
      404,
      "DOCUMENT_NOT_FOUND"
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      data: updatedModel,
    },
  });
};

exports.getById = async (req, res, Model) => {
  const model = await Model.findById(req.params.id);

  if (!model) {
    throw new AppError(
      "Document doesn't exist",
      404,
      "DOCUMENT_NOT_FOUND"
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      data: model,
    },
  });
};

exports.delete = async (req, res, Model) => {
  const model = await Model.findByIdAndDelete(req.params.id);

  if (!model) {
    throw new AppError(
      "Document doesn't exist",
      404,
      "DOCUMENT_NOT_FOUND"
    );
  }

  res.status(204).send();
};