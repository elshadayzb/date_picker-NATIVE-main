// Gregorian months day count
const MONTHSGREGDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
// Ethiopian months day count
const MONTHSETHDAYS = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5];

// text strings used in English or Amharic or Oromifa
const TEXTS = [
    {
      language: "English",
      amharic: "Amharic",
      oromifa: "Oromiffa",
      calendar: "Gregorian",
      gregorian: "Gregorian",
      ethiopian: "Ethiopian",
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      weekdays_long: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      months_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      day_index_titles: ['First', 'Second', 'Third', 'Fourth', 'Last'],
      today: "Today",
      day: "Day",
      week: "Week",
      month: "Month",
      year: "Year",
      schedule: "Schedule",
      view_options: ["Day", "Week", "Month", "Year", "Schedule"],
      
    }, 
    {
      language: "አማርኛ",
      amharic: "አማርኛ",
      oromifa: "ኦሮምኛ",
      calendar: "ኢትዮጵያ",
      gregorian: "Gregorian",
      ethiopian: "ኢትዮጵያ",
      weekdays: ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሃሙስ", "አርብ", "ቅዳሜ"],
      weekdays_long: ["እሁድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሃሙስ", "አርብ", "ቅዳሜ"],
      months: ["መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሃምሌ", "ነሀሴ", "ጳጉሜ"],
      months_short: ["መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሃምሌ", "ነሀሴ", "ጳጉሜ"],
      day_index_titles: ['የመጀመሪያው', 'ሁለተኛው', 'ሶስተኛው', 'አራተኛው', 'የመጨረሻው'],
      today: "ዛሬ",
      day: "ቀን",
      week: "ሳምንት",
      month: "ወር",
      year: "አመት",
      schedule: "መርሃ ግብር",
      view_options: ["ቀን", "ሳምንት", "ወር", "አመት","መርሃ ግብር"],
      
    },
    {
      language: "Oromiffa",
      amharic: "Amharic",
      oromifa: "Oromiffa",
      calendar: "Itoophiyaa",
      gregorian: "Gregorian",
      ethiopian: "Itoophiyaa",
      weekdays: ["Dilb", "Wiix", "Kibx", "Roob", "Kami", "Jima", "Xiqa"],
      weekdays_long: ["Dilbata", "Wiixata", "Kibxata", "Roobi", "Kamisa", "Jimaata", "Xiqaa"],
      months: ["Fulbaana", "Onkololessa", "Sadaasa", "Mudde", "Amajjii", "Guraandhala", "Hiriiruu", "Ebila", "Caamsaa", "Waxabajjii", "Adoolessa", "Hagayya", "Pagume"],
      months_short: ["Fulb", "Onko", "Sada", "Mudd", "Amaj", "Gura", "Hiri", "Ebil", "Caam", "Waxa", "Adoo", "Haga", "Pagu"],
      day_index_titles: ['Issa Tokkoffaa', 'Lamaffaa', 'Sadeeffaa', 'Afraffaa', 'Isaa Xumuraa'],
      today: "Har'a",
      day: "Guyaa",
      week: "Torban",
      month: "Ji'a",
      year: "Wagga",
      schedule: "Sagantaa",
      view_options: ["Guyaa", "Torban", "Ji'a", "Wagga","Sagantaa"],
      
    },
  ]


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
}

function toTime(date)
{
    if( Object.keys(date).length > 0 && ( typeof(date.year) === "number"  && typeof(date.month) === "number"  && typeof(date.day) === "number" )  && (date.year >= 0 && date.month >= 0 && date.day >= 0) )
    {
            const dateObj = new Date(date.year , date.month , date.day);
            console.log("the time " , dateObj);
            return dateObj.getTime();   
    }
   return -1;
}



// compare date1 and date2 for gregorian and ethiopian
function compareDates(day ,month, year , isGregorian , minDate , maxDate){
   
    if(!minDate.hasValue && !maxDate.hasValue){
        console.log("Case 1: day"  , day,  "\nmonth: ", month, "\nyear" , year , "\nisGregorian: ", isGregorian, " \nminDate: ", minDate, " \nmaxDate: ", maxDate);
        return true;
    } else if(minDate.hasValue && maxDate.hasValue){
        console.log("Case 2: day"  , day,  "\nmonth: ", month, "\nyear" , year , "\nisGregorian: ", isGregorian, " \nminDate: ", minDate, " \nmaxDate: ", maxDate);
        return isGregorian && (toTime(minDate.gregDate) <= toTime({year : year , month : month , day : day})) && (toTime(maxDate.gregDate) >= toTime({year : year , month : month , day : day}))  ? 
                    true : 
                    !isGregorian && (toTime(minDate.ethDate) <= toTime({year : year , month : month , day : day})) && (toTime(maxDate.ethDate) >= toTime({year : year , month : month , day : day})) ?
                        true : false;

        /* if(isGregorian && (month < maxDate.gregDate.month && month > minDate.gregDate.month)){
            return true;
        }else if(!isGregorian && (month < maxDate.ethDate.month && month > maxDate.ethDate.month)){
            return true;
        }
        return false; */
    } else if (minDate.hasValue){
        console.log("Case 3: day"  , day,  "\nmonth: ", month, "\nyear" , year , "\nisGregorian: ", isGregorian, " \nminDate: ", minDate, " \nmaxDate: ", maxDate);
        return isGregorian && (toTime(minDate.gregDate) <= toTime({year : year , month : month , day : day}))  ? 
                    true :
                    !isGregorian && (toTime(minDate.ethDate) <= toTime({year : year , month : month , day : day})) ?
                        true : false;
    } else if(maxDate.hasValue){
        console.log("Case 4: day"  , day,  "\nmonth: ", month, "\nyear" , year , "\nisGregorian: ", isGregorian, " \nminDate: ", minDate, " \nmaxDate: ", maxDate);
        return isGregorian && (toTime(maxDate.gregDate) >= toTime({year : year , month : month , day : day}))  ?
                    true :
                    !isGregorian && (toTime(maxDate.ethDate) >= toTime({year : year , month : month , day : day}))  ?
                        true : false;
    }




}

