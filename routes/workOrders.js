const express = require('express');
const router = express.Router();
const WorkOrder = require('../models/workOrder.js');

router.get('/', (req, res) => {
    res.render('workOrders');
});

router.get('/loadWorkOrders/:sortOption', (req, res) => {
    let option = req.params.sortOption;
    switch (option) {
        case 'open':
            WorkOrder.find({ status: 'open' }, (err, workOrders) => {
                if (err) res.send(err);
                res.json(workOrders)
            });
            break;
        case 'closed':
            WorkOrder.find({ status: 'closed' }, (err, workOrders) => {
                if (err) res.send(err);
                res.json(workOrders)
            });
            break;
        case 'responded':
            WorkOrder.find({ status: 'open', respondedTo: true }, (err, workOrders) => {
                if (err) res.send(err);
                res.json(workOrders)
            });
            break;
        default:
            WorkOrder.find({}, (err, workOrders) => {
                if (err) res.send(err);
                res.json(workOrders);
            });
            break;
    }
});

router.get('/getWoInfo/:num', (req, res) => {
    WorkOrder.find({ workOrderNum: req.params.num }, (err, workOrder) => {
        if (err) res.send(err);
        res.json(workOrder[0]);
    });
});

router.put('/respondToWorkOder/:num', (req, res) => {
    WorkOrder.updateOne({ workOrderNum: req.params.num }, {
        $set: {
            respondedTo: true,
            resEmp: req.body.resEmp,
            resEmpTitle: req.body.resEmpTitle,
            resDate: req.body.resDate,
            resTime: req.body.resTime
        }
    }, {
        sort: { _id: -1 },
        upsert: true
    }, (err, doc) => {
        if (err) {
            console.log("Something wrong when updating data!");
        }
        res.json('')
    });
});

router.put('/closeWorkOrder/:num', (req, res) => {
    WorkOrder.updateOne({ workOrderNum: req.params.num }, {
        $set: {
            status: 'closed',
            solutionDetail: req.body.solDetail
        }
    }, {
        sort: { _id: -1 },
        upsert: true
    }, (err, doc) => {
        if (err) {
            console.log("Something wrong when updating data!");
        }
        res.json('')
    });
});

router.post('/postWorkOrder', (req, res) => {
    try {
        let workOrderNum;
        workOrderNum = setWONum();
        const newWorkOrder = new WorkOrder({
            workOrderNum: workOrderNum,
            status: 'open',
            respondedTo: false,
            reqEmp: req.body.reqEmp,
            reqEmpTitle: req.body.reqEmpTitle,
            reqDate: req.body.reqDate,
            reqTime: req.body.reqTime,
            mod: req.body.mod,
            mach: req.body.mach,
            machNum: req.body.machNum,
            reqDept: req.body.reqDept,
            probDetail: req.body.probDetail,
            resEmp: '',
            resEmpTitle: '',
            resDate: '',
            resTime: '',
            solutionDetail: ''
        });
        newWorkOrder.save();
        res.json(workOrderNum);
    }
    catch (err) {
        console.log(err);
    }
});

router.delete('/deleteWorkOrder/:num', (req, res) => {
    WorkOrder.deleteOne({ workOrderNum: req.params.num }, (err, workOrders) => {
        if (err) res.send(err);

        res.json(workOrders);
    });
});

function setWONum(usedNums) {
    let num = 0;
    // while (usedNums.includes(num) || num === 0) {
    num = Math.ceil(Math.random() * 999);
    num = ("0000" + num).slice(-6);
    // }
    return num;
}


module.exports = router;