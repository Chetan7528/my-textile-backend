const Jobs = require("../model/jobsModel");
const notification = require("../services/notification");
const response = require("../responses");

module.exports = {
  addJobs: async (req, res) => {
    const payload = req.body;
    console.log(payload);
    let job = new Jobs({
      title: payload.title,
      description: payload.description,
      partyname: payload.partyname,
      billno: payload.billno,
      clothname: payload.clothname,
      date: payload.date,
      status: payload.status,
      pcs: payload.pcs,
      price: payload.price,
      suittype: payload.suittype,
      pctype: payload.pctype,
      client_id: payload.client_id,
      design_id: payload.design_id,
      user_id: payload.user_id,
      Jobcompletedate: payload.Jobcompletedate,
      images: payload.images || []
    });

    await job.save();
    return response.created(res, { job });
  },

  getAllJos: async (req, res) => {
    const payload = req.body;
    let startOfCurrentMonth = new Date();
    let startOfNextMonth = new Date();
    let job = [];

    if (payload.type === "all") {
      job = await Jobs.find({
        user_id: payload.user_id,
      }).populate("design_id", "name");
    } else {
      if (payload.type === "current") {
        startOfCurrentMonth.setDate(0);
        startOfNextMonth.setDate(1);
        startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
      }

      if (payload.type === "last") {
        startOfCurrentMonth.setMonth(startOfNextMonth.getMonth() - 1);
        startOfCurrentMonth.setDate(0);
        startOfNextMonth.setDate(1);
      }

      console.log(startOfCurrentMonth, startOfNextMonth);
      if (payload.start) {
        startOfCurrentMonth = new Date(payload.start);
        startOfNextMonth = new Date(payload.end);
      }

      job = await Jobs.find({
        user_id: payload.user_id,
        Jobcompletedate: {
          $gte: startOfCurrentMonth,
          $lt: startOfNextMonth,
        },
      });
    }
    return response.ok(res, job);
  },

  getJobsByDesign: async (req, res) => {
    const payload = req.body;
    const job = await Jobs.find({
      design_id: payload.design_id,
    })
      .populate("client_id")
      .sort({ createdAt: -1 });
    return response.ok(res, job);
  },

  // A jober's own jobs (jobs any client has assigned them to), optionally
  // filtered by the owning client (user_id), by design, by one of the
  // jober's own piece-workers (workers.worker_id), and by Pending/Complete -
  // gated on THIS jober's own completion of their part of the job
  // (jobers.$.completeDate), not the job's overall shared status, for the
  // Jober-side "All Jobs" (Pending/Complete) screen.
  getJobsByJober: async (req, res) => {
    const payload = req.body;
    const query = { "jobers.jober_id": payload.jober_id };
    if (payload.client_id) {
      query.user_id = payload.client_id;
    }
    if (payload.design_id) {
      query.design_id = payload.design_id;
    }
    if (payload.worker_id) {
      query["workers.worker_id"] = payload.worker_id;
    }
    if (payload.status === "Pending" || payload.status === "Complete") {
      query.jobers = {
        $elemMatch: {
          jober_id: payload.jober_id,
          completeDate: payload.status === "Complete" ? { $ne: null } : null,
        },
      };
    }
    const job = await Jobs.find(query)
      .populate("client_id")
      .populate("design_id", "name")
      .populate("user_id", "fullName uniqueId")
      .sort({ createdAt: -1 });
    return response.ok(res, job);
  },

  // A client's jobs, optionally scoped to one jober (jobers.jober_id),
  // status, design, and - when a jober is given - that jober's own
  // completion date range (jobers.$.completeDate). When no jober_id is
  // given, the job's own Jobcompletedate is used for the date range
  // instead, for the Client-side "worker jobs" (Pending/Complete) screen
  // when opened unscoped (e.g. from the Dashboard "See All").
  getClientJoberJobs: async (req, res) => {
    const payload = req.body;
    const query = { user_id: payload.user_id };
    if (payload.status) {
      query.status = payload.status;
    }
    if (payload.design_id) {
      query.design_id = payload.design_id;
    }
    if (payload.start && payload.end) {
      if (payload.jober_id) {
        query.jobers = {
          $elemMatch: {
            jober_id: payload.jober_id,
            completeDate: {
              $gte: new Date(payload.start),
              $lt: new Date(payload.end),
            },
          },
        };
      } else {
        query.Jobcompletedate = {
          $gte: new Date(payload.start),
          $lt: new Date(payload.end),
        };
      }
    } else if (payload.jober_id) {
      query["jobers.jober_id"] = payload.jober_id;
    }
    const job = await Jobs.find(query)
      .populate("design_id", "name")
      .sort({ createdAt: -1 });
    return response.ok(res, job);
  },

  getJobById: async (req, res) => {
    const payload = req.body;
    const job = await Jobs.find({
      _id: payload.job_id,
    })
      .populate("client_id")
      .populate("design_id")
      .populate("user_id", "fullName uniqueId")
      .populate("jobers.jober_id", "fullName uniqueId contact");
    return response.ok(res, job);
  },

  addJober: async (req, res) => {
    const payload = req.body;
    const job = await Jobs.findByIdAndUpdate(
      payload.job_id,
      {
        $push: {
          jobers: {
            jober_id: payload.jober_id,
            fullName: payload.fullName,
            role: payload.role,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );
    if (!job) {
      return res.status(200).send({ status: false, message: "Job not found." });
    }

    await notification.notify(
      payload.jober_id,
      `${payload.clientName || "A client"} added you to job "${
        job.title || ""
      }".`,
      { type: "JOB_ASSIGNED" }
    );

    return response.ok(res, job);
  },

  removeJober: async (req, res) => {
    const payload = req.body;
    const job = await Jobs.findByIdAndUpdate(
      payload.job_id,
      { $pull: { jobers: { _id: payload._id } } },
      { new: true }
    );
    return response.ok(res, job);
  },

  // A jober updating only their own progress for their part of the job -
  // price, completion date, and description - never the job's shared
  // fields (title, pcs, the legacy top-level price/description, etc.),
  // only their entry inside `jobers`.
  updateJoberProgress: async (req, res) => {
    const payload = req.body;
    const setFields = {};
    if (payload.price !== undefined) {
      setFields["jobers.$.price"] = payload.price;
    }
    if (payload.completeDate !== undefined) {
      setFields["jobers.$.completeDate"] = payload.completeDate;
    }
    if (payload.description !== undefined) {
      setFields["jobers.$.description"] = payload.description;
    }

    const job = await Jobs.findOneAndUpdate(
      { _id: payload.job_id, "jobers.jober_id": payload.jober_id },
      { $set: setFields },
      { new: true }
    );
    if (!job) {
      return res
        .status(200)
        .send({ status: false, message: "You are not assigned to this job." });
    }

    if (payload.completeDate !== undefined && job.user_id) {
      const mine = (job.jobers || []).find(
        (j) => String(j.jober_id) === String(payload.jober_id)
      );
      await notification.notify(
        job.user_id,
        `${mine?.fullName || "A jober"} marked their part of job "${
          job.title || ""
        }" complete.`,
        { type: "JOB_COMPLETED" }
      );
    }

    return response.ok(res, job);
  },

  updateJob: async (req, res) => {
    const payload = req.body;
    const job = await Jobs.findByIdAndUpdate(payload.job_id, payload, {
      new: true,
      upsert: true,
    });
    return response.ok(res, job);
  },

  // Lets the job owner quick-save just Price / Job Complete Date on their
  // own job, independent of the full job edit/save flow - same $set safety
  // as updateJobImages, never a full-document replace.
  updateJobPriceDate: async (req, res) => {
    const payload = req.body;
    const setFields = {};
    if (payload.price !== undefined) {
      setFields.price = payload.price;
    }
    if (payload.Jobcompletedate !== undefined) {
      setFields.Jobcompletedate = payload.Jobcompletedate;
    }
    const job = await Jobs.findByIdAndUpdate(
      payload.job_id,
      { $set: setFields },
      { new: true }
    );
    return response.ok(res, job);
  },

  // A jober who isn't the job's owner can still add/remove sample photos
  // (per the client's request) - this only ever $sets `images`, never
  // replaces the whole document like the generic updateJob above does.
  updateJobImages: async (req, res) => {
    const payload = req.body;
    const job = await Jobs.findByIdAndUpdate(
      payload.job_id,
      { $set: { images: payload.images || [] } },
      { new: true }
    );
    return response.ok(res, job);
  },

  deleteJob: async (req, res) => {
    try {
      await Jobs.findByIdAndRemove(req?.params?.id);
      return response.ok(res, { message: "Job deleted successfully" });
    } catch (err) {
      return response.error(res, err);
    }
  },

  addreport: async (req, res) => {
    const payload = req.body;
    const job = await Jobs.findByIdAndUpdate(
      payload.job_id,
      { $push: { report: { ...payload, createdAt: new Date() } } },
      { new: true, upsert: true }
    );
    return response.created(res, job);
  },

  deleteReport: async (req, res) => {
    const payload = req.body;
    console.log(payload);
    const query = { _id: payload.job_id };
    await Jobs.updateOne(
      query,
      { $pull: { report: { _id: payload._id } } },
      { new: true, upsert: true }
    );
    return response.created(res, {
      message: "Job report deleted successfully!",
    });
  },

  getWorkerJobByStatus: async (req, res) => {
    const payload = req.body;
    const job = await Jobs.find({
      status: payload.status,
      workers: { $elemMatch: { worker_id: payload.worker_id } },
    });
    return response.ok(res, job);
  },

  // History for one of the jober's own piece-workers - gated on THIS
  // jober's own completion of their part of the job (jobers.$.completeDate),
  // not the job's overall shared status, since a job isn't "done" for this
  // jober's history until they've marked their own part complete,
  // regardless of what the client or other jobers have done on it.
  getWorkerJobBymonth: async (req, res) => {
    const payload = req.body;
    let startOfCurrentMonth = new Date();
    let startOfNextMonth = new Date();
    let job = [];

    if (payload.type === "all") {
      job = await Jobs.find({
        workers: { $elemMatch: { worker_id: payload.worker_id } },
        jobers: {
          $elemMatch: { jober_id: payload.jober_id, completeDate: { $ne: null } },
        },
      });
    } else {
      if (payload.type === "current") {
        startOfCurrentMonth.setDate(0);
        startOfNextMonth.setDate(1);
        startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
      }

      if (payload.type === "last") {
        startOfCurrentMonth.setMonth(startOfNextMonth.getMonth() - 1);
        startOfCurrentMonth.setDate(0);
        startOfNextMonth.setDate(1);
      }
      console.log(startOfCurrentMonth, startOfNextMonth);
      if (payload.start) {
        startOfCurrentMonth = new Date(payload.start);
        startOfNextMonth = new Date(payload.end);
      }

      job = await Jobs.find({
        workers: { $elemMatch: { worker_id: payload.worker_id } },
        jobers: {
          $elemMatch: {
            jober_id: payload.jober_id,
            completeDate: {
              $gte: startOfCurrentMonth,
              $lt: startOfNextMonth,
            },
          },
        },
      });
    }

    return response.ok(res, job);
  },

  getClientJobByStatus: async (req, res) => {
    const payload = req.body;

    const job = await Jobs.find({
      user_id: payload.user_id,
      client_id: payload.client_id,
      status: payload.status,
    });

    return response.ok(res, job);
  },

  getClientJobBymonth: async (req, res) => {
    const payload = req.body;
    let startOfCurrentMonth = new Date();
    let startOfNextMonth = new Date();
    let job = [];

    if (payload.type === "all") {
      job = await Jobs.find({
        client_id: payload.client_id,
        status: "Complete",
      });
    } else {
      console.log(startOfCurrentMonth);
      if (payload.type === "current") {
        startOfCurrentMonth.setDate(0);
        startOfNextMonth.setDate(1);
        startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
      }

      if (payload.type === "last") {
        startOfCurrentMonth.setMonth(startOfNextMonth.getMonth() - 1);
        startOfCurrentMonth.setDate(0);
        startOfNextMonth.setDate(1);
      }

      console.log(startOfCurrentMonth, startOfNextMonth);

      if (payload.start) {
        startOfCurrentMonth = new Date(payload.start);
        startOfNextMonth = new Date(payload.end);
      }

      job = await Jobs.find({
        client_id: payload.client_id,
        status: "Complete",
        Jobcompletedate: {
          $gte: startOfCurrentMonth,
          $lt: startOfNextMonth,
        },
      });
    }

    return response.ok(res, job);
  },

  benifitAmount: async (req, res) => {
    const payload = req.body;
    let startOfCurrentMonth = new Date();
    let startOfNextMonth = new Date();
    let job = [];

    if (payload.type === "all") {
      job = await Jobs.find({
        user_id: payload.user_id,
        status: "Complete",
      }).populate("client_id");
    } else {
      if (payload.type === "current") {
        startOfCurrentMonth.setDate(0);
        startOfNextMonth.setDate(1);
        startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);
      }

      if (payload.type === "last") {
        startOfCurrentMonth.setMonth(startOfNextMonth.getMonth() - 1);
        startOfCurrentMonth.setDate(0);
        startOfNextMonth.setDate(1);
      }

      console.log(startOfCurrentMonth, startOfNextMonth);

      if (payload.start) {
        startOfCurrentMonth = new Date(payload.start);
        startOfNextMonth = new Date(payload.end);
      }

      job = await Jobs.find({
        user_id: payload.user_id,
        status: "Complete",
        Jobcompletedate: {
          $gte: startOfCurrentMonth,
          $lt: startOfNextMonth,
        },
      }).populate("client_id");
    }
    let formattedJobs = {
      client: [],
      workers: [],
    };
    let grandClientTotal = 0;
    let grandWorkerTotal = 0;

    job.map((j, index) => {
      let client = formattedJobs.client.find(
        (f) => f.name === j.client_id.firm
      );
      grandClientTotal = grandClientTotal + j.pcs * j.price;
      if (client) {
        client.total = client.total + j.pcs * j.price;

        j.workers.map((w) => {
          grandWorkerTotal = grandWorkerTotal + w.pcs * w.rate;
          let worker = formattedJobs.workers.find((f) => f.name === w.fullName);
          if (worker) {
            worker.total = worker.total + w.pcs * w.rate;
            worker.jobs = worker.jobs + 1;
          } else {
            formattedJobs.workers.push({
              name: w.fullName,
              worker_id: w.worker_id,
              total: w.pcs * w.rate,
              jobs: worker?.jobs || 0 + 1,
            });
          }
        });
      } else {
        let jobs = job.filter((f) => f.client_id._id === j.client_id._id);
        formattedJobs.client.push({
          name: j.client_id.firm,
          client_id: j.client_id._id,
          precentage: j.client_id.percentage,
          total: j.pcs * j.price,
          jobs: jobs.length,
        });
        j.workers.map((w) => {
          grandWorkerTotal = grandWorkerTotal + w.pcs * w.rate;
          let worker = formattedJobs.workers.find((f) => f.name === w.fullName);
          if (worker) {
            worker.total = worker.total + w.pcs * w.rate;
            worker.jobs = worker.jobs + 1;
          } else {
            formattedJobs.workers.push({
              name: w.fullName,
              worker_id: w.worker_id,
              total: w.pcs * w.rate,
              jobs: 1,
            });
          }
        });
      }
    });

    return response.ok(res, {
      clients: formattedJobs.client,
      workers: formattedJobs.workers,
      grandClientTotal,
      grandWorkerTotal,
    });
  },
};