// compare month1 and month2
function compareMonths(month, year , isGregorian , minDate , maxDate){

    if(!minDate.hasValue && !maxDate.hasValue){
        console.log("Case 1: month: ", month, "\nyear" , year , "\nisGregorian: ", isGregorian, " \nminDate: ", minDate, " \nmaxDate: ", maxDate);
        return true;
    } else if(minDate.hasValue && maxDate.hasValue){
        console.log("Case 2: month: ", month, "\nyear" , year , "\nisGregorian: ", isGregorian, " \nminDate: ", minDate, " \nmaxDate: ", maxDate);
        return isGregorian && (toTime(minDate.gregDate) <= toTime({year : year , month : month , day : 1})) && (toTime(maxDate.gregDate) >= toTime({year : year , month : month , day : 1}))  ? 
                    true : 
                    !isGregorian && (toTime(minDate.ethDate) <= toTime({year : year , month : month , day : 1})) && (toTime(maxDate.ethDate) >= toTime({year : year , month : month , day : 1})) ?
                        true : false;

        /* if(isGregorian && (month < maxDate.gregDate.month && month > minDate.gregDate.month)){
            return true;
        }else if(!isGregorian && (month < maxDate.ethDate.month && month > maxDate.ethDate.month)){
            return true;
        }
        return false; */
    } else if (minDate.hasValue){
        console.log("Case 3: month: ", month, "\nyear" , year , "\nisGregorian: ", isGregorian, " \nminDate: ", minDate, " \nmaxDate: ", maxDate);
        return isGregorian && (toTime(minDate.gregDate) <= toTime({year : year , month : month , day : 1}))  ? 
                    true :
                    !isGregorian && (toTime(minDate.ethDate) <= toTime({year : year , month : month , day : 1})) ?
                        true : false;
    } else if(maxDate.hasValue){
        console.log("Case 4: month: ", month, "\nyear" , year , "\nisGregorian: ", isGregorian, " \nminDate: ", minDate, " \nmaxDate: ", maxDate);
        return isGregorian && (toTime(maxDate.gregDate) >= toTime({year : year , month : month , day : 1}))  ?
                    true :
                    !isGregorian && (toTime(maxDate.ethDate) >= toTime({year : year , month : month , day : 1}))  ?
                        true : false;
    }

}

// compare year1 and year2
function compareYears(year, isGregorian, minDate, maxDate){

    if(!minDate.hasValue && !maxDate.hasValue){
        console.log("Case 1: Year: ", year, " isGregorian: ", isGregorian, " \nminDate: ", minDate, " \nmaxDate: ", maxDate);
        return true;
    } else if(minDate.hasValue && maxDate.hasValue){
        console.log("Case 2: Year: ", year, " isGregorian: ", isGregorian, " \nminDate: ", minDate, " \nmaxDate: ", maxDate);
        return isGregorian && (year <= maxDate.gregDate.year && year >= minDate.gregDate.year) ? 
                    true : 
                    !isGregorian && (year <= maxDate.ethDate.year && year >= minDate.ethDate.year) ?
                        true : false;
            
        /* if(isGregorian && (year < maxDate.gregDate.year && year > minDate.gregDate.year)){
            return true;
        }else if(!isGregorian && (year < maxDate.ethDate.year && year > maxDate.ethDate.year)){
            return true;
        }
        return false; */
    } else if (minDate.hasValue){
        console.log("Case 3: Year: ", year, " isGregorian: ", isGregorian, " \nminDate: ", minDate, " \nmaxDate: ", maxDate);
        return isGregorian && year >= minDate.gregDate.year ?
                    true :
                    !isGregorian && year >= minDate.ethDate.year ?
                        true : false;
    } else if(maxDate.hasValue){
        console.log("Case 4: Year: ", year, " isGregorian: ", isGregorian, " \nminDate: ", minDate, " \nmaxDate: ", maxDate);
        return isGregorian && year <= maxDate.gregDate.year ?
                    true :
                    !isGregorian && year <= maxDate.ethDate.year ?
                        true : false;
    }
}

