"use strict";
const router = require("express").Router();
const user = require("../../app/controller/user");
const job = require("../../app/controller/job");
const { upload } = require("./../../app/services/fileUpload");
const isAuthenticated = require("./../../middlewares/isAuthenticated");
const clientController = require("../../app/controller/clientController");
const jobsController = require("../../app/controller/jobsControllers");
const workersController = require("../../app/controller/workersController");
const wwmUserController = require("../../app/controller/wwmUserController");
const designController = require("../../app/controller/designController");
const workerRequestController = require("../../app/controller/workerRequestController");
const notificationController = require("../../app/controller/notificationController");

// auth routes
router.post("/login", user.login);
router.post("/signUp", user.signUp);

router.post("/change/sendOTP", user.sendOTP);
router.post("/change/verifyOTP", user.verifyOTP);
router.post("/change/changePassword", user.changePassword);

// Service User
// router.post("/jobs", isAuthenticated(["USER", "ADMIN"]), job.createJob);
// router.get(
//   "/user/jobs",
//   isAuthenticated(["USER", "ADMIN"]),
//   job.listProviderJobs
// );
// router.get(
//   "/user/jobs/:job_id",
//   isAuthenticated(["USER", "ADMIN"]),
//   job.jobDetails
// );
// router.delete(
//   "/jobs/:job_id",
//   isAuthenticated(["USER", "ADMIN"]),
//   job.deleteJob
// );
// router.put("/jobs/:job_id", isAuthenticated(["USER", "ADMIN"]), job.updateJob);
// router.put(
//   "/user/review/:review_id?",
//   isAuthenticated(["USER"]),
//   job.addReview
// );
// router.get(
//   "/user/history/:filter",
//   isAuthenticated(["USER", "ADMIN"]),
//   job.history
// );
// router.get("/user/config", job.getConfig);
// router.post(
//   "/settings",
//   isAuthenticated(["USER", "PROVIDER", "ADMIN"]),
//   user.updateSettings
// );
// router.get(
//   "/settings",
//   isAuthenticated(["USER", "PROVIDER", "ADMIN"]),
//   user.getSettings
// );
// // Service Provider
// router.post(
//   "/provider/incident",
//   isAuthenticated(["PROVIDER"]),
//   job.addIncident
// );
// router.post(
//   "/provider/getAllIncident",
//   isAuthenticated(["USER", "ADMIN"]),
//   job.getIncident
// );
// router.post(
//   "/provider/jobs/near",
//   isAuthenticated(["PROVIDER"]),
//   job.jobsNearMe
// );
// router.get(
//   "/provider/jobs/available/:filter?",
//   isAuthenticated(["PROVIDER"]),
//   job.availableJobs
// );
// router.put(
//   "/jobs/apply/:job_id",
//   isAuthenticated(["PROVIDER", "ADMIN"]),
//   job.apply
// );
// router.get(
//   "/provider/myjobs",
//   isAuthenticated(["PROVIDER"]),
//   job.upcommingJobs
// );
// router.get(
//   "/provider/history/:filter",
//   isAuthenticated(["PROVIDER"]),
//   job.historyProvider
// );
// // service provide + User
// router.get(
//   "/jobs/:job_id",
//   isAuthenticated(["USER", "PROVIDER", "ADMIN"]),
//   job.getJob
// );
// router.delete(
//   "/jobs/reject/:job_id",
//   isAuthenticated(["PROVIDER"]),
//   job.rejectInvite
// );
router.post(
  "/profile/changePassword",
  isAuthenticated(["USER", "PROVIDER"]),
  user.changePasswordProfile
);

router.get("/me", isAuthenticated(["USER", "PROVIDER"]), user.me);
router.post(
  "/profile/update",

  user.updateUser
);

router.post(
  "/files",
  // isAuthenticated(["USER", "PROVIDER"]),
  upload.single("file"),
  user.fileUpload
);

// router.post(
//   "/profile/file",
//   isAuthenticated(["USER", "PROVIDER"]),
//   upload.single("file"),
//   user.fileUpload
// );

// router.get(
//   "/notification",
//   isAuthenticated(["USER", "PROVIDER"]),
//   user.notification
// );

// router.post("/jobEvents", isAuthenticated(["PROVIDER"]), job.jobEvents);

// router.post(
//   "/admin/jobs",
//   isAuthenticated(["ADMIN", "USER"]),
//   job.formatedJobs
// );
// router.post(
//   "/admin/jobs/:job_id/assign",
//   isAuthenticated(["ADMIN", "USER"]),
//   job.assign
// );

// router.get("/organizations", isAuthenticated(["ADMIN"]), user.allOrganization);
// router.post(
//   "/user/guardList",
//   isAuthenticated(["USER", "ADMIN"]),
//   user.guardListWithIdentity
// );
// router.post(
//   "/user/guardListSearch",
//   isAuthenticated(["USER", "ADMIN"]),
//   user.guardListSearch
// );

router.post("/getProfile", user.getProfile);
router.post("/updateProfile", user.updateProfile);
router.post("/registerDevice", user.registerDevice);

