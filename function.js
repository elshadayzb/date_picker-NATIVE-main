// Gregorian months day count
const MONTHSGREGDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
// Ethiopian months day count
const MONTHSETHDAYS = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5];

/***
 * Calendar Converter
 * This date converter implementation is based on:
 *      - Dr. Berhanu Beyene and Dr. Manfred Kudlek algorithm.
 *      - Date Algorithms by Peter Baum
 *
 ***/

/* Era Definitions */
const JD_EPOCH_OFFSET_AMETE_ALEM = -285019;
const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856;
const JD_EPOCH_OFFSET_UNSET = -1;

class CalendarConverter {
    _jdOffset = JD_EPOCH_OFFSET_UNSET;
    _year = -1;
    _month = -1;
    _day = -1;
    _dateIsUnset = true;
 
    constructor() {
        this.isAmeteMihret = true;
    }

    /* Utility Functions */
    _quotient(i, j){
        return Math.floor(i / j);
    }

    _mod(i, j){
        return i - j * Math.floor(i / j);
    }

    _isGregorianLeap(year){
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }

    _isEthiopicLeap(year){
        return ((year + 1) % 4 === 0 );
    }

    /* Era Functions */
    _setEra(era){
        if (JD_EPOCH_OFFSET_AMETE_ALEM === era || JD_EPOCH_OFFSET_AMETE_MIHRET === era) {
            this._jdOffset = era;
        } else {
            throw new Error("Unknown Era: " + era);
        }
    }
    _isEraSet(){
        return JD_EPOCH_OFFSET_UNSET === this._jdOffset ? false : true;
    }

    _unsetEra(){
        this._jdOffset = JD_EPOCH_OFFSET_UNSET;
    }

