const PythonShell = require('python-shell');

exports.parse = (req, res) => {

  var options = {
    args: ['aa', 'controllers/HAB/predict.npy']
  };

  PythonShell.run('controllers/HAB/recorder.py', (err, results) => {
    if (err || results[1] != 'Data Recorded') {
      console.log(results);
      console.log(err);
      res.json({
        status: 'failed',
        data: 'Leap Capture Failure'
      });
    } else {
      if (req.query.type == 'left') {
        console.log("NUM");
        PythonShell.run('controllers/HAB/numclassifier.py', (err, results) => {
          if (err || results.length < 2) {
            console.log(results);
            console.log(err);
            res.json({
              status: 'failed',
              data: 'Classification Model Failure'
            });
          } else {
            console.log(results);
            res.json({
              status: 'success',
              data: results[1]
              //data: String.fromCharCode(parseInt(results[1])+65)
            });
          }
        });
      } else {
        console.log("ALPH");
        PythonShell.run('controllers/HAB/alphclassifier.py', (err, results) => {
          if (err || results.length < 2) {
            console.log(results);
            console.log(err);
            res.json({
              status: 'failed',
              data: 'Classification Model Failure'
            });
          } else {
            console.log(results);
            res.json({
              status: 'success',
              data: results[1]
              //data: String.fromCharCode(parseInt(results[1])+65)
            });
          }
        });
      }
   }
  });
};