// the calendar picker component
function calendarPicker(settings){

    this.settings = settings;
    const { defaultCalendar, showDatePicker, dateFormat, minDate, maxDate } = this.settings;
    this.onChangeCallback = this.settings.onChangeCallback;

    const initialCalendarState = defaultCalendar === "ET" ? false: true;
    const today = getToday(initialCalendarState); //gets today for the selected calendar
    const curDate = this.settings["selectedDate"] ? 
                        {...this.settings["selectedDate"], month: this.settings["selectedDate"].month - 1} : 
                        today; // gets the selectedDate

    let convDate;

    if(minDate && Object.keys(minDate).length > 0 && (minDate.year && minDate.month && minDate.day)){
        if(initialCalendarState){
            convDate = calendarConverter.convertToEC(minDate.year, minDate.month, minDate.day);
            this.minDate = {
                hasValue: true,
                ethDate: {...convDate, month: convDate.month - 1},
                gregDate: {...minDate, month: minDate.month - 1}
            }
        } else{
            convDate = calendarConverter.convertToGC(minDate.year, minDate.month, minDate.day);
            this.minDate = {
                hasValue: true,
                ethDate: {...minDate, month: minDate.month - 1},
                gregDate: {...convDate, month: convDate.month - 1}
            }
        }
    } else{
        this.minDate = { hasValue: false };
    }

    if(maxDate && Object.keys(maxDate).length > 0 && (maxDate.year && maxDate.month && maxDate.day)){
        if(initialCalendarState){
            convDate = calendarConverter.convertToEC(maxDate.year, maxDate.month, maxDate.day);
            this.maxDate = {
                hasValue: true,
                ethDate: {...convDate, month: convDate.month - 1},
                gregDate: {...maxDate, month: maxDate.month - 1}
            }
        } else{
            convDate = calendarConverter.convertToGC(maxDate.year, maxDate.month, maxDate.day);
            this.maxDate = {
                hasValue: true,
                ethDate: {...maxDate, month: maxDate.month - 1},
                gregDate: {...convDate, month: convDate.month - 1}
            }
        }
    } else{
        this.maxDate = { hasValue: false };
    }
    

    this.setState = (index,value)=>{
        this.state[index] = value;
    }


    this.state = {};

    this.calendarChangeHandler = () => {
        this.setState("isGregorian", !this.state.isGregorian);
        
        if(initialCalendarState === this.state.isGregorian){
            console.log("Initial Calendar State: ", initialCalendarState, 
                        " isGregorian: ", this.state.isGregorian, " selectedDate: ", this.settings["selectedDate"], " \nCurrent Date: ", curDate);
            this.setState("selectedDate", curDate);
        }else if(!this.settings["selectedDate"]){
            this.setState("selectedDate", getToday(this.state.isGregorian));        
        }else{
            let convertedDate;
            if(initialCalendarState){
                convertedDate = calendarConverter.convertToEC(this.state.selectedDate.year, this.state.selectedDate.month + 1, this.state.selectedDate.day);
                this.setState("selectedDate", {...convertedDate, month: convertedDate.month - 1});
            }else{
                convertedDate = calendarConverter.convertToGC(this.state.selectedDate.year, this.state.selectedDate.month + 1, this.state.selectedDate.day);
                this.setState("selectedDate", {...convertedDate, month: convertedDate.month - 1});
            }
        }
        
        //this.setState("selectedDate" , getToday(this.state.isGregorian));
        this.setState("today", getToday(this.state.isGregorian));
        this.setState("monthIndex" , this.state.selectedDate.month);
        this.setState("yearIndex" , this.state.selectedDate.year);
        this.setState("years" , getYears(this.state.yearIndex));
        this.setState("texts" , this.state.isGregorian ? TEXTS[0] : TEXTS[1]);
        
        this.setState("monthDays", this.state.isGregorian ? 
                getMonthDaysGreg(this.state.monthIndex, this.state.yearIndex) : 
                getMonthDaysEthiopic(this.state.monthIndex, this.state.yearIndex));
        
        this.renderPicker();
        
    }

    this.prevMonthHandler = () => {
        if(this.state.visiblePicker === 'MONTH'){
            this.setState("yearIndex",this.state.yearIndex - 1 );
            
        } else if(this.state.visiblePicker === 'YEAR'){
            this.setState("yearIndex", this.state.yearIndex - 20 );
            this.setState("years", getYears(this.state.yearIndex));
           
        } else{
            if(this.state.monthIndex === 0){
                // go to previous year's last month if the month is the 1st month
                this.setState("monthIndex",this.state.isGregorian ? 11 : 12);
                this.setState("yearIndex",this.state.yearIndex - 1 );
             } else{
                // go to previous month
                this.setState("monthIndex", this.state.monthIndex - 1);
             }
        }
        this.setState("monthDays", this.state.isGregorian ? 
                        getMonthDaysGreg(this.state.monthIndex, this.state.yearIndex) : 
                        getMonthDaysEthiopic(this.state.monthIndex, this.state.yearIndex));
        this.renderPicker();
        
    }

    this.nextMonthHandler = () => {

        if(this.state.visiblePicker === "MONTH"){
            this.setState("yearIndex",this.state.yearIndex + 1 );
        }else if (this.state.visiblePicker === "YEAR"){
           
            this.setState("yearIndex", this.state.yearIndex + 20 );
            this.setState("years", getYears(this.state.yearIndex));
            
        }else{
            if((this.state.isGregorian && this.state.monthIndex === 11) || 
                (!this.state.isGregorian && this.state.monthIndex === 12)){
                // go to next year's 1st month if the month is the last month
                this.setState("monthIndex",0);
                this.setState("yearIndex",this.state.yearIndex + 1 );
            } else{
                // go to next month
                this.setState("monthIndex", this.state.monthIndex + 1);
            }
        }

        this.setState("monthDays", this.state.isGregorian ? 
                                        getMonthDaysGreg(this.state.monthIndex, this.state.yearIndex) : 
                                        getMonthDaysEthiopic(this.state.monthIndex, this.state.yearIndex));


        
        this.renderPicker();
    }

    this.destroy = () => {
        this.setState("showPicker", false);
        this.renderPicker();

    }

    this.onDateSelected = (day) => {

        const gregorianDate = this.state.isGregorian ? 
                                {day: day.day, month: day.month + 1 , year: day.year} :
                                calendarConverter.convertToGC(day.year, day.month + 1, day.day);
        const ethDateObj = calendarConverter.convertToEC(gregorianDate.year, gregorianDate.month, gregorianDate.day);
        const gregDateStr = `${gregorianDate.day > 9 ? '' : '0'}${gregorianDate.day}-${gregorianDate.month > 9 ? '' : '0'}${gregorianDate.month}-${gregorianDate.year}`;
        const ethDateStr = `${ethDateObj.day > 9 ? '' : '0'}${ethDateObj.day}-${ethDateObj.month > 9 ? '' : '0'}${ethDateObj.month}-${ethDateObj.year}`;
    
       /*  console.log("Output: ", {
            "ET": {ethDateObj, ethDateStr},
            "GR": {gregDateObj: gregorianDate, gregDateStr}
        });
        */

        this.onChangeCallback({
            "ET": {ethDateObj, ethDateStr},
            "GR": {gregDateObj: gregorianDate, gregDateStr}
        }) 
        this.destroy();
    }

    this.onMonthSelected = (month) => {
        this.setState("monthIndex",month);
        this.setState("visiblePicker","DATE");
        this.setState("monthDays", this.state.isGregorian ? 
        getMonthDaysGreg(this.state.monthIndex, this.state.yearIndex) : 
        getMonthDaysEthiopic(this.state.monthIndex, this.state.yearIndex));
        this.renderPicker();
    }

    this.onYearSelected = (year) => {
        this.setState("yearIndex",year);
        this.setState("visiblePicker","MONTH");
        this.renderPicker();
    }

    this.onTodaySelected = () => {
        this.setState("monthIndex" , this.state.today.month);
        this.setState("yearIndex" , this.state.today.year);
        this.setState("years" , getYears(this.state.today.year));
        
        this.setState("monthDays", this.state.isGregorian ? 
                    getMonthDaysGreg(this.state.today.month, this.state.today.year) : 
                    getMonthDaysEthiopic(this.state.today.month, this.state.today.year));
    
        this.renderPicker();
    }

    this.renderPicker = () =>{
    
        let pickerComponent;
        if(this.state.visiblePicker === "MONTH"){
            pickerComponent = monthPicker(this.state.texts["months_short"], this.state.yearIndex , this.state.isGregorian, this.minDate, this.maxDate );
           
        }else if(this.state.visiblePicker === "YEAR"){
            //console.log("Min date: ", this.minDate, "\nMax date: ", this.maxDate);
            pickerComponent = yearPicker(this.state.years, this.state.isGregorian, this.minDate, this.maxDate);
        }else {
            pickerComponent = datePicker(this.state.monthIndex, this.state.monthDays, this.state.selectedDate, this.state.today, this.state.texts["weekdays"],this.minDate, this.maxDate , this.state.isGregorian);
        }

        if(this.dateSelectorInput.parentElement.lastChild)
        this.dateSelectorInput.parentElement.removeChild(this.dateSelectorInput.parentElement.lastChild); 


        const pickerDiv = document.createElement('div');
        pickerDiv.innerHTML = pickerContainer(pickerComponent, 
                                              this.state.visiblePicker, 
                                              this.state.texts["today"], 
                                              this.state.yearIndex,
                                              this.state.monthIndex,
                                              this.state.monthDays,
                                              this.state.texts["months"][this.state.monthIndex], 
                                              this.state.isGregorian, 
                                              this.state.showPicker,
                                              this.minDate,
                                              this.maxDate,
                                              this.state.years
                                            );
    
        this.dateSelectorInput.parentElement.appendChild(pickerDiv);

        document.querySelectorAll('#btnmonthnext').forEach(elm => elm.onclick = this.nextMonthHandler);
        document.querySelectorAll('#btnmonthprev').forEach(elm => elm.onclick = this.prevMonthHandler); 
       
        if(this.state.visiblePicker === "DATE")
        {
            document.querySelectorAll('#activemonth').forEach(elm => elm.onclick = () => { this.setState("visiblePicker","MONTH"); this.renderPicker(); } ) 
            document.querySelectorAll('#activeyear').forEach(elm => elm.onclick = () => { this.setState("visiblePicker","YEAR"); this.renderPicker(); } ); 

            document.getElementById("todayBtn").onclick = this.onTodaySelected;

            document.querySelectorAll('#calendar-type-switcher').forEach(elm => elm.onchange = this.calendarChangeHandler) 
            
            this.dateSelectorInput.parentElement.querySelectorAll(".day-of-month").forEach((elm) => {
                const data = elm.getAttribute('data-selected-date');
                elm.onclick = this.onDateSelected.bind(this, JSON.parse(atob(data)));
            })
        }
        else if(this.state.visiblePicker === "YEAR")
        {
            this.dateSelectorInput.parentElement.querySelectorAll(".year-generated").forEach((elm) => {
                const data = elm.getAttribute('data-selected-year');
                elm.onclick = this.onYearSelected.bind(this, parseInt(atob(data)));
            })
        }
        else if(this.state.visiblePicker === "MONTH")
        {
            document.querySelectorAll('#activeyear').forEach(elm => elm.onclick = () => { this.setState("visiblePicker","YEAR"); this.renderPicker(); } ) 

            this.dateSelectorInput.parentElement.querySelectorAll(".month-of-year").forEach((elm) => {
                const data = elm.getAttribute('data-selected-month');
                elm.onclick = this.onMonthSelected.bind(this, parseInt(atob(data)));
            })
        }

       
        return;
    }

    this.init = () => {
        this.dateSelectorInput = document.getElementById(this.settings.selector);
        if(!this.dateSelectorInput){
            return;
        }

        //console.log("Min date: ", this.minDate, "\nMax date: ", this.maxDate);

        this.dateSelectorInput.onclick = ()=>{

            this.dateSelectorInput.parentElement.tabIndex = 6;
            this.dateSelectorInput.parentElement.focus();
            
            this.setState("isGregorian", initialCalendarState);

            this.setState("selectedDate" , curDate);
            this.setState("today" , today);
            this.setState("monthIndex" , curDate.month);
            this.setState("yearIndex" , curDate.year);
            this.setState("years" , getYears(curDate.year));
            this.setState("texts" , initialCalendarState ? TEXTS[0] : TEXTS[1]);
            
            this.setState("monthDays", initialCalendarState ? 
                        getMonthDaysGreg(curDate.month, curDate.year) : 
                        getMonthDaysEthiopic(curDate.month, curDate.year));
            this.setState("visiblePicker","DATE");

            if(this.state.showPicker){
                this.setState("showPicker", !this.state.showPicker);
            } else{
                this.state.showPicker = showDatePicker;
            }
        
            this.renderPicker();
        }

        this.dateSelectorInput.parentElement.onblur = (e) => {

            

            if(e.relatedTarget?.getAttribute("data-isof-calendar") === "1")
            {
                this.dateSelectorInput.parentElement.focus();
                return
            } 
            this.setState("showPicker",false);
            this.renderPicker(); 
            
        }

    }
   
    return;
}