    #unset(){
        this._unsetEra();
        this._year = -1;
        this._month = -1;
        this._day = -1;
        this._dateIsUnset = true;
    }

    _isDateSet(){
        return (this._dateIsUnset) ? false : true ;
    } 
    
    /* Conversion Methods To/From the Julian Day Number and Ethiopic and Gregorian Calendars */
    _guessEraFromJDN(jdn){
        return (jdn >= (JD_EPOCH_OFFSET_AMETE_MIHRET + 365))  ? JD_EPOCH_OFFSET_AMETE_MIHRET : JD_EPOCH_OFFSET_AMETE_ALEM;
    }

    //Computes the Julian day number of the given Ethiopic date
    //This method assumes that the JDN epoch offset has been set
    _ethiopicToJDN(year, month, day){
        const era = this._isEraSet() ? this._jdOffset : JD_EPOCH_OFFSET_AMETE_MIHRET;
        const jdn = (era + 365) + 
                    365 * (year - 1) + 
                    this._quotient(year, 4) + 
                    30 * month +
                    day - 31;

        return jdn;
    } 

    //Computes the Ethiopic date from the given Julian day number
    _jdnToEthiopic(jdn, era){
        const r = this._mod((jdn - era), 1461) ;
        const n = this._mod(r, 365) + 365 * this._quotient(r, 1460) ; 

        const year = 4 * this._quotient((jdn - era), 1461) + 
                    this._quotient(r, 365) -
                    this._quotient(r, 1460);
        const month = this._quotient(n, 30) + 1;
        const day = this._mod(n, 30) + 1 ;
            
        return [year, month, day];
    } 

    _jdnToEthiopicSetEra(jdn){
        const era = this._isEraSet() ? this._jdOffset : this._guessEraFromJDN(jdn);
        return this._jdnToEthiopic(jdn, era);
    }

    //Computes the Julian day number of the given Gregorian date.  
    _gregorianToJDN(year, month, day){
        let y = year;
        let m = month;
        
        if(month < 3){
            y -= 1;
            m += 12;
        }
 
        const jdn = day + 
                    parseInt(`${(153 * m - 457) / 5}`) + 
                    365 * y + 
                    Math.floor(y / 4)- 
                    Math.floor(y / 100) + 
                    Math.floor(y / 400) + 
                    1721119; // takes the ceil for 1721118.5
        return jdn;
    }

    //Computes the Gregorian Date from a given Julian Day Number
    _jdnToGregorian(jdn){
        const z = Math.floor(jdn - 1721118.5);
        const r = jdn - 1721118.5 - z;
        const g = z - .25;
        const a = Math.floor(g / 36524.25);
        const b = a - Math.floor(a / 4);
        let year = Math.floor((b + g) / 365.25);
        const c = b + z - Math.floor(365.25 * year);
        let month = parseInt(`${((5 * c + 456) / 153)}`);
        const day = parseInt(`${c - parseInt(`${(153 * month - 457) / 5}`) + r}`);
        if (month > 12){
            year = year + 1;
            month = month - 12;
        }
        
        return [year, month, day];
    }

    /* Conversion Methods To/From the Ethiopic and Gregorian Calendars */  

    _ethiopicToGregorian(year, month, day){
        if (!this._isEraSet()) {
            if (year <= 0) {
                this._setEra(JD_EPOCH_OFFSET_AMETE_ALEM);
            }
            else {
                this._setEra(JD_EPOCH_OFFSET_AMETE_MIHRET);
            }
        }
        const jdn = this._ethiopicToJDN(year, month, day);
        return this._jdnToGregorian(jdn);
    } 

    _ethiopicToGregorianWithEra(year, month, day, era){
        this._setEra(era);
        const date = this._ethiopicToGregorian(year, month, day);
        this._unsetEra();
        return date;
    } 

    _gregorianToEthiopic(year, month, day){
        const jdn = this._gregorianToJDN(year, month, day);
        return this._jdnToEthiopic(jdn, this._guessEraFromJDN(jdn));
    } 

    /* Gregorian to/from Ethiopian Date Conversion APIs */

    // takes Ethiopian date and returns an equivalent Gregorian date
    convertToGC(year, month, day){
        if(day < 0 || day > 30 || month < 0 || month > 13){
            throw new Error("Invalid Ethiopian Date.");
        }
        if((day > 5 && month === 13) && !(this._isEthiopicLeap(year))){
            throw new Error("The year is not a leap year")
        }
        const gregDate = this._ethiopicToGregorian(year, month, day);
        return {year: gregDate[0], month: gregDate[1], day: gregDate[2]};
    }

    // takes Gregorian date and returns an equivalent Ethiopian date
    convertToEC(year, month, day){
        if(day < 0 || day > 31 || month < 0 || month > 12){
            throw new Error("Invalid Gregorian Date.");
        }
        if((day > 28 && month === 2) && !(this._isGregorianLeap(year))){
            throw new Error("The year is not a leap year")
        }
        const etDate = this._gregorianToEthiopic(year, month, day);
        return {year: etDate[0], month: etDate[1], day: etDate[2]}
    }

    // get the index of the week day for a given Ethiopian Date
    getETWeekDay(year, month, day){
        const gregDate = this.convertToGC(year, month, day);
        const gregDateMod = new Date(gregDate.year, gregDate.month - 1, gregDate.day);
        gregDateMod.setFullYear(gregDate.year);
        const weekDay = gregDateMod.getDay();
        return weekDay;
    }

    // get the index of the week day where an Ethiopic month starts
    getETMonthStartDay(year, month){
        const gregDate = this.convertToGC(year, month, 1);
        const gregDateMod = new Date(gregDate.year, gregDate.month - 1, gregDate.day);
        gregDateMod.setFullYear(gregDate.year);
        const weekDay = gregDateMod.getDay();
        return weekDay;
    }  
    // get today in Ethiopic according to the timezone and localtime
    getETToday(){
        const gregToday = new Date(); // get today in gregorian
        const etLocalTime = new Date(gregToday.getTime() + ((-3 + (gregToday.getTimezoneOffset()/60)) * 3600000));
        const etToday = this.convertToEC(etLocalTime.getFullYear(), etLocalTime.getMonth() + 1, etLocalTime.getDate());
        return {...etToday, weekDay: etLocalTime.getDay(), hour: etLocalTime.getHours(), minute: etLocalTime.getMinutes()};
    }
    // adds an offset to the given date
    setDate(year, month, day, offset){
        const inputJdn = this._ethiopicToJDN(year, month, day) + offset;
        const outputDate = this._jdnToEthiopic(inputJdn, this._guessEraFromJDN(inputJdn));
        return outputDate;
    }
    // compare dates and return -1, 0, 1
    compareETDates(date1, date2 = this.getETToday()){
        console.log("Date 1: ", date1, " Date 2: ", date2);
        const convertedDate1 = this.convertToGC(date1.year, date1.month, date1.day);
        const convertedDate2 = this.convertToGC(date2.year, date2.month, date2.day);
        const time1 = new Date(convertedDate1.year, convertedDate1.month, convertedDate1.day).getTime();
        const time2 = new Date(convertedDate2.year, convertedDate2.month, convertedDate1.day).getTime();
        if(time1 > time2){
            return 1;
        }else if(time1 < time2){
            return -1;
        }else{
            return 0;
        }
    }

}



function ETDateConverter(gregYear , gregMonth , gregDay)
{
        const converter = new CalendarConverter();

        return converter.convertToEC(gregYear,gregMonth,gregDay);
}

function GRDateConverter(ethioYear , ethioMonth , ethioDay)
{
        const converter = new CalendarConverter();

        return converter.convertToGC(ethioYear,ethioMonth,ethioDay);
}