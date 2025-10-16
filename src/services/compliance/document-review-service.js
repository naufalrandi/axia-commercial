const model = require("../../models/index");
const { searchData, pagination } = require("../../helpers/func");
const { ResponseError } = require("../../errors/response-error");
const validate = require("../../validations/validation");
const {
  setNotesValidation,
} = require("../../validations/profile/document-review-validation");
const { DOCUMENT_REVIEW_STATUS } = require("../../enum/utils");

const getAll = async (data) => {
  const { page, limit, offset, orderby, sortBy, search } = data;
  const fieldSearch = searchData(["notes", "reviewableType", "status"], search);

  const result = await model.DocumentReview.findAndCountAll({
    where: {
      ...fieldSearch,
    },
    limit,
    offset,
    order: [[sortBy, orderby]],
  });

  return pagination(result, page, limit);
};

const getOne = async (id) => {
  const review = await model.DocumentReview.findOne({
    where: { id },
  });

  if (!review) {
    throw new ResponseError(404, "Document review not found");
  }

  return review;
};

// Set notes for a document review
const setNotes = async (id, data) => {
  data = validate(setNotesValidation, data);

  // Check if review exists
  await getOne(id);
  await model.DocumentReview.update(
    {
      notes: data.notes,
      reviewAt: new Date(),
      status: DOCUMENT_REVIEW_STATUS.REVIEWED,
    },
    { where: { id } }
  );

  return await getOne(id);
};

// Create bulk reviews for reviewers
const createBulkReviews = async (
  reviewableType,
  reviewableId,
  reviewers,
  transaction = null
) => {
  if (!reviewers || reviewers.length === 0) {
    return [];
  }

  const reviews = reviewers.map((reviewer) => ({
    userId: reviewer.id, // Fix: menggunakan reviewer.id bukan reviewer.userId
    reviewableType,
    reviewableId,
    status: "pending", // Fix: menggunakan string literal karena DOCUMENT_REVIEW_STATUS belum didefinisikan dengan benar
    notes: "",
  }));

  const options = {};
  if (transaction) {
    options.transaction = transaction;
  }

  return await model.DocumentReview.bulkCreate(reviews, options);
};

module.exports = {
  getAll,
  getOne,
  setNotes,
  createBulkReviews,
};
