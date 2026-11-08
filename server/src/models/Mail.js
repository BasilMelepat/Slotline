import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    active: { type: Boolean, default: false },
  },
  { _id: false }
);

const mailSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mail: { type: String, required: true, trim: true, maxlength: 254 },
    mailKey: { type: String, required: true },
    // "HH:MM" in 24 hour form, empty when the mail is active now
    start: { type: String, default: '', match: /^(\d{2}:\d{2})?$/ },
    // Epoch milliseconds the countdown ends at
    at: { type: Number, default: 0 },
    activeNow: { type: Boolean, default: false },
    note: { type: String, trim: true, maxlength: 500, default: '' },
    projects: { type: [projectSchema], default: [] },
  },
  { timestamps: true }
);

mailSchema.index({ user: 1, mailKey: 1 }, { unique: true });

mailSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    delete ret.mailKey;
    return ret;
  },
});

export default mongoose.model('Mail', mailSchema);