// the date picker component
function datePicker(monthIndex, monthDays, selectedDate, today, weekdays , minDate, maxDate , isGregorian){
    return `
        <div data-isof-calendar="1"  tabIndex="-1888" class="row  d-flex align-items-center flex-row justify-content-around px-0 p-0p2 f-1p6" >
            ${weekdays.map((day, weekidx) => {
                return `
                <div data-isof-calendar="1"  tabIndex="-1888" class="col-1 d-flex flex-row  justify-content-around">
                    <p data-isof-calendar="1"  tabIndex="-1888" class="my-0 p-0 f-06 " >
                        ${day[0]}
                    </p>
                </div>`
                
            }).join('')}
        </div>
         <div data-isof-calendar="1"  tabIndex="-1888" class="row d-flex flex-column justify-content-between f-1p6">
          ${monthDays.map((week, weekidx) => {
            return `
            <div data-isof-calendar="1"  tabIndex="-1888" class="d-flex flex-row justify-content-center px-0 pt-1" id="datePickerParent" >
                ${week.map((day, dayidx) => {
                  const isToday = day.day === today.day && day.month === today.month && day.year === today.year;
                  const isSelected = day.day === selectedDate.day && day.month === selectedDate.month && day.year === selectedDate.year;
                  return `
                    <div data-isof-calendar="1"  tabIndex="-1888" class="col f-05 d-flex flex-row   justify-content-center">
                      <button
                        id=${weekidx}${dayidx}
                        data-selected-date=${btoa(JSON.stringify(day))}
                        data-isof-calendar="1"  tabIndex="-1888"
                        class="day-of-month border-0 text-center"
                        onmouseenter="this.style.backgroundColor='#e8eaed'"
                        onmouseleave="this.style.backgroundColor='#fff'"
                        style="font-size: inherit;
                                    font-family: inherit;
                                    font-weight: inherit;
                                    text-transform: none;
                                    color: ${isToday ? "hsl(0, 0%, 96%)" : isSelected ? "hsl(214, 82%, 51%)" : (day.month === monthIndex) ? "inherit" : "hsl(240, 4%, 60%)"};
                                    background-color: ${isToday ? "hsl(214, 82%, 51%)" : isSelected ? "hsl(216, 88%, 91%)" : "#fff"} ;
                                    padding: ${day.day >= 10 ? "0.2em 0.42em" : "0.2em 0.68em"}; 
                                    border-radius: 50%;
                                    min-height: 0.8em;
                                    min-width: 0.8em;
                                    "
                        ${compareDates(day.day,day.month,day.year, isGregorian, minDate, maxDate) ? "" : "disabled"}
                      >
                        ${day.day}
                      </button>
                    </div>`
                  
                }).join('')}
              </div>`
            
          }).join('')}
        </div>
       
    `
}

