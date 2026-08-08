const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobsSchema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    images: [{ type: String }],
    partyname: {
      type: String,
    },
    date: {
      type: String,
    },
    status: {
      type: String,
    },
    pcs: {
      type: String,
    },
    price: {
      type: String,
    },
    Jobcompletedate: {
      type: Date,
    },
    billno: {
      type: String,
    },
    clothname: {
      type: String,
    },
    suittype: {
      type: String,
    },
    pctype: {
      type: String,
    },
    client_id: {
      type: mongoose.Types.ObjectId,
      ref: "Clients",
    },
    design_id: {
      type: mongoose.Types.ObjectId,
      ref: "Designs",
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    workers: [
      {
        fullName: {
          type: String,
        },
        color: {
          type: String,
        },
        pcs: {
          type: String,
        },
        rate: {
          type: String,
        },
        job_id: {
          type: mongoose.Types.ObjectId,
          ref: "Jobs",
        },
        worker_id: {
          type: mongoose.Types.ObjectId,
          ref: "Workers",
        },
        // The jober (logged-in user) who added this worker entry, so the
        // Jober-side job details page can show only their own workers.
        jober_id: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    report: [
      new Schema(
        {
          title: {
            type: String,
          },
          desc: {
            type: String,
          },
          images: [{ type: String }],
          // Who created this report - denormalized (like `jobers.fullName`)
          // so the client can show the name without an extra populate.
          createdBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
          },
          createdByName: {
            type: String,
          },
          createdByRole: {
            type: String,
          },
        },
        // `createdAt` here is this report's created time.
        { timestamps: true }
      ),
    ],

    // Jobers (accepted worker-request connections) the client has assigned
    // to this job, from the Client side of the app.
    jobers: [
      new Schema(
        {
          jober_id: {
            type: mongoose.Types.ObjectId,
            ref: "User",
          },
          fullName: {
            type: String,
          },
          role: {
            type: String,
          },
          // This jober's own price/rate for their part of the job - not the
          // job's overall price, since a job can have several jobers.
          price: {
            type: String,
          },
          // This jober's own completion date for their part of the job - not
          // the job's overall Jobcompletedate.
          completeDate: {
            type: Date,
          },
          // This jober's own progress note - not the job's overall description.
          description: {
            type: String,
          },
        },
        // `createdAt` here doubles as this jober's assign date.
        { timestamps: true }
      ),
    ],
  },
  {
    timestamps: true,
  }
);

const Jobs = mongoose.model("Jobs", JobsSchema);
module.exports = Jobs;