//Surya's code
//test commeit

// router.post(
//   "/user/verifyGuard",
//   isAuthenticated(["USER", "ADMIN"]),
//   user.verifyGuard
// );
// router.post(
//   "/jobs/historyUserSearch",
//   isAuthenticated(["USER", "ADMIN"]),
//   job.historyUserSearch
// );
// router.post(
//   "/user/getStaff",
//   isAuthenticated(["USER", "ADMIN"]),
//   user.getStaffList
// );
// router.post(
//   "/provider/regClient",
//   isAuthenticated(["USER", "ADMIN"]),
//   user.regNewClient
// );
// router.get(
//   "/provider/getClient",
//   isAuthenticated(["USER", "ADMIN"]),
//   user.getAllClients
// );

// router.post("/jobs/createMatch", job.saveMatch);
// router.post("/jobs/getAllMatch", job.getAllMatchs);
// router.post("/jobs/prediction", job.createPrediction);
// router.post("/jobs/saveNews", job.createNews);
// router.post("/jobs/getAllNews", job.getAllNews);
// router.post("/jobs/saveOtherInfo", job.saveOtherInfo);
// router.post("/jobs/getAllOtherInfo", job.getAllOtherInfo);
// router.post("/jobs/updateInfo", job.updateInfo);
// router.post("/jobs/deleteOneMatch", job.deleteMatch);
// router.post("/jobs/deleteOneNews", job.deleteNews);
// router.post("/jobs/uploadTeam", upload.single("file"), job.uploadTeam);
// router.post(
//   "/jobs/saveNewsWithImg",
//   upload.single("file"),
//   job.saveNewsWithImg
// );
// router.post("/jobs/createSeries", job.saveSeries);
// router.post("/jobs/getAllSeries", job.getAllSeries);

// client routes
router.post("/addClients", clientController.addClints);
router.post("/getAllClients", clientController.getAllClients);
router.post("/getClientById", clientController.getClientById);
router.post("/deleteClient", clientController.deleteClient);
router.post("/updateClient", clientController.updateClient);

//jobs routes
router.post("/addJobs", jobsController.addJobs);
router.post("/getJobByClent", jobsController.getAllJos);
router.post("/getJobById", jobsController.getJobById);
router.post("/getJobsByDesign", jobsController.getJobsByDesign);
router.post("/getJobsByJober", jobsController.getJobsByJober);
router.post("/getClientJoberJobs", jobsController.getClientJoberJobs);
router.post("/updateJob", jobsController.updateJob);
router.delete("/deletjob/:id", jobsController.deleteJob);
router.post("/addreport", jobsController.addreport);
router.post("/deleteReport", jobsController.deleteReport);
router.post("/addJober", jobsController.addJober);
router.post("/removeJober", jobsController.removeJober);
router.post("/updateJoberProgress", jobsController.updateJoberProgress);
router.post("/updateJobImages", jobsController.updateJobImages);
router.post("/updateJobPriceDate", jobsController.updateJobPriceDate);
router.post("/getClientJobByStatus", jobsController.getClientJobByStatus);
router.post("/getClientJobBymonth", jobsController.getClientJobBymonth);
router.post("/getWorkerJobByStatus", jobsController.getWorkerJobByStatus);
router.post("/getWorkerJobBymonth", jobsController.getWorkerJobBymonth);
router.post("/benifitAmount", jobsController.benifitAmount);

//workers routes
router.post("/addWorkers", workersController.addWorkers);
router.post("/addWorker", workersController.addWorker);
router.post("/updateWorker", workersController.updateWorker);
router.post("/getAllWorkers", workersController.getAllWorkers);
router.post("/getJobByworker", workersController.getJobByworker);
router.post("/updateJobWorkers", workersController.updateJobWorkers);
router.post("/deleteWorker", workersController.deleteWorker);
router.post("/deleteWorkerById", workersController.deleteWorkerById);

//design routes (client)
router.post("/addDesign", designController.addDesign);
router.post("/getAllDesigns", designController.getAllDesigns);
router.post("/getDesignById", designController.getDesignById);
router.post("/updateDesign", designController.updateDesign);
router.post("/deleteDesign", designController.deleteDesign);

// worker requests (client -> jober connection)
router.post("/sendWorkerRequest", workerRequestController.sendRequest);
router.post("/sendClientRequest", workerRequestController.sendClientRequest);
router.post("/acceptWorkerRequest", workerRequestController.acceptRequest);
router.post(
  "/getClientWorkerRequests",
  workerRequestController.getClientWorkerRequests
);
router.post(
  "/getJoberWorkerRequests",
  workerRequestController.getJoberWorkerRequests
);

// notifications
router.post("/getNotifications", notificationController.getNotifications);

// wwmUser
router.post("/adduser", wwmUserController.user);
router.post("/updateuser", wwmUserController.update);
router.post("/sendOtp", wwmUserController.sendOTP);
router.post("/verifyOTP", wwmUserController.verifyOTP);

module.exports = router;