function pickerContainer(childComponent, pickerType, today, year , month , monthDays ,  monthName , isGregorian , showPicker, minDate, maxDate, years )
{

    return `
            <div data-isof-calendar="1"  tabIndex="-1888" class="calendarPicakerMain container f-2 position-absolute mb-3"  
                    style="display:${showPicker ? 'flex' : 'none' };
                    left: 0;
                    z-index: 15;
                    min-height:280px;
                    color : black;
                    min-width:280px;
                    max-height:280px;
                    max-width:280px;
                    background-color: whitesmoke"
            >
                    <div data-isof-calendar="1"  tabIndex="-1888" id="calendarParent" class=" vstack d-flex flex-column justify-content-start f-05 "> 
                  ${
                        pickerType === "DATE" ? 
                        `    
                            <div class="d-flex justify-content-between align-items-center p-0">
                                <button 
                                    data-isof-calendar="1"  
                                    tabIndex="-1888" class="btn btn-outline-primary py-0 border-0 px-2"
                                    id="todayBtn"
                                >
                                    ${today}
                                </button>

                                <div data-isof-calendar="1"  tabIndex="-1888" id="calendarLocalization" class="p-0 d-flex justify-content-end align-items-center my-1 pt-2">
                                    <span data-isof-calendar="1"  tabIndex="-1888" className="p-0  m-0 f-07" > EN </span>
                                    <div data-isof-calendar="1"  tabIndex="-1888" class="form-check form-switch align ms-2 my-0">
                                        <input data-isof-calendar="1"  tabIndex="-1888" class="form-check-input" type="checkbox" role="switch" id="calendar-type-switcher" ${isGregorian ? ''  : 'checked'}>
                                    </div>
                                    <span data-isof-calendar="1"  tabIndex="-1888"  className="p-0 my-0 f-07"> ኢት </span>
                                </div>
                            </div>                            
                        ` : ``
                   }
                  ${
                        pickerType === "DATE" ?
                        `
                            <div data-isof-calendar="1"  tabIndex="-1888" id="monthsListController" class="f-1p3  d-flex  justify-content-between align-content-end p-0 m-0">
                                <span data-isof-calendar="1"  tabIndex="-1888" className="p-0 py-2 m-0 ">
                                    
                                    <span data-isof-calendar="1"  tabIndex="-1888" id="activemonth" class="">
                                        ${monthName}
                                    </span>
                                    <span data-isof-calendar="1"  tabIndex="-1888" id="activeyear" class="ms-2">
                                        ${year}
                                    </span>
                                </span>
                                <div data-isof-calendar="1"  tabIndex="-1888" id="monthSwitcher" class="f-09 ">
                                    <button
                                        data-isof-calendar="1"  tabIndex="-1888"
                                        id="btnmonthprev"
                                        class="border-0 m-0 p-0 me-3"
                                        ${compareDates(monthDays[0][0].day,month,year, isGregorian, minDate, {}) ? "" : "disabled"}
                                    >
                                    <i data-isof-calendar="1"  tabIndex="-1888" class=" bi bi-chevron-left " >
                                    </i>
                                    </button>
                                    <button
                                        data-isof-calendar="1"  tabIndex="-1888"
                                        id="btnmonthnext"
                                        class="border-0 m-0 p-0 me-1"
                                        ${compareDates(monthDays[5][6].day,month,year, isGregorian, {},maxDate) ? "" : "disabled"}
                                    >
                                    <i data-isof-calendar="1"  tabIndex="-1888" class=" bi bi-chevron-right" >
                                    </i>
                                    </button>
                                </div>  
                            </div>
                        `:
                        pickerType === "MONTH" ?
                        `
                        <div  data-isof-calendar="1"  tabIndex="-1888" id="monthsListController" class="f-1p3  d-flex  justify-content-between align-content-end p-0  mt-3">
                            <span data-isof-calendar="1"  tabIndex="-1888" className="p-0 py-2 m-0 ">
                                <span data-isof-calendar="1"  tabIndex="-1888" id="activeyear" class="ms-2">
                                    ${year}
                                </span>
                            </span>
                            <div data-isof-calendar="1"  tabIndex="-1888" id="monthSwitcher" class="f-09 ">
                                <button
                                    data-isof-calendar="1"  tabIndex="-1888"
                                    id="btnmonthprev"
                                    class="border-0 m-0 p-0 me-3"
                                    ${compareMonths(0,year, isGregorian, minDate, {}) ? "" : "disabled"}
                                    
                                >
                                    <i  data-isof-calendar="1"  tabIndex="-1888" class=" bi bi-chevron-left " >
                                    </i>
                                </button>
                                <button data-isof-calendar="1"  tabIndex="-1888"
                                    id="btnmonthnext"
                                    class="border-0 m-0 p-0 me-1"
                                    ${compareMonths(isGregorian ? 11 : 12 ,year , isGregorian, {} , maxDate) ? "" : "disabled"}
                                >
                                    <i  data-isof-calendar="1"  tabIndex="-1888" class=" bi bi-chevron-right" >
                                    </i>
                                </button>
                            </div>  
                           
                        </div>
                        `
                        :
                        `
                        <div data-isof-calendar="1"  tabIndex="-1888" id="monthsListController" class="f-08 d-flex  justify-content-between align-content-end d-flex  ">
                            <div  data-isof-calendar="1"  tabIndex="-1888" id="monthSwitcher" class="container  d-flex justify-content-between f-1p3 mt-3" >
                                <button data-isof-calendar="1"  tabIndex="-1888"
                                    id="btnmonthprev"
                                    class="col-1 border-0 m-0 p-0 me-3" 
                                    ${compareYears(years[0], isGregorian, minDate, {}) ? "" : "disabled"}
                                    
                                >
                                <i data-isof-calendar="1"  tabIndex="-1888"  class="f-1p3 bi bi-chevron-left " >
                                </i>
                                </button>
                                <button data-isof-calendar="1"  tabIndex="-1888"
                                    id="btnmonthnext"
                                    class="col-1 border-0 m-0 p-0 me-3"
                                    ${compareYears(years[19], isGregorian, {}, maxDate) ? "" : "disabled"}
                                >
                                <i  data-isof-calendar="1"  tabIndex="-1888" class="f-1p3 bi bi-chevron-right" >
                                </i>
                                </button>
                            </div>  
                        </div>`
                  }

                      ${childComponent}
                       
                    </div>

                    

            </div>`
}


