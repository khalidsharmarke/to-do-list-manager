class Calendar extends Date {
    #daysInMonth = [31, function() {

    }, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    createBody() {
        document.getElementById('calendar-body').appendChild(this.fillMonth());
    }
    fillMonth() {
        this.createMonth().getElementsByClassName('day')[this.firstDayInMonth()].textContent = 'first'
    }
    firstDayInMonth() {
        let dayOfWeek = this.getDay()
        let dayOfMonth = parseInt(this.toDateString().split(" ")[2]);

        while (dayOfMonth != 1) {
            if (dayOfWeek == 0) {
                dayOfWeek = 6
            } else {
                dayOfWeek--
            }
            dayOfMonth--
        }
        return dayOfWeek
    }
    createMonth() {
        const month = document.createElement('div')
        month.className = 'month'
        for (let i = 0; i < 5; i++) {
            month.appendChild(this.createWeek())
        }
        return month
    }
    createDay() {
        const day = document.createElement('div')
        day.classMame = 'day'
        return day
    }
    createWeek() {
        const week = document.createElement('div')
        week.className = 'week'
        for (let i = 0; i < 7; i++) {
            week.appendChild(this.createDay())
        }
        return week
    }
}