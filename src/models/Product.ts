import moment from 'moment';
import { Schema, model } from 'mongoose';
import { DATETIME_FORMAT } from '../constants/creds.constants';
import { IProduct } from '../types/products.types.';

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    startingBid: { type: Number, required: true },
    currentBid: { type: Number },
    auctionEndTime: { type: String, default: moment().add(2, 'weeks').utc().format(DATETIME_FORMAT) },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
    images: [{ type: String }], // Array of image URLs
  },
  { timestamps: true }
);

// Pre-save hook to set currentBid = startingBid if not provided
productSchema.pre('save', function (next) {
  if (this.isNew && this.currentBid === undefined) {
    this.currentBid = this.startingBid;
  }
  next();
});

export default model('Product', productSchema);
