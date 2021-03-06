/**
 * Created by juyoungjung on 2017. 1. 18..
 */

var fs = require("fs");
var util = require("util");
var mime = require("mime");
var gcs = require('@google-cloud/storage')({
    projectId: "kb141-17d6a",
    // keyFilename: "/Users/juyoungjung/Downloads/KB141-ee115063fbe4.json"
    keyFilename: "c:/zzz/ad/KB141-ee115063fbe4.json"
});

var fileIO = (function () {

    var adName = null;
    var ruleName = null;
    var bucket = gcs.bucket("kb141-17d6a.appspot.com/AD_File");

    function setAdNameRuleName(obj) {
        adName = obj.adName;
        ruleName = obj.ruleName;
    }



    function firebaseDownload(fileName) {
        console.log(fileName);
        var stream = bucket.file(fileName).createReadStream();
        // var localWrite = fs.createWriteStream('/Users/juyoungjung/Documents/' + fileName);
        var localWrite = fs.createWriteStream('c:/zzz/ad/' + fileName);
        stream.pipe(localWrite);
    }

    // function localLogRead(callback) {
    //     // var input = fs.createReadStream("/Users/juyoungjung/Downloads/adlog.csv");
    //     var input = fs.createReadStream("c:zzz/ad/adlog.csv");
    //     input.on('data', function (chunk) {
    //         result = chunk.toString();
    //         var obj = {"text": result};
    //         console.log(obj);
    //         callback(obj);
    //     });
    // }

    function localWrite() { // 컬럼명 지정할 때. file 없으면 새로 만들기.
        var data = "\"ino\"," + "\"dno\"," + "\"age\"," + "\"gender\"," + "\"adno\"," + "\"watch_time\"," + "\"curr_time\"," +
            "\"bef_happiness\"," + "\"bef_anger\"," + "\"bef_sadness\"," + "\"bef_neutral\"," + "\"bef_surprise\"," + "\"bef_fear\"," +
            "\"bef_contempt\"," + "\"bef_disgust\"," + "\"aft_happiness\"," + "\"aft_anger\"," + "\"aft_sadness\"," + "\"aft_neutral\"," +
            "\"aft_surprise\"," + "\"aft_fear\"," + "\"aft_contempt\"," + "\"aft_disqust\"," + "\"rule\"\n";
        // fs.writeFileSync("/Users/juyoungjung/Downloads/adlog.csv" , data , 'utf8');
        fs.writeFileSync("c:/zzz/ad/adlog7.csv", data, 'utf8');
    }

    function logWrite(log) {
        // "\"1\","
        var data = "\"ino\"," + "\"1\"," + Math.round(log.detect.age) + "," + log.detect.gender + "," + adName + "," + log.watchTime + "," + log.currentTime + "," +
            log.befEmotion.happiness + "," + log.befEmotion.anger + "," + log.befEmotion.sadness + "," + log.befEmotion.neutral + "," + log.befEmotion.surprise + "," +
            log.befEmotion.fear + "," + log.befEmotion.contempt + "," + log.befEmotion.disgust + "," + log.aftEmotion.happiness + "," + log.aftEmotion.anger + "," +
            log.aftEmotion.sadness + "," + log.aftEmotion.neutral + "," + log.aftEmotion.surprise + "," + log.aftEmotion.fear + "," + log.aftEmotion.contempt + "," +
            log.aftEmotion.disgust + "," + ruleName + "\n";
        // fs.appendFile("/Users/juyoungjung/Downloads/adlog.csv" , data , 'utf8' , function (err) {
        fs.appendFile("c:/zzz/ad/adlog7.csv", data, 'utf8', function (err) {
            console.log(err);
        });
    }

    function adFileImgRead(callback) {
        // var adImgList = fs.readFileSync("/Users/juyoungjung/Downloads/list.csv");
        var adImgList = fs.readFileSync("c:/zzz/ad/list.csv");

        var csvRows = adImgList.toString('utf8');
        var csvRow = csvRows.split('\r\n');
        var columns = csvRow[0].split(',');

        var filesArr = new Array();
        for (var i = 1; i < csvRow.length - 1; i++) {
            var rule = {};
            var row = csvRow[i].split(',');
            for (var j = 0; j < columns.length; j++) {
                // rule[columns[j].slice(1, -1)] = row[j].slice(1, -1); // 따옴표
                rule[columns[j]] = row[j]; // 안 따옴표
            }
            filesArr.push(rule);
            console.log(rule);
        }

        // 여기에 파일 체크하는 거 있어야 합니다.
        // for 문 돌면서 없는 파일은 firebase에서 다운받아야 합니다.
        for (var j = 0; j < filesArr.length; j++) {
            for (var k = 1 ; k < 3 ; k++)
            if(fs.existsSync("c:/zzz/ad/" + filesArr[j][columns[k]]) == false) {
                var missingFile = filesArr[j][columns[k]];
                console.log(missingFile + " is null");
                firebaseDownload(missingFile);

            }
        }




        var i = 0;
        var fileUri = new Array();
        var convert = setInterval(function () {
            // var files = arr[j+count].slice(1,-1);
            // var data = fs.readFileSync("/Users/juyoungjung/Downloads/adimages/"+filesArr[i]["image"]).toString("base64");
            // fileUri.push(util.format("data:%s;base64,%s" , mime.lookup("/Users/juyoungjung/Downloads/adimages/"+filesArr[i]["image"]),data));
            var data = fs.readFileSync("c:/zzz/ad/" + filesArr[i]["image"]).toString("base64");
            fileUri.push(util.format("data:%s;base64,%s", mime.lookup("c:/zzz/ad/" + filesArr[i]["image"]), data));

            i++;
            if (i == filesArr.length) {
                console.log("end....");
                clearInterval(convert);
                callback(fileUri);
            }
        }, 100);
    }

    function adVideoRead(path, callback) {
        console.log("video called...");
        console.log(path);
        // var stream = fs.createReadStream("/Users/juyoungjung/Downloads/ad/"+path , {encoding : "base64" , bytes : 102400 * 102400});
        var stream = fs.createReadStream("c:/zzz/ad/" + path, {encoding: "base64", bytes: 102400 * 102400});
        callback(stream);


    }




    return {
        // localLogRead: localLogRead,
        firebaseDownload: firebaseDownload,
        setAdNameRuleName: setAdNameRuleName,
        localWrite: localWrite,
        logWrite: logWrite,
        adFileImgRead: adFileImgRead,
        adVideoRead: adVideoRead,
    };
})();
module.exports = fileIO;
    









