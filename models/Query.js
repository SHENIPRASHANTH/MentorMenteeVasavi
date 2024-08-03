const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const querySchema = new Schema({
    queryText: String,
    responseText: { type: String, default: '' },
    isResolved: { type: Boolean, default: false },
    student: { type: Schema.Types.ObjectId, ref: 'Student' } // Reference to Student ID
});

module.exports = mongoose.model('Query', querySchema);