// the month picker component
function monthPicker(months,year ,isGregorian, minDate, maxDate){

    return `
            <div class="f-1 row row-cols-3  g-1 mt-1 data-isof-calendar="1"  tabIndex="-1888"">${
                months.map((month,monthIdx) => {
                    return `
                        <span  data-isof-calendar="1"  tabIndex="-1888" class="col d-flex justify-content-center mt-1">
                                <button data-isof-calendar="1"  tabIndex="-1888" data-selected-month=${btoa(monthIdx)}
                                        class="month-of-year btn my-0 p-1 border-0"
                                        style="font-size: inherit;
                                        font-family: inherit;
                                        font-weight: inherit;
                                        text-transform: none;
                                        border-radius: 10%;
                                        min-height: 4ch;
                                        min-width: 8ch;
                                        "
                                        ${compareMonths(monthIdx ,year , isGregorian, minDate , maxDate) ? "" : "disabled"}
                                        >
                                ${month}
                                </button>
                        </span>`  
                }).join('')}
             </div>  
    `

}

// the year picker component
function yearPicker(years, isGregorian, minDate, maxDate){
    //console.log("Min date: ", minDate, "\nMax date: ", maxDate);

    return `
            <div data-isof-calendar="1"  tabIndex="-1888" class="row f-1 row-cols-4 d-flex align-items-between ">
                ${
                    years.map(year => {
                        return `
                            <span data-isof-calendar="1"  tabIndex="-1888" class="my-1 col d-flex justify-content-center">
                                <button data-isof-calendar="1"  tabIndex="-1888"
                                    data-selected-year ='${btoa(year)}'
                                    class="year-generated btn m-0 px-1 py-0 f-06 border-0"
                                    style="font-size: inherit;
                                    font-family: inherit;
                                    font-weight: inherit;
                                    text-transform: none;
                                    border-radius: 10%;
                                    min-height: 4ch;
                                    min-width: 8ch;"  
                                    ${compareYears(year, isGregorian, minDate, maxDate)? "" : "disabled"}
                                >
                                    ${year}
                                </button>
                        </span>
                        `
                    }).join('')
                }
            </div>
    `
}


