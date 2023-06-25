const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/employee', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("db connection is done")
  }).catch((err) => {
    console.log(err, "error in db")
  });

// Create a Mongoose schema for the employee
const employeeSchema = new mongoose.Schema({
  name: String,
  branch: String,
  department: String,
  salary: Number,
  CasualLeave: Number,
  DOJ: Date,
  number: {
    type: Number,
    unique: true,
    require: true
  },
  AttendanceFromDate: Date,
  AttendanceToDate: Date
});

const attSchema = new mongoose.Schema({
  name: String,
  branch: String,
  department: String,
  number: Number,
  AttendanceFromDate: {
    type: Date,
    required: true,
    unique: true
  },
  AttendanceToDate: {
    type: Date,
    required: true,
    unique: true
  }
});

const abbsSchema = new mongoose.Schema({
  name: String,
  branch: String,
  department: String,
  number: Number,
  AbsFromDate: {
    type: Date,
    required: true,
    unique: true
  },
  AbstoDate: {
    type: Date,
    required: true,
    unique: true
  }
});



const Employee = mongoose.model('Employee', employeeSchema);
const AttendanceData = mongoose.model("AttendanceDataa", attSchema)
const AbsenceData = mongoose.model("AbsenceDataaa", abbsSchema)




app.get('/employees', async (req, res) => {



  try {

    let MobileNumber = req.query.MobileNumber
    console.log(MobileNumber)

    if (!MobileNumber) {
      const employees = await Employee.find();
      console.log(employees, "emp")
      res.json(employees);
    } else {

      const employees = await Employee.findOne({ number: MobileNumber });
      console.log(employees, "empppp")
      res.json(employees);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new employee
app.post('/employees', async (req, res) => {
  const employee = new Employee({
    name: req.body.name,
    branch: req.body.branch,
    department: req.body.department,
    salary: req.body.salary,
    CasualLeave: req.body.CasualLeave,
    DOJ: req.body.DOJ,
    number: req.body.number
  });

  console.log(employee)

  try {
    if (!employee.number) {
      res.status(400).json({ message: "mobile number required" });
    } else {
      newEmployee = await employee.save(employee);
      res.status(201).json(newEmployee);
    }


  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/attendance", async (req, res) => {

  try {
    // let MobileNumber = req.query.MobileNumber
    // console.log(MobileNumber)

    let Employeee = new AttendanceData({
      name: req.body.name,
      branch: req.body.branch,
      department: req.body.department,
      number: req.body.number,
      AttendanceFromDate: req.body.AttendanceFromDate,
      AttendanceToDate: req.body.AttendanceToDate
    })

    console.log(Employeee)

    const employees = await Employee.findOne({ number: Employeee.number });
    console.log(employees, "empppp")
    if (employees) {

      let fromDate = Employeee.AttendanceFromDate
      fromDate = new Date(fromDate)
      let toDate = Employeee.AttendanceToDate
      toDate = new Date(toDate)

      if (fromDate <= toDate) {
        console.log(fromDate)
        // let data = {
        //   name: req.body.name,
        //   branch: req.body.branch,
        //   department: req.body.department,
        //   number: req.body.number,
        //   AttendanceFromDate: fromDate,
        //   AttendanceToDate: toDate
        // }
        // console.log(data)
        let dbData = await Employeee.save(Employeee)
        res.status(201).json(dbData)
      } else {
        res.status(200).json("message : formdate should be less than and equal to Todate")
      }
    } else {
      res.status(200).json("message : invalid userDetails")
    }


  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/attendance', async (req, res) => {



  try {

    let MobileNumber = req.query.MobileNumber
    console.log(MobileNumber)

    const employees = await Employee.findOne({ number: MobileNumber });
    console.log(employees, "empppp")

    if (employees === null) {
      res.status(200).json("message : invalid userDetails")
    } else {

      const employees = await AttendanceData.find({ number: MobileNumber });
      console.log(employees, "empppp")
      res.json(employees);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/absent", async (req, res) => {
  try {


    let Employeee = new AbsenceData({
      name: req.body.name,
      branch: req.body.branch,
      department: req.body.department,
      number: req.body.number,
      AbstoDate: req.body.AbstoDate,
      AbsFromDate: req.body.AbsFromDate,

    })

    console.log(Employeee)

    const employees = await Employee.findOne({ number: Employeee.number });
    console.log(employees, "empppp")
    let ClBalance = employees.CasualLeave
    console.log(ClBalance)
    if (employees) {

      let fromDate = Employeee.AbsFromDate
      fromDate = new Date(fromDate)
      let toDate = Employeee.AbstoDate
      toDate = new Date(toDate)

      const days = (fromDate, toDate) => {
        let difference = toDate.getTime() - fromDate.getTime();
        let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
        return TotalDays;
      }
      console.log(days(fromDate, toDate));

      if (fromDate <= toDate) {
        console.log(fromDate)
        if (parseInt(ClBalance) - parseInt(days) != 0) {
          console.log(fromDate)
          let dbData = await Employeee.save(Employeee)
          res.status(201).json({ message: 'Absent days marked successfully' ,dbData})
        } else {
          res.status(200).json(" message : Absent days marked as not paid ")
        }
      } else {
        res.status(200).json("message : formdate should be less than and equal to Todate")
      }
    } else {
      res.status(200).json("message : invalid userDetails")
    }


  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
