import jwt_decode from "jwt-decode";
import moment from "moment";

const colors = ['#00AA55', '#e91e63', '#9c27b0', '#939393', '#E3BC00', '#D47500', '#DC2A2A', '#2196f3', '#00bcd4', '#ff9800', '#607d8b'];

let utilFunctions = {

    getCharColor: function (text) {
        return colors[this.numberFromText(text) % colors.length]
    },

    numberFromText: function (text) {
        let charCodes = text
            .split('') // => ["A", "A"]
            .map(char => char.charCodeAt(0)) // => [65, 65]
            .join(''); // => "6565"
        return parseInt(charCodes, 10);
    },

    buildTree: function (parts, treeNode, name, type, file) {
        if (parts.length === 0) {
            return;
        }
        for (var i = 0; i < treeNode.length; i++) {
            if (parts[0] === treeNode[i].text) {
                this.buildTree(parts.splice(1, parts.length), treeNode[i].children, name, type, file);
                return;
            }
        }
        var newNode = {'text': parts[0], 'children': []};
        if (parts[0].endsWith(".pdf")) {
            newNode.name = name;
            newNode.type = type;
            newNode.file = file;
        }
        treeNode.push(newNode);
        this.buildTree(parts.splice(1, parts.length), newNode.children, name, type, file);
    },

    getUID() {
        return Math.random().toString(36).substring(2, 15) + '-' +
            Math.random().toString(36).substring(2, 15) + '-' +
            Math.random().toString(36).substring(2, 15) + '-' +
            Math.random().toString(36).substring(2, 15);
    },

    formatDuration(duration) {
        let hour = duration.split(".")[0];
        let formatedHour = parseInt(hour) < 10 ? "0" + hour + "h" : hour + "h"
        let minutePercent = duration.split(".")[1] || "0";
        let nbMinutes = parseFloat("0." + minutePercent) * 60;
        //console.log(formatedHour.concat(parseInt(nbMinutes) < 10 ? "0" : "").concat(nbMinutes.toString()))

        return formatedHour.concat(parseInt(nbMinutes) < 10 ? "0" : "").concat(parseInt(nbMinutes.toString()));
    },

    durationToNumber(duration) {
        let hourValue = duration.split("h")[0]
        let minuteValue = duration.split("h")[1]
        let hourFormated = parseInt(hourValue) || 0
        let minuteFormated = parseInt(minuteValue) || 0
        return hourFormated + (minuteFormated / 60)
    },

    alphaSort(item1, item2, by) {
        const a = item1[by].toLowerCase();
        const b = item2[by].toLowerCase();

        if (a > b) {
            return 1;
        }

        if (b > a) {
            return -1;
        }

        return 0;
    },


    verif_session() {
        try {
            var decoded = jwt_decode(localStorage.getItem("usrtoken"));
            //console.log(decoded)
            return !(localStorage.getItem("usrtoken") === null || localStorage.getItem("usrtoken") === undefined || moment(localStorage.getItem("exp")) < moment() ||
                decoded.payload === null || decoded.payload === undefined || decoded.payload.id !== localStorage.getItem("id"));
        } catch (err) {
            //console.log(err)
            return false
        }

    },

    countryToFlag(isoCode) {
        return typeof String.fromCodePoint !== 'undefined'
            ? isoCode
                .toUpperCase()
                .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
            : isoCode;
    },

    getAge(date_naiss){
        let date = moment(date_naiss, 'YYYY-MM-DD')
        let years = moment().diff(date, 'years')
        let months = moment().diff(date.add(years, 'years'), 'months', false)
        if(months > 0){
            return years + " ans et " + months + " mois"
        }else{
            return years + " ans"
        }
    }
}


export default utilFunctions;