// generate the years displayed in the year picker
function getYears(yearStart){
    let start =  yearStart <= 1000 ? 1000 : yearStart ; 
    const years = [];
    for(let i = 0 ; i < 20 ; i++ )
    {
        const value = start + i ;//type === '+' ? i + start : start - i ;
        years.push(value);//type === '+' ? years.push(value) : years.unshift(value) 
    }
        
    return years;
}

const calendarConverter = new CalendarConverter();

// get Today in Ethiopian or Gregorian 
function getToday(isGregorian){
    const currentDate = new Date();
    const etToday = calendarConverter.getETToday();
    
    return isGregorian ?
                {day: currentDate.getDate(), month: currentDate.getMonth(), year: currentDate.getFullYear()} :
                {day: etToday.day, month: etToday.month - 1, year: etToday.year};
}

/* get Gregorian month day count */
function getGregMonthDaysCount(month, year){
    if(month !== 1){
         return MONTHSGREGDAYS[month]; 
    }else{
        return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 29 : 28; // 2nd month has 29 days if the year is leap year
    }
}

/* get Ethiopic month day count */
function getEthMonthDaysCount(month, year){
    if(month !== 12){
         return 30; // all months except the 13th month has 30 days
    }else{
        return ((year + 1) % 4 === 0 ) ? 6 : 5; //13th month has 6 days if the year is leap year     
    }
}

/* get Ethiopic or Gregorian month name */
function getMonthName(isGregorian, month, isAmharic = true){
    return isGregorian ? TEXTS[0]['months'][month] : isAmharic ? TEXTS[1]['months'][month] : TEXTS[2]['months'][month];
}

