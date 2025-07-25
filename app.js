require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const mainRoutes = require("./src/routes/mainRoutes");
const academicProgramRoutes = require("./src/routes/academicProgramRoutes");
const academicContentRoutes = require("./src/routes/academicContentRoutes");
const homeContentRoutes = require("./src/routes/homeContentRoutes");
// const adminHomeContentRoutes = require("./src/routes/admin/homeContent");
// const adminAdmissionsRoutes = require("./src/routes/admin/admissions");
const adminRoutes = require("./src/routes/adminRoutes");
const aboutRoutes = require("./src/routes/aboutRoutes");
const activityRoutes = require("./src/routes/activityRoutes");
const admissionRoutes = require("./src/routes/admissionRoutes");
const teacherRoutes = require("./src/routes/teacherRoutes");
const galleryRoutes = require("./src/routes/galleryRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const documentRoutes = require("./src/routes/documentRoutes");
const logoRouter = require("./src/routes/logoRoutes");
const annualReportRoutes = require("./src/routes/annualReportRoutes");
const schoolManagementRoutes = require("./src/routes/schoolManagementRoutes");
const resultSummaryRoutes = require("./src/routes/resultSummaryRoutes");
const newsRoutes = require("./src/routes/newsRoutes");
const principalRoutes = require("./src/routes/principalRoutes");
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const adminViewMiddleware = require("./src/middleware/adminView");
const bookListRoutes = require("./src/routes/bookListRoutes");
const feeStructureRoutes = require("./src/routes/feeStructureRoutes");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
SESSION_SECRET="ADHAYANINTERNATIONALLLLLLLLLLLL"
// Session and flash configuration
app.use(
  session({
    secret: SESSION_SECRET || "ADHAYANINTERNATIONALLLLLLLLLLLL",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads"), {
  setHeaders: (res, path) => {
    // Add cache-busting headers for uploaded files
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(methodOverride("_method"));

// Import models after DB connection
const Logo = require("./src/models/Logo");

// Middleware to fetch logo data for all views
app.use(async (req, res, next) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      //console.log("Database not connected, skipping logo fetch");
      res.locals.logo = null;
      return next();
    }

    const logo = await Logo.findOne();
    res.locals.logo = logo;
    next();
  } catch (error) {
    console.error("Error fetching logo:", error.message);
    res.locals.logo = null;
    next();
  }
});

// Middleware to fetch contact info for all views
const contactMiddleware = require("./src/middleware/contact");
app.use(contactMiddleware);

// Admin layout middleware
app.use("/admin", (req, res, next) => {
  app.set("layout", "layout/admin");
  res.locals.layout = "admin/layouts/admin";
  next();
});

// Admin view middleware
app.use("/admin", adminRoutes); // Register admin routes first
app.use("/admin", bookListRoutes); // Register book list admin routes
app.use("/admin", feeStructureRoutes); // Register fee structure admin routes
app.use("/admin/logo", logoRouter); // Register logo routes under /admin path
app.use("/", annualReportRoutes); // Register annual report routes
app.use("/", schoolManagementRoutes); // Register school management routes
app.use("/", resultSummaryRoutes); // Register result summary routes
app.use("/", newsRoutes); // Register news routes
app.use("/", principalRoutes); // Register principal routes
app.use("/", mainRoutes);
app.use("/about", aboutRoutes);
app.use("/home-content", homeContentRoutes);
app.use("/activities", activityRoutes);
app.use("/admin/activities", activityRoutes);
app.use("/", admissionRoutes);
app.use("/", teacherRoutes);
app.use("/", galleryRoutes);
app.use("/contact", contactRoutes);
app.use("/", documentRoutes);
app.use("/", require("./src/routes/testimonialRoutes"));
//console.log("Line no 127", process.env.MONGO_URI);


// Database connection
const MONGO_URI =
  "mongodb+srv://innovationleetsoft:Leethesh@cluster0.sq6r6rg.mongodb.net/adhayayaninternational?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true, // Close sockets after 45s of inactivity
  })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    // Don't exit the process, let the app run with database errors
    // process.exit(1);
  });

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
