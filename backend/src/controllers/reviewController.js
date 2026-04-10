import * as reviewService from '../services/reviewService.js';

export const listPropertyReviews = async (req, res) => {
  const reviews = await reviewService.listPropertyReviews(Number(req.params.propertyId));
  res.json({ reviews });
};

export const upsertReview = async (req, res) => {
  const review = await reviewService.upsertReview({
    userId: req.user.id,
    propertyId: Number(req.params.propertyId),
    rating: req.body.rating,
    comment: req.body.comment
  });

  res.status(201).json({ review, message: 'Пікір сақталды' });
};