/* get Ethiopic or Gregorian short month name */
function getShortMonthName(isGregorian, month, isAmharic = true){
    return isGregorian ? TEXTS[0]['months_short'][month] : isAmharic ? TEXTS[1]['months_short'][month] : TEXTS[2]['months_short'][month];
}

/* get the index of the week day for a given Gregorian Date */
function getGregDateWeekDay(year, month, day){
    const gregDate = new Date(year, month, day);
    gregDate.setFullYear(year);
    const weekDay = gregDate.getDay();
    return weekDay;
}

// get the title of the date as [WeekDayName]
function getDateTitle(isGregorian, day, isAmharic = true){
    const texts = isGregorian ? TEXTS[0] : isAmharic ? TEXTS[1] : TEXTS[2];
    return `${texts['weekdays_long'][day.weekDay]}, ${texts['months'][day.month]} ${day.day} , ${day.year}`;
}

/* get the month days for a given Gregorian month and year */
function getMonthDaysGreg(month, year){
    // get the week day index where the given month starts
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    let currentDay = 0 - firstDayOfMonth;
    // generate the month days for the month
    const monthDays = new Array(6).fill([]).map(() => {
        return new Array(7).fill(null).map(() => {
            const monthDay = new Date(year, month, ++currentDay);          
            return {day: monthDay.getDate(),
                    month: monthDay.getMonth(),
                    year: monthDay.getFullYear(),
                    index: currentDay,
                    weekDay: monthDay.getDay(),
                }
        })
    })
    return monthDays;
}

/* get the month days for Ethiopian month and year */
function getMonthDaysEthiopic(month, year){ 
    // get the week day for the first day of a given month and year
    const firstDayOfMonth = calendarConverter.getETMonthStartDay(year, month + 1);
    let currentDay = 0 - firstDayOfMonth;
    let weekDay; 
    // generate two dimensional array containing 6 rows
    // each row contains a date referring to the current, previous or next month
    const monthDays = new Array(6).fill([]).map(() =>{  
        weekDay = 0; // the week day (Ehud, Segno,...) for a given date of the month                           
        return new Array(7).fill(null).map(() =>{
            const ethiopicDay = getEthiopicDay(month, year, ++currentDay);
                return { day: ethiopicDay.day,
                         month: ethiopicDay.month,
                         year: ethiopicDay.year,
                         index: currentDay,
                         weekDay: weekDay++,
                }
            })
        })
    return monthDays;
}

// get ethiopian day
function getEthiopicDay(month, year, currentDay){ 
    let pagumeDays; //get the number of days for 13th month of the year
    if(month !== 0){ 
        pagumeDays = getEthMonthDaysCount(12, year); // takes the same year as the specified month
    }else{
        pagumeDays = getEthMonthDaysCount(12, year - 1); // takes the previous year of the specified month
    }
    const extraDays = 30 + pagumeDays; 
    // get the week day for the first day of a given month and year
    if(month === 0){
        // display days of the previous month for Meskerem
        if(currentDay < 1){
           let prevDays = pagumeDays + currentDay;
            // display days of the 13th month (Pagume)
            if (prevDays > 0){
                return {day: prevDays, month: 12, year: year - 1 };
            }
            // display days of the 12th month (Nehase)
            return {day: 30 + prevDays, month: 11, year: year - 1};
        }
        // display days of the next month 
        if(currentDay > 30){
            return {day: currentDay - 30, month: month + 1, year: year };   
        }
        // display days of the current month (Meskerem)      
        return {day: currentDay, month: month, year: year };

        } else if(month === 11){
            // display days of the previous month for Nehase (12th month)
            if(currentDay < 1){
                return {day: 30 + currentDay, month: month - 1, year: year}; 
            }
            // display days of the next month
            if(currentDay > 30){
                // check if the days count go to next month or first month of next year
                if(currentDay <= extraDays){
                    // display days of the 13th month (Pagume)
                    return {day: currentDay - 30, month: month + 1, year: year };
                }
                // display days of the first month of next year (Meskerem)    
                return {day: currentDay - extraDays, month: 0, year: year + 1};
            }
            // display days of the current month (Nehase)
            return {day: currentDay, month: month, year: year};
        } else if(month === 12){
            // display days of the previous month for Pagume (13th month)
            if(currentDay < 1){
                // display days of the 12th month (Nehase)
                return {day: 30 + currentDay, month: month - 1, year: year}; 
            }
            if(currentDay > pagumeDays){
                // check if the days count go to the 1st month or 2nd month of next year
                if(currentDay <= extraDays){
                    // display days of the 1st month of next year (Meskerem)
                    return {day: currentDay - pagumeDays, month: 0, year: year + 1 };
                    }
                // display days of the 2nd month of next year (Tikimt)
                return {day: currentDay - extraDays, month: 1, year: year + 1 };
            }
                // display days of the current month (Pagume)
                return {day: currentDay, month: month, year: year };
        } else{
            // display the month days for any other month
            // display days of the previous month
            if(currentDay < 1){
                return {day: 30 + currentDay, month: month - 1, year: year}; 
            }
            // display days of the next month    
            if(currentDay > 30){
                return {day: currentDay - 30, month: month + 1, year: year };   
            } 
            // display days of the current month      
            return {day: currentDay, month: month, year: year };
        } 
}