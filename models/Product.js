const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [50, "Description should be at least 50 characters"],
    },
    price: {
      type: Number,
      required: true,
      min: [0.01, "Price must be greater than 0"],
      set: (v) => Math.round(v * 100) / 100,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ["egg", "chick", "broilers", "old layers", "feed"],
        message: "{VALUE} is not a valid category",
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    __v: {
      type: Number,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted price
ProductSchema.virtual("priceFormatted").get(function () {
  return `$${this.price.toFixed(2)}`;
});

// Indexes
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ name: "text", description: "text" });
ProductSchema.index({ isFeatured: -1, createdAt: -1 });

module.exports = mongoose.model("Product", ProductSchema);
